import { useEpsData } from './useEpsData';
import type { Cycle, Seance, AbsenceProfesseur } from '../types';

/**
 * Nouveau moteur de planification professionnel.
 * Gère le tri des séances et la reprogrammation automatique
 * des séances impactées par une absence.
 */
export function usePlanification() {
  const { state, updateCycle } = useEpsData();

  /**
   * Trie les séances chronologiquement, renumérote l'ordre
   * et marque la dernière séance pour l'évaluation.
   */
  const trierSeances = (seances: Seance[]): Seance[] => {
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
   * Détecte la cadence typique d'un cycle. Utilise la médiane
   * des écarts positifs entre dates pour éviter les valeurs aberrantes.
   */
  const detecterCadence = (seances: Seance[]): number => {
    if (seances.length < 2) return 7;
    const diffs: number[] = [];
    const dates = seances
      .map(s => new Date(s.date).getTime())
      .filter(ts => !isNaN(ts))
      .sort((a, b) => a - b);
    for (let i = 1; i < dates.length; i++) {
      const diff = Math.round((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
      if (diff > 0) diffs.push(diff);
    }
    if (diffs.length === 0) return 7;
    diffs.sort((a, b) => a - b);
    return diffs[Math.floor(diffs.length / 2)] || 7;
  };

  /**
   * Reprogramme un cycle en décalant les séances situées dans
   * l'intervalle d'absence. Les séances sont déplacées par pas
   * de cadence jusqu'à un créneau libre hors absence.
   */
  const reprogrammerCycle = (
    cycle: Cycle,
    absence: AbsenceProfesseur
  ): { cycleModifie: Cycle; nbSeancesReportees: number } => {
    const debut = new Date(absence.dateDebut);
    const fin = new Date(absence.dateFin);
    const seancesTriees = trierSeances(cycle.seances);
    const cadence = detecterCadence(seancesTriees);

    const creneaux = new Set<string>();
    seancesTriees.forEach(s => {
      const heure = s.heure || '09:30';
      creneaux.add(`${s.date}-${heure}`);
    });

    let nb = 0;
    const reprogrammees = seancesTriees.map(seance => {
      const date = new Date(seance.date);
      const heure = seance.heure || '09:30';
      const impactee =
        date >= debut &&
        date <= fin &&
        !seance.locked &&
        (seance as any).absenceOriginId !== absence.id;
      if (!impactee) return seance;
      let candidate = new Date(seance.date);
      let iso: string;
      do {
        candidate.setDate(candidate.getDate() + cadence);
        iso = candidate.toISOString().slice(0, 10);
      } while (
        (candidate >= debut && candidate <= fin) ||
        creneaux.has(`${iso}-${heure}`)
      );
      creneaux.delete(`${seance.date}-${heure}`);
      creneaux.add(`${iso}-${heure}`);
      nb++;
      return {
        ...seance,
        date: iso,
        estReportee: true,
        absenceOriginId: absence.id,
        dateOriginale: seance.date
      } as Seance;
    });

    return {
      cycleModifie: { ...cycle, seances: trierSeances(reprogrammees) },
      nbSeancesReportees: nb
    };
  };

  /**
   * Applique la reprogrammation pour tous les cycles impactés.
   */
  const appliquerPlanification = (absence: AbsenceProfesseur) => {
    let total = 0;
    const cyclesTouches: string[] = [];
    state.cycles.forEach(cycle => {
      const { cycleModifie, nbSeancesReportees } = reprogrammerCycle(cycle, absence);
      if (nbSeancesReportees > 0) {
        updateCycle(cycle.id, {
          seances: cycleModifie.seances,
          updatedAt: new Date().toISOString()
        });
        total += nbSeancesReportees;
        cyclesTouches.push(cycle.id);
      }
    });
    return { nbSeancesReportees: total, cyclesTouches };
  };

  /**
   * Annule la reprogrammation d'une absence en restaurant les
   * dates originales des séances marquées.
   */
  const annulerPlanification = (absence: AbsenceProfesseur) => {
    state.cycles.forEach(cycle => {
      let modifie = false;
      const restituees = cycle.seances.map(seance => {
        if ((seance as any).absenceOriginId === absence.id && (seance as any).dateOriginale) {
          modifie = true;
          return {
            ...seance,
            date: (seance as any).dateOriginale,
            estReportee: undefined,
            absenceOriginId: undefined,
            dateOriginale: undefined
          } as Seance;
        }
        return seance;
      });
      if (modifie) {
        updateCycle(cycle.id, { seances: trierSeances(restituees) });
      }
    });
  };

  return {
    trierSeances,
    detecterCadence,
    reprogrammerCycle,
    appliquerPlanification,
    annulerPlanification
  };
}
