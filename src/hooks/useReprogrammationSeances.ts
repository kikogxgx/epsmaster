import { useEpsData } from './useEpsData';
import type { Cycle, Seance, AbsenceProfesseur } from '../types';

export function useReprogrammationSeances() {
  const { state, updateCycle } = useEpsData();

  /**
   * Trie les séances par date croissante et renumérote leur ordre.
   * La dernière séance est marquée comme due pour l'évaluation.
   */
  const trierEtRenumeroter = (seances: Seance[]): Seance[] => {
    const sorted = [...seances].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sorted.map((s, idx) => ({
      ...s,
      numero: idx + 1,
      evalDue: idx === sorted.length - 1
    }));
  };

  /**
   * Détecte la cadence du cycle (écart en jours entre deux séances consécutives)
   * et retourne 7 par défaut si aucune cadence claire n'est trouvée.
   */
  const detecterCadenceCycle = (seances: Seance[]): number => {
    if (seances.length < 2) return 7;

    const dates = seances
      .map(s => new Date(s.date).getTime())
      .filter(ts => !isNaN(ts))
      .sort((a, b) => a - b);

    if (dates.length < 2) return 7;

    for (let i = 1; i < dates.length; i++) {
      const diff = Math.round((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
      if (diff > 0) return diff;
    }
    return 7;
  };

  /**
   * Reprogramme un cycle en décalant uniquement les séances situées dans l'intervalle
   * d'absence. Chaque séance impactée est déplacée de cadence en cadence jusqu'à
   * trouver un créneau libre hors de l'absence.
   */
  const reprogrammerCycle = (
    cycle: Cycle,
    absence: AbsenceProfesseur
  ): { cycleModifie: Cycle; nbSeancesReportees: number } => {
    const dateDebutAbsence = new Date(absence.dateDebut);
    const dateFinAbsence = new Date(absence.dateFin);

    // Trier les séances pour une manipulation fiable
    const seancesTriees = trierEtRenumeroter(cycle.seances);
    const cadence = detecterCadenceCycle(seancesTriees);

    // Set des créneaux occupés (date-heure)
    const creneaux = new Set<string>();
    seancesTriees.forEach(s => {
      const heure = s.heure || '09:30';
      creneaux.add(`${s.date}-${heure}`);
    });

    let nbReportees = 0;
    const seancesReprogrammees = seancesTriees.map(seance => {
      const dateSeance = new Date(seance.date);
      const heure = seance.heure || '09:30';

      const estImpactee =
        dateSeance >= dateDebutAbsence &&
        dateSeance <= dateFinAbsence &&
        !seance.locked &&
        (seance as any).absenceOriginId !== absence.id;

      if (!estImpactee) return seance;

      let candidate = new Date(seance.date);
      let iso: string;
      do {
        candidate.setDate(candidate.getDate() + cadence);
        iso = candidate.toISOString().slice(0, 10);
      } while (
        (candidate >= dateDebutAbsence && candidate <= dateFinAbsence) ||
        creneaux.has(`${iso}-${heure}`)
      );

      creneaux.delete(`${seance.date}-${heure}`);
      creneaux.add(`${iso}-${heure}`);
      nbReportees++;

      return {
        ...seance,
        date: iso,
        estReportee: true,
        absenceOriginId: absence.id,
        dateOriginale: seance.date
      } as Seance;
    });

    return {
      cycleModifie: { ...cycle, seances: trierEtRenumeroter(seancesReprogrammees) },
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
          const seancesOrdonnees = trierEtRenumeroter(seancesRestituees);
          updateCycle(cycle.id, { seances: seancesOrdonnees });
        }
      });
    }
  };
}
