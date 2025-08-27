import { useEpsData } from './useEpsData';
import type { Cycle, Seance, AbsenceProfesseur } from '../types';

interface SeanceAvecReportage extends Seance {
  estReportee?: boolean;
  absenceOriginId?: string;
  dateOriginale?: string;
}

export function useReprogrammationSeances() {
  const { state, updateCycle } = useEpsData();

  /**
   * Détecte la cadence du cycle en jours (ex: 7 pour hebdomadaire)
   */
  /**
   * Détecte la cadence du cycle (écart en jours entre deux séances consécutives)
   * Si les dates ne permettent pas de calculer un écart positif, on retourne 7 par défaut.
   */
  const detecterCadenceCycle = (seances: Seance[]): number => {
    if (seances.length < 2) return 7;

    // Extraire toutes les dates en millisecondes et les trier du plus ancien au plus récent
    const timestamps = seances
      .map(s => new Date(s.date).getTime())
      .filter(ts => !isNaN(ts))
      .sort((a, b) => a - b);

    if (timestamps.length < 2) return 7;

    // Chercher le premier écart positif entre deux dates consécutives
    let ecartJours = 7;
    for (let i = 1; i < timestamps.length; i++) {
      const diffMs = timestamps[i] - timestamps[i - 1];
      const diffJours = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffJours > 0) {
        ecartJours = diffJours;
        break;
      }
    }
    return ecartJours > 0 ? ecartJours : 7;
  };

  /**
   * Trouve la prochaine occurrence libre selon la cadence
   */
  /**
   * Trouve la prochaine occurrence libre d'un créneau en avançant par pas de cadence.
   * On passe une date de départ (ISO), l'heure, la cadence en jours et un set des créneaux déjà occupés.
   */
  const trouverProchaineOccurrence = (
    dateDepart: string,
    heure: string,
    cadenceJours: number,
    creneauxOccupes: Set<string>
  ): string => {
    const base = new Date(dateDepart);
    // on commence à la date de départ + cadence
    let testDate = new Date(base);
    testDate.setDate(testDate.getDate() + cadenceJours);

    while (true) {
      const iso = testDate.toISOString().slice(0, 10);
      const creneau = `${iso}-${heure}`;
      if (!creneauxOccupes.has(creneau)) {
        return iso;
      }
      // avancer d'une cadence
      testDate.setDate(testDate.getDate() + cadenceJours);
    }
  };

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

    // Copier les séances du cycle dans l'ordre d'origine pour la reprogrammation
    const seancesOriginalOrder: SeanceAvecReportage[] = cycle.seances.map(s => ({ ...s }));

    // Déterminer l'index de la première séance impactée par l'absence
    const impactedIndices: number[] = [];
    for (let i = 0; i < seancesOriginalOrder.length; i++) {
      const seance = seancesOriginalOrder[i];
      const dateSeance = new Date(seance.date);
      const estImpactee =
        dateSeance >= dateDebutAbsence &&
        dateSeance <= dateFinAbsence &&
        dateSeance >= aujourdHui &&
        !seance.locked &&
        (seance as any).absenceOriginId !== absence.id;
      if (estImpactee) impactedIndices.push(i);
    }

    if (impactedIndices.length === 0) {
      return { cycleModifie: { ...cycle }, nbSeancesReportees: 0 };
    }

    const firstImpacted = Math.min(...impactedIndices);

    // Construire un set des créneaux occupés (date-heure) pour détecter les collisions
    const creneauxOccupes = new Set<string>();
    seancesOriginalOrder.forEach(seance => {
      const heure = seance.heure || '09:30';
      creneauxOccupes.add(`${seance.date}-${heure}`);
    });

    // Calculer le motif des écarts entre séances consécutives, trié par date croissante
    const seancesSorted = [...seancesOriginalOrder].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const diffOriginal: number[] = [];
    for (let i = 0; i < seancesSorted.length - 1; i++) {
      const d1 = new Date(seancesSorted[i].date);
      const d2 = new Date(seancesSorted[i + 1].date);
      const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      diffOriginal.push(diff > 0 ? diff : 7);
    }
    if (diffOriginal.length === 0) diffOriginal.push(7);

    // Construire un tableau d'écarts pour chaque séance en répétant le motif
    const diffDays: number[] = [];
    for (let i = 0; i < seancesOriginalOrder.length; i++) {
      diffDays.push(diffOriginal[i % diffOriginal.length]);
    }

    // Préparer un tableau des nouvelles dates
    const newDates: string[] = seancesOriginalOrder.map(s => s.date);
    let nbReportees = 0;

    for (let i = firstImpacted; i < seancesOriginalOrder.length; i++) {
      const seance = seancesOriginalOrder[i];
      const heure = seance.heure || '09:30';
      let candidateDate: Date;
      if (i === firstImpacted) {
        candidateDate = new Date(seance.date);
        candidateDate.setDate(candidateDate.getDate() + diffDays[i]);
      } else {
        candidateDate = new Date(newDates[i - 1]);
        candidateDate.setDate(candidateDate.getDate() + diffDays[i]);
      }
      let candidateIso = candidateDate.toISOString().slice(0, 10);
      // Avancer en respectant le motif jusqu'à trouver un créneau libre et hors intervalle d'absence
      while (
        creneauxOccupes.has(`${candidateIso}-${heure}`) ||
        (candidateDate >= dateDebutAbsence && candidateDate <= dateFinAbsence)
      ) {
        candidateDate.setDate(candidateDate.getDate() + diffDays[i]);
        candidateIso = candidateDate.toISOString().slice(0, 10);
      }
      // Mettre à jour newDates et creneaux
      creneauxOccupes.delete(`${seance.date}-${heure}`);
      newDates[i] = candidateIso;
      creneauxOccupes.add(`${candidateIso}-${heure}`);
      // Marquer les séances dans l'intervalle comme reportées
      if (impactedIndices.includes(i)) {
        seancesOriginalOrder[i].estReportee = true;
        seancesOriginalOrder[i].absenceOriginId = absence.id as any;
        seancesOriginalOrder[i].dateOriginale = seance.date;
        nbReportees++;
      }
    }

    // Appliquer les nouvelles dates et conserver l'ordre d'origine
    const seancesFinal: Seance[] = seancesOriginalOrder.map((s, idx) => ({
      ...s,
      date: newDates[idx]
    }));

    return {
      cycleModifie: { ...cycle, seances: seancesFinal },
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
