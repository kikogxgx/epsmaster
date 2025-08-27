import { useLocalStorage } from './useLocalStorage';
import type { AbsenceProfesseur, RemplacementSeance } from '../types';
import { usePlanification } from './usePlanification';

const newId = () => `abs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export function useAbsencesProfesseur() {
  const { appliquerPlanification, annulerPlanification } = usePlanification();
  
  const [absences, setAbsences] = useLocalStorage<AbsenceProfesseur[]>('eps:absences-prof', []);
  const [remplacements, setRemplacements] = useLocalStorage<RemplacementSeance[]>('eps:remplacements', []);

  /**
   * Valide les dates d'une absence
   */
  const validerDates = (dateDebut: string, dateFin: string): boolean => {
    if (!dateDebut || !dateFin) return false;
    return new Date(dateDebut) <= new Date(dateFin);
  };

  const saveAbsence = (
    data: Omit<AbsenceProfesseur, 'id' | 'createdAt' | 'seancesImpactees'> & { id?: string }
  ) => {
    // Validation des dates
    if (!validerDates(data.dateDebut, data.dateFin)) {
      throw new Error('La date de début doit être antérieure ou égale à la date de fin');
    }

    const id = data.id ?? newId();
    const record: AbsenceProfesseur = {
      ...data,
      id,
      createdAt: data.id && absences.find(a => a.id === id)
        ? absences.find(a => a.id === id)!.createdAt
        : new Date().toISOString(),
      seancesImpactees: []
    };

    setAbsences(prev =>
      prev.some(a => a.id === id)
        ? prev.map(a => (a.id === id ? record : a))
        : [...prev, record]
    );

    return record;
  };

  /**
   * Valide une absence et déclenche la planification
   */
  const validerAbsence = (id: string) => {
    const absence = absences.find(a => a.id === id);
    if (!absence) return { success: false, message: 'Absence introuvable' };

    try {
      // Appliquer la nouvelle planification
      const { nbSeancesReportees } = appliquerPlanification(absence);

      // Mettre à jour le statut de l'absence
      const absenceValidee: AbsenceProfesseur = {
        ...absence,
        statut: 'approuve',
        seancesImpactees: Array(nbSeancesReportees).fill('').map((_, i) => `seance-${id}-${i}`)
      };

      setAbsences(prev => prev.map(a => (a.id === id ? absenceValidee : a)));

      return {
        success: true,
        message: nbSeancesReportees > 0
          ? `✅ Planification ajustée : ${nbSeancesReportees} séance(s) reportée(s).`
          : `✅ Absence validée. Aucune séance à reporter pour cette période.`,
        nbSeancesReportees
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Erreur lors de la planification : ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  };

  /**
   * Refuse une absence
   */
  const refuserAbsence = (id: string) => {
    setAbsences(prev =>
      prev.map(a => (a.id === id ? { ...a, statut: 'refuse' as const } : a))
    );
    
    return {
      success: true,
      message: '❌ Absence refusée.'
    };
  };

  /**
   * Supprime une absence
   */
  const deleteAbsence = (id: string) => {
    // Avant de supprimer l'absence, annuler la planification liée à cette absence
    const absence = absences.find(a => a.id === id);
    if (absence && absence.statut === 'approuve') {
      annulerPlanification(absence);
    }
    setAbsences(prev => prev.filter(a => a.id !== id));
    return { success: true, message: '🗑️ Absence supprimée.' };
  };

  /**
   * Retourne les absences en cours (qui couvrent aujourd'hui)
   */
  const getAbsencesEnCours = () => {
    const today = new Date().toISOString().slice(0, 10);
    return absences.filter(a => 
      a.statut === 'approuve' && 
      a.dateDebut <= today && 
      a.dateFin >= today
    );
  };

  return {
    absences,
    remplacements,
    saveAbsence,
    validerAbsence,
    refuserAbsence,
    deleteAbsence,
    getAbsencesEnCours,
    validerDates
  };
}
