import { useEpsData } from './useEpsData';
import type { Cycle, Seance, AbsenceProfesseur } from '../types';
import { generateSeancesFromMultipleHoraires, trierSeances } from '../utils/planning';

interface SeanceAvecReportage extends Seance {
  estReportee?: boolean;
  absenceOriginId?: string;
  dateOriginale?: string;
}

export function useReprogrammationSeances() {
  const { state, updateCycle } = useEpsData();

  /**
   * Détecte la cadence du cycle (écart en jours entre deux séances consécutives).
   * Si les dates ne permettent pas de calculer un écart positif, on retourne 7 par défaut.
   */
  const detecterCadenceCycle = (seances: Seance[]): number => {
    if (seances.length < 2) return 7;

    const timestamps = seances
      .map((s) => new Date(s.date).getTime())
      .filter((ts) => !isNaN(ts))
      .sort((a, b) => a - b);

    if (timestamps.length < 2) return 7;

    for (let i = 1; i < timestamps.length; i++) {
      const diffMs = timestamps[i] - timestamps[i - 1];
      const diffJours = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffJours > 0) return diffJours;
    }
    return 7;
  };

  /**
   * Reprogramme un cycle à partir de la première séance impactée par l'absence :
   * on conserve l'ordre, on avance les dates sur des créneaux disponibles
   * et on marque les séances déplacées.
   */
  const reprogrammerCycle = (
    cycle: Cycle,
    absence: AbsenceProfesseur
  ): { cycleModifie: Cycle; nbSeancesReportees: number } => {
    const dateDebutAbsence = new Date(absence.dateDebut);
    const dateFinAbsence = new Date(absence.dateFin);
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);

    // Clone + tri croissant
    let seances: SeanceAvecReportage[] = trierSeances(
      cycle.seances.map((s) => ({ ...s }))
    ) as SeanceAvecReportage[];

    // Séances impactées par la fenêtre d'absence
    const impactedIds = new Set<string>();
    seances.forEach((s) => {
      const dateSeance = new Date(s.date);
      const estImpactee =
        dateSeance >= dateDebutAbsence &&
        dateSeance <= dateFinAbsence &&
        dateSeance >= aujourdHui &&
        !s.locked &&
        (s as any).absenceOriginId !== absence.id;
      if (estImpactee) impactedIds.add(s.id);
    });

    if (impactedIds.size === 0) {
      return { cycleModifie: { ...cycle }, nbSeancesReportees: 0 };
    }

    const firstImpactedIndex = seances.findIndex((s) => impactedIds.has(s.id));
    const firstImpactedDate = seances[firstImpactedIndex].date;

    // Horaires de la classe
    const classe = state.classes.find((c) => c.id === cycle.classeId);
    const horaires = classe?.horaires || [];

    // Créneaux potentiels (largement au-delà du besoin)
    const creneauxDisponibles = generateSeancesFromMultipleHoraires({
      startDate: firstImpactedDate,
      nbSeances: cycle.seances.length * 6,
      horaires,
    }).map((s) => ({ date: s.date, heure: s.heure }));

    // Créneaux déjà pris par les séances non déplacées
    const creneauxOccupes = new Set<string>();
    seances.slice(0, firstImpactedIndex).forEach((s) => {
      const h = s.heure || '09:30';
      creneauxOccupes.add(`${s.date}-${h}`);
    });

    const idsADeplacer = seances.slice(firstImpactedIndex).map((s) => s.id);
    let slotIdx = 0;
    let nbReportees = 0;

    for (const id of idsADeplacer) {
      const seance = seances.find((s) => s.id === id)!;
      const oldDate = seance.date;
      const oldHeure = seance.heure || '09:30';

      // Avancer jusqu'à être strictement après l'ancienne date
      while (
        slotIdx < creneauxDisponibles.length &&
        creneauxDisponibles[slotIdx].date <= oldDate
      ) {
        slotIdx++;
      }

      // Prochain créneau libre hors intervalle d'absence et sans collision
      let slot: { date: string; heure?: string } | undefined;
      while (slotIdx < creneauxDisponibles.length) {
        const cand = creneauxDisponibles[slotIdx++];
        const candDate = new Date(cand.date);
        const candHeure = cand.heure || oldHeure;
        const key = `${cand.date}-${candHeure}`;

        if (candDate >= dateDebutAbsence && candDate <= dateFinAbsence) continue;
        if (creneauxOccupes.has(key)) continue;

        slot = { date: cand.date, heure: candHeure };
        break;
      }

      if (!slot) continue;

      // Mise à jour + marquage
      seance.dateOriginale = seance.date;
      seance.date = slot.date;
      seance.heure = slot.heure || oldHeure;
      seance.estReportee = true;
      (seance as any).absenceOriginId = absence.id;

      // Bloquer le créneau désormais utilisé
      creneauxOccupes.add(`${seance.date}-${seance.heure}`);

      nbReportees++;
    }

    // Réordonner après déplacement
    seances = trierSeances(seances) as SeanceAvecReportage[];

    return {
      cycleModifie: { ...cycle, seances },
      nbSeancesReportees: nbReportees,
    };
  };

  /**
   * Applique la reprogrammation sur tous les cycles impactés.
   */
  const appliquerReprogrammation = (absence: AbsenceProfesseur) => {
    let totalSeancesReportees = 0;
    const cyclesModifies: string[] = [];

    state.cycles.forEach((cycle) => {
      const { cycleModifie, nbSeancesReportees } = reprogrammerCycle(cycle, absence);
      if (nbSeancesReportees > 0) {
        updateCycle({
          ...cycle,
          seances: cycleModifie.seances,
          updatedAt: new Date().toISOString(),
        });
        totalSeancesReportees += nbSeancesReportees;
        cyclesModifies.push(cycle.id);
      }
    });

    return { nbSeancesReportees: totalSeancesReportees, cyclesModifies };
  };

  /**
   * Annule la reprogrammation liée à une absence : restaure les dates d'origine.
   */
  const annulerReprogrammation = (absence: AbsenceProfesseur) => {
    state.cycles.forEach((cycle) => {
      let modifie = false;

      const seancesRestituees: Seance[] = cycle.seances.map((seance) => {
        const anyS = seance as any;
        if (anyS.absenceOriginId === absence.id && anyS.dateOriginale) {
          modifie = true;
          const restored: Seance = { ...seance, date: anyS.dateOriginale };
          delete (restored as any).dateOriginale;
          delete (restored as any).estReportee;
          delete (restored as any).absenceOriginId;
          return restored;
        }
        return seance;
      });

      if (modifie) {
        updateCycle({
          ...cycle,
          seances: trierSeances(seancesRestituees),
          updatedAt: new Date().toISOString(),
        });
      }
    });
  };

  return {
    detecterCadenceCycle,
    appliquerReprogrammation,
    reprogrammerCycle,
    annulerReprogrammation,
  };
}
