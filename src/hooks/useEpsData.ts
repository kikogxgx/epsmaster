import { useLocalStorage } from './useLocalStorage';
import type { Classe, Eleve, Cycle } from '../types';
import seeds from '../data/seeds';
import objectifs from '../data/objectifs';
import {
  generateSeancesFromHoraire,
  generateSeancesFromMultipleHoraires
} from '../utils/planning';

// Génère un id unique (date + aléatoire)
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// Structure globale du state
export interface EpsState {
  classes: Classe[];
  eleves: Eleve[];
  cycles: Cycle[];
}

/**
 * Hook centralisé pour gérer les données EPS (localStorage).
 */
export function useEpsData() {
  const [state, setState] = useLocalStorage<EpsState>('eps:data', seeds);

  // ---------- Classes ----------
  const addClass = (classe: Classe) =>
    setState(prev => ({ ...prev, classes: [...prev.classes, classe] }));

  const updateClass = (id: string, updates: Partial<Classe>) =>
    setState(prev => ({
      ...prev,
      classes: prev.classes.map(c => (c.id === id ? { ...c, ...updates } : c))
    }));

  const deleteClass = (id: string) =>
    setState(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== id),
      eleves: prev.eleves.filter(e => e.classeId !== id),
      cycles: prev.cycles.filter(cy => cy.classeId !== id)
    }));

  // ---------- Élèves ----------
  const addEleve = (eleve: Eleve) =>
    setState(prev => ({ ...prev, eleves: [...prev.eleves, eleve] }));

  const updateEleve = (id: string, updates: Partial<Eleve>) =>
    setState(prev => ({
      ...prev,
      eleves: prev.eleves.map(e => (e.id === id ? { ...e, ...updates } : e))
    }));

  const deleteEleve = (id: string) =>
    setState(prev => ({
      ...prev,
      eleves: prev.eleves.filter(e => e.id !== id)
    }));

  // ---------- Cycles ----------
  interface CreateCycleParams {
    classeId?: string;
    niveau?: string;
    aps: string;
    module: 1 | 2 | 3 | 4 | 5 | 6;
    semestre: 1 | 2;
    nbSeances: number;
    startDate: string;
  }

  const createCycle = ({
    classeId,
    niveau,
    aps,
    module,
    semestre,
    nbSeances,
    startDate
  }: CreateCycleParams) => {
    setState(prev => {
      const classesTarget: Classe[] = classeId
        ? prev.classes.filter(c => c.id === classeId)
        : prev.classes.filter(c => c.niveau === niveau);

      const newCycles: Cycle[] = [];

      classesTarget.forEach(cls => {
        if (!cls.horaires || cls.horaires.length === 0) return;

        // Gérer un ou plusieurs horaires: utiliser generateSeancesFromMultipleHoraires quand plusieurs créneaux
        let seancesRaw;
        if (cls.horaires.length > 1) {
          seancesRaw = generateSeancesFromMultipleHoraires({
            startDate,
            nbSeances,
            horaires: cls.horaires
          });
        } else {
          seancesRaw = generateSeancesFromHoraire({
            startDate,
            nbSeances,
            horaire: cls.horaires[0]
          });
        }

        const seances = seancesRaw.map(s => ({
          ...s,
          cycleId: '', // temporaire
          theme: '',
          listeAppel: [],
          cahier: {}
        }));

        // Récupérer l'objet module en fonction du niveau de la classe et du numéro de module.
        // On cherche d'abord dans le niveau de la classe. Si le module n'existe pas,
        // on parcourt les autres niveaux pour trouver un module avec le même numéro.
        const niveauObj: any = (objectifs as any)[cls.niveau] || {};
        let moduleObj: any = niveauObj[module];
        if (!moduleObj) {
          // Chercher dans tous les niveaux
          const niveauxAll = Object.keys(objectifs) as any[];
          for (const niv of niveauxAll) {
            const obj = (objectifs as any)[niv];
            if (obj && obj[module]) {
              moduleObj = obj[module];
              break;
            }
          }
        }
        // Si toujours pas trouvé, prendre le premier module du niveau de la classe
        if (!moduleObj) {
          const modulesDisponibles = Object.values(niveauObj);
          moduleObj = modulesDisponibles.length > 0 ? modulesDisponibles[0] : null;
        }
        // Chercher dans ce module l'APS correspondant au paramètre aps. Utiliser le premier APS si non trouvé
        let apsObj: any = moduleObj?.aps?.find((a: any) => a.aps === aps);
        if (!apsObj) {
          apsObj = moduleObj?.aps?.[0];
        }
        const themes: string[] = apsObj?.seances || [];

        seances.forEach((s, idx) => {
          s.id = generateId();
          // Affecter un thème différent à chaque séance. Si le nombre de séances dépasse celui des thèmes, répéter la dernière thématique.
          s.theme = themes[idx] || themes[themes.length - 1] || `Séance ${idx + 1}`;
          // Marquer la dernière séance comme due pour l'évaluation
          if (idx === seances.length - 1) {
            (s as any).evalDue = true;
          } else {
            (s as any).evalDue = false;
          }
          (s as any).statut = 'Planifiée';
        });

        const cycleId = generateId();
        seances.forEach(s => (s.cycleId = cycleId));

        newCycles.push({
          id: cycleId,
          classeId: cls.id,
          classeNom: cls.nom,
          niveau: cls.niveau,
          aps,
          module,
          semestre,
          nbSeances,
          seances,
          statut: 'planifié'
        });
      });

      return { ...prev, cycles: [...prev.cycles, ...newCycles] };
    });
  };

  const updateCycle = (id: string, updates: Partial<Cycle>) =>
    setState(prev => ({
      ...prev,
      cycles: prev.cycles.map(cy => (cy.id === id ? { ...cy, ...updates } : cy))
    }));

  // ------- NOUVEAU : supprimer un cycle -------
  const deleteCycle = (id: string) =>
    setState(prev => ({
      ...prev,
      cycles: prev.cycles.filter(cy => cy.id !== id)
    }));

  // ---------- Exports ----------
  return {
    state,
    // classes
    addClass,
    updateClass,
    deleteClass,
    // élèves
    addEleve,
    updateEleve,
    deleteEleve,
    // cycles
    createCycle,
    updateCycle,
    deleteCycle
  };
}
