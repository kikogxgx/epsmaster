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
   * selon le motif des écarts entre séances. On marque les séances touchées par l'absence comme reportées.
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
      cycle.seances.map(s => ({ ...s }))
    ) as SeanceAvecReportage[];

    // Identifier les séances impactées
    const impactedIds = new Set<string>();
    seances.forEach(s => {
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

    const firstImpactedIndex = seances.findIndex(s => impactedIds.has(s.id));
    const firstImpactedDate = seances[firstImpactedIndex].date;

    // Récupérer les horaires de la classe associée
    const classe = state.classes.find(c => c.id === cycle.classeId);
    const horaires = classe?.horaires || [];

    // Générer un grand nombre de créneaux disponibles après la séance impactée
    const creneauxDisponibles = generateSeancesFromMultipleHoraires({
      startDate: firstImpactedDate,
      nbSeances: cycle.seances.length * 6,
      horaires
    }).map(s => ({ date: s.date, heure: s.heure }));

    // Set des créneaux occupés par les séances non déplacées
    const creneauxOccupes = new Set<string>();
    seances.slice(0, firstImpactedIndex).forEach(s => {
      const h = s.heure || '09:30';
      creneauxOccupes.add(`${s.date}-${h}`);
    });

    let slotIdx = 0;
    let nbReportees = 0;
    let i = firstImpactedIndex;
    while (i < seances.length) {
      let seance = seances[i];
      const oldDate = seance.date;
      const oldHeure = seance.heure || '09:30';

      // Avancer dans la liste de créneaux pour être sûr d'être après la date actuelle
      while (slotIdx < creneauxDisponibles.length && creneauxDisponibles[slotIdx].date <= oldDate) {
        slotIdx++;
      }

      // Chercher le prochain créneau libre hors absence et sans collision
      let slot;
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
      if (!slot) break;

      // Mettre à jour la séance et les créneaux occupés
      seance.date = slot.date;
      seance.heure = slot.heure;
      creneauxOccupes.add(`${slot.date}-${slot.heure}`);

      if (impactedIds.has(seance.id)) {
        seance.estReportee = true;
        seance.absenceOriginId = absence.id as any;
        seance.dateOriginale = oldDate;
        nbReportees++;
      }

      // Réordonner pour maintenir la numérotation
      seances = trierSeances(seances) as SeanceAvecReportage[];
      i = seances.findIndex(s => s.id === seance.id) + 1;
    }

    return {
      cycleModifie: { ...cycle, seances },
      nbSeancesReportees: nbReportees
    };
  };

  /**
   * Applique la reprogrammation pour tous les cycles impactés
   */
  const appliquerReprogrammation = (absence: AbsenceProfesseur) => {
    let totalSeancesReportees = 0;
    const cyclesModifies: string[] = [];

    state.cycles.forEach(cycle => {
      const { cycleModifie, nbSeancesReportees } = reprogrammerCycle(cycle, absence);
      
      if (nbSeancesReportees > 0) {
        updateCycle(cycle.id, { 
          seances: cycleModifie.seances,
          updatedAt: new Date().toISOString()
        });
        totalSeancesReportees += nbSeancesReportees;
        cyclesModifies.push(cycle.id);
      }
    });

    return {
      nbSeancesReportees: totalSeancesReportees,
      cyclesModifies
    };
  };

  return {
    appliquerReprogrammation,
    reprogrammerCycle,
    /**
     * Annule la reprogrammation liée à une absence en restaurant les dates d'origine
     * pour les séances qui ont été reportées par cette absence.
     */
    annulerReprogrammation: (absence: AbsenceProfesseur) => {
      // Pour chaque cycle, restaurer les dates des séances qui ont été reportées par cette absence
      state.cycles.forEach(cycle => {
        let modifie = false;
        const seancesRestituees = cycle.seances.map(seance => {
          if ((seance as any).absenceOriginId === absence.id && (seance as any).dateOriginale) {
            modifie = true;
            return {
              ...seance,
              date: (seance as any).dateOriginale,
              // Nettoyer les marqueurs de report
              estReportee: undefined,
              absenceOriginId: undefined,
              dateOriginale: undefined
            } as Seance;
          }
          return seance;
        });
        if (modifie) {
          updateCycle(cycle.id, { seances: seancesRestituees });
        }
      });
    }
  };
}
