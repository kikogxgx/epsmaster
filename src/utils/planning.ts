import type { Horaire, Seance, Cycle, Classe, Niveau } from '../types';
import objectifs from '../data/objectifs';

/**
 * Génère un tableau de séances à partir d'une date et d'horaires multiples.
 * Si plusieurs horaires sont disponibles, utilise le premier par défaut.
 */
export function generateSeancesFromHoraire({
  startDate,
  nbSeances,
  horaire
}: {
  startDate: string;
  nbSeances: number;
  horaire: Horaire;
}): Seance[] {
  /**
   * Pour une classe avec un seul horaire, la première séance doit
   * être programmée le premier jour correspondant à `horaire.weekday`
   * tombant à partir de `startDate`. Si `startDate` est déjà sur le
   * bon jour de la semaine, on commence ce jour-là, sinon on décale
   * jusqu'au prochain jour de la semaine.
   */
  const seances: Seance[] = [];
  const start = new Date(startDate);
  // Calculer le décalage en jours jusqu'au jour de la semaine souhaité
  const dayDiff = (horaire.weekday - start.getDay() + 7) % 7;
  const firstDate = new Date(start);
  firstDate.setDate(start.getDate() + dayDiff);
  
  for (let i = 0; i < nbSeances; i++) {
    const d = new Date(firstDate);
    d.setDate(firstDate.getDate() + i * 7);
    const dateIso = d.toISOString().split('T')[0];
    seances.push({
      id: '',
      cycleId: '',
      numero: i + 1,
      date: dateIso,
      heure: horaire.start,
      theme: '',
      locked: false,
      listeAppel: [],
      cahier: {},
      evalDue: false,
      statut: 'Planifiée'
    });
  }
  return seances;
}

/**
 * Nouvelle fonction pour gérer plusieurs horaires
 * Distribue les séances sur les différents horaires disponibles
 */
export function generateSeancesFromMultipleHoraires({
  startDate,
  nbSeances,
  horaires
}: {
  startDate: string;
  nbSeances: number;
  horaires: Horaire[];
}): Seance[] {
  if (horaires.length === 0) return [];
  
  // Si un seul horaire, utiliser la fonction existante
  if (horaires.length === 1) {
    return generateSeancesFromHoraire({
      startDate,
      nbSeances,
      horaire: horaires[0]
    });
  }

  // Avec plusieurs horaires, créer toutes les dates possibles puis prendre les N premières
  const allDates: { date: string; horaire: Horaire }[] = [];
  const start = new Date(startDate);
  const maxWeeks = Math.ceil(nbSeances / horaires.length) + 2; // Un peu de marge

  for (let week = 0; week < maxWeeks; week++) {
    for (const horaire of horaires) {
      const dayDiff = (horaire.weekday - start.getDay() + 7) % 7;
      const seanceDate = new Date(start);
      seanceDate.setDate(start.getDate() + dayDiff + (week * 7));
      
      allDates.push({
        date: seanceDate.toISOString().split('T')[0],
        horaire: horaire
      });
    }
  }

  // Trier par date et prendre les N premières
  allDates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const selectedDates = allDates.slice(0, nbSeances);

  return selectedDates.map((item, index) => ({
    id: '',
    cycleId: '',
    numero: index + 1,
    date: item.date,
    heure: item.horaire.start,
    theme: '',
    locked: false,
    listeAppel: [],
    cahier: {},
    evalDue: false,
    statut: 'Planifiée'
  }));
}

/**
 * Modifie la fonction de création en bloc pour utiliser plusieurs horaires
 */
export function bulkCreateCyclesByNiveau({
  niveau,
  module,
  aps,
  semestre,
  nbSeances,
  startDate,
  classes
}: {
  niveau: Niveau;
  module: 1 | 2 | 3 | 4 | 5 | 6;
  aps: string;
  semestre: 1 | 2;
  nbSeances: number;
  startDate: string;
  classes: Classe[];
}): Cycle[] {
  const newCycles: Cycle[] = [];

  classes
    .filter((c) => c.niveau === niveau)
    .forEach((cls) => {
      if (!cls.horaires || cls.horaires.length === 0) {
        return;
      }

      // Utiliser la nouvelle fonction pour gérer plusieurs horaires
      const seances = generateSeancesFromMultipleHoraires({
        startDate,
        nbSeances,
        horaires: cls.horaires
      });

      // Récupérer l'objet module en fonction du niveau et du numéro de module. Si
      // l'entrée n'existe pas (par exemple, modules non définis pour TC), on utilise
      // le premier module disponible pour ce niveau en guise de fallback.
      const niveauObj: any = (objectifs as any)[niveau] || {};
      let moduleObj: any = niveauObj[module];
      if (!moduleObj) {
        const modulesDisponibles = Object.values(niveauObj);
        moduleObj = modulesDisponibles.length > 0 ? modulesDisponibles[0] : null;
      }
      // Chercher l'APS correspondant au paramètre aps. Si absent, prendre le premier APS.
      let apsObj: any = moduleObj?.aps?.find((a: any) => a.aps === aps);
      if (!apsObj) {
        apsObj = moduleObj?.aps?.[0];
      }
      const themes: string[] = apsObj?.seances || [];

      seances.forEach((s, idx) => (s.theme = themes[idx] || `Séance ${idx + 1}`));

      const id = `${cls.id}-${module}-${Date.now()}`;
      seances.forEach((s) => (s.cycleId = id));

      newCycles.push({
        id,
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

  return newCycles;
}

/**
 * Trie les séances par date chronologique et met à jour leur numérotation.
 * Utile après un repositionnement de séances afin de conserver des numéros
 * cohérents avec l'ordre réel.
 */
export function trierSeances(seances: Seance[]): Seance[] {
  return [...seances]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((s, idx) => ({ ...s, numero: idx + 1 }));
}
