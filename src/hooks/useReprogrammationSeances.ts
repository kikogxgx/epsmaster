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
   * Reprogramme un cycle avec glissement complet des séances à partir de la première séance impactée.
   * Les séances sont repositionnées en conservant l'ordre d'origine mais en avançant les dates
   * selon les créneaux disponibles. On marque les séances décalées comme reportées.
   */
  const reprogrammerCycle = (
    cycle: Cycle,
    absence: AbsenceProfesseur
  ): { cycleModifie: Cycle; nbSeancesReportees: number } => {
    const dateDebutAbsence = new Date(absence.dateDebut);
    const dateFinAbsence = new Date(absence.dateFin);
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);

    // Cloner et trier les séances par date croissante
    let seances: SeanceAvecReportage[] = trierSeances(
      cycle.seances.map((s) => ({ ...s }))
    ) as SeanceAvecReportage[];

    // Identifier les séances impactées
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

    // Récupérer les horaires de la classe associée
    const classe = state.classes.find((c) => c.id === cycle.classeId);
    const horaires = classe?.horaires || [];

    // Générer des créneaux disponibles APRÈS la première séance impactée
    const creneauxDisponibles = generateSeancesFromMultipleHoraires({
      startDate: firstImpactedDate,
      nbSeances: cycle.seances.length * 6,
      horaires,
    }).map((s) => ({ date: s.date, heure: s.heure }));

    // Set des créneaux occupés par les séances non déplacées
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

      // Avancer dans la liste jusqu'à être strictement après l'ancienne date
      while (
        slotIdx < creneauxDisponibles.length &&
        creneauxDisponibles[slotIdx].date <= oldDate
      ) {
        slotIdx++;
      }

      // Chercher le prochain créneau libre hors période d'absence et sans collision
      let slot: { date: string; heure?: string } | undefined;
      while (slotIdx < creneauxDisponibles.length) {
        const cand = creneauxDisponibles[slotIdx++];
        const candDate = new Date(cand.date);
        const candHeure = cand.heure || oldHeure;
        const key = `${cand.date}-${candHeure}`;

        // Éviter la période d'absence et les collisions
        if (candDate >= dateDebutAbsence && candDate <= dateFinAbsence) continue;
        if (creneauxOccupes.has(key)) continue;

        slot = { date: cand.date, heure: candHeure };
        break;
      }

      // Si aucun créneau trouvé, on laisse la séance telle quelle
      if (!slot) continue;

      // Mettre à jour la séance avec le nouveau créneau + marquage
      seance.dateOriginale = seance.date;
      seance.date = slot.date;
      seance.heure = slot.heure || oldHeure;
      seance.estReportee = true;
      (seance as any).absenceOriginId = absence.id;

      // Marquer le créneau comme occupé
      creneauxOccupes.add(`${seance.date}-${seance.heure}`);

      nbReportees++;
    }

    // Réordonner pour maintenir la numérotation/ordre logique
    seances = trierSeances(seances) as SeanceAvecReportage[];

    return {
      cycleModifie: { ...cycle, seances },
      nbSeancesReportees: nbReportees,
    };
  };

  /**
   * Applique la reprogrammation pour tous les cycles impactés
   */
  const appliquerReprogrammation = (absence: AbsenceProfesseur) => {
    let totalSeancesReportees = 0;
    const cyclesModifies: string[] = [];

    state.cycles.forEach((cycle) => {
      const { cycleModifie, nbSeancesReportees } = reprogrammerCycle(cycle, absence);

      if (nbSeancesReportees > 0) {
        // Signature d'updateCycle : on met à jour le cycle complet
        updateCycle({
          ...cycle,
          seances: cycleModifie.seances,
          updatedAt: new Date().toISOString(),
        });
        totalSeancesReportees += nbSeancesReportees;
        cyclesModifies.push(cycle.id);
      }
    });

    return {
      nbSeancesReportees: totalSeancesReportees,
      cyclesModifies,
    };
  };

  /**
   * Annule la reprogrammation liée à une absence en restaurant les dates d'origine
   * pour les séances qui ont été reportées par cette absence.
   */
  const annulerReprogrammation = (absence: AbsenceProfesseur) => {
    state.cycles.forEach((cycle) => {
      let modifie = false;

      const seancesRestituees: Seance[] = cycle.seances.map((seance) => {
        const anyS = seance as any;
        if (anyS.absenceOriginId === absence.id && anyS.dateOriginale) {
          modifie = true;
          const restored: Seance = {
            ...seance,
            date: anyS.dateOriginale,
          };
          // Nettoyer les marqueurs
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
    appliquerReprogrammation,
    reprogrammerCycle,
    annulerReprogrammation,
  };
}
