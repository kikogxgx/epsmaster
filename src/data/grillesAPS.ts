import { Niveau } from '../types';

export type APS = 'Athlétisme' | 'Sports collectifs' | 'Gymnastique';

export interface SousCritere {
  id: string;
  label: string;
  bareme: Record<Niveau, number>;
}

export interface Critere {
  id: string;
  titre: string;
  definition: string;
  outils: string;
  bareme: Record<Niveau, number>;
  sousCriteres?: SousCritere[];
}

const commun: Critere[] = [
  {
    id: 'D',
    titre: 'Connaissances conceptuelles / procédurales',
    definition:
      'Concepts et termes relatifs à l’APS support. Règlement de l’activité. Connaissances scientifiques et physiologiques spécifiques à l’échauffement et à l’entraînement.',
    outils: 'Questions–réponses (oral & écrit)',
    bareme: { TC: 3, '1ère Bac': 3, '2ème Bac': 3 }
  },
  {
    id: 'E',
    titre: 'Connaissances comportementales (attitudes)',
    definition:
      'Participation effective à l’APS. Comportement au sein du groupe, autonomie. Responsabilité (arbitrage, organisation, entraînement), respect d’autrui et des règles, assiduité/tenue.',
    outils: 'Observation directe de l’élève sur l’ensemble du cycle d’apprentissage',
    bareme: { TC: 5, '1ère Bac': 4, '2ème Bac': 3 }
  }
];

export const grillesAPS: Record<APS, Critere[]> = {
  'Athlétisme': [
    {
      id: 'A1',
      titre: 'Habileté motrice',
      definition: 'produit',
      outils: 'Chronomètre, Décamètre (annexe N°3)',
      bareme: { TC: 6, '1ère Bac': 7, '2ème Bac': 7 }
    },
    {
      id: 'A2',
      titre: 'Comportement moteur',
      definition: 'performance',
      outils: 'Chronomètre, Décamètre (annexe N°3)',
      bareme: { TC: 6, '1ère Bac': 6, '2ème Bac': 7 }
    },
    ...commun
  ],
  'Sports collectifs': [
    {
      id: 'B1',
      titre: 'Capacité sportive & habileté motrice',
      definition: 'produit du comportement physique',
      outils: 'Grille d’observation',
      bareme: { TC: 0, '1ère Bac': 0, '2ème Bac': 0 },
      sousCriteres: [
        {
          id: 'B1a',
          label: 'individuelles',
          bareme: { TC: 6, '1ère Bac': 6, '2ème Bac': 7 }
        },
        {
          id: 'B1b',
          label: 'collectives',
          bareme: { TC: 6, '1ère Bac': 7, '2ème Bac': 7 }
        }
      ]
    },
    ...commun
  ],
  'Gymnastique': [
    {
      id: 'C1',
      titre: 'Capacité sportive & habileté motrice',
      definition: 'produit du comportement physique',
      outils: 'Grille d’observation (annexe N°4)',
      bareme: { TC: 12, '1ère Bac': 13, '2ème Bac': 14 }
    },
    ...commun
  ]
};

export function resolveAPS(input: string): APS {
  const v = input.trim().toLowerCase();
  if (v.includes('gym')) return 'Gymnastique';
  if (
    v.includes('foot') ||
    v.includes('collect') ||
    v.includes('basket') ||
    v.includes('hand') ||
    v.includes('volley')
  ) {
    return 'Sports collectifs';
  }
  return 'Athlétisme';
}
