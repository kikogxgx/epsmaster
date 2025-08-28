// src/data/objectifs.ts

export type Niveau = 'TC' | '1ère Bac' | '2ème Bac';
export type ModuleNumero = 1 | 2 | 3 | 4 | 5 | 6;

export interface APSObjectifs {
  aps: string; // ex. "Basket-ball", "Volleyball", "Athlétisme — Course de vitesse", ...
  seances: string[]; // 12 objectifs/séances
}

export interface ModuleObjectifs {
  numero: ModuleNumero;
  nom: string; // intitulé de module (corrigé selon OP 2007)
  aps: APSObjectifs[];
}

// Mappage des modules vers les niveaux selon votre structure
const MODULE_TO_NIVEAU: Record<ModuleNumero, Niveau> = {
  1: 'TC',
  2: 'TC', 
  3: '1ère Bac',
  4: '1ère Bac',
  5: '2ème Bac',
  6: '2ème Bac'
};

const MODULES_DATA: Record<ModuleNumero, ModuleObjectifs> = {
  // ────────────────────────────────────────────────────────────────────────────
  1: {
    numero: 1,
    nom: "Équilibre moteur et intégration par le sport",
    aps: [
      {
        aps: "Basket-ball",
        seances: [
          "Détecter les niveaux pratiques individuels et collectifs en basketball.",
          "Connaître l'APS (définition, règles, technique, tactique).",
          "Garder la balle par des passes face à une défense et tenter un tir.",
          "Dribbler et conclure par un tir.",
          "Échanges en supériorité offensive et tir réussi.",
          "Échanges en supériorité offensive et tir réussi (suite).",
          "Montée rapide face à une défense non organisée pour marquer.",
          "Contre-attaque face à une défense non organisée pour marquer.",
          "Utiliser les couloirs latéraux pour marquer.",
          "Fixer la défense dans une zone et jouer dans l'autre (supériorité).",
          "Match dirigé (préparation au test).",
          "Évaluation des niveaux pratiques (individuel/collectif)."
        ],
      },
      {
        aps: "Volleyball",
        seances: [
          "Détecter le niveau initial (service, réception, passe, attaque).",
          "Connaître les règles et rotations.",
          "Réception par manchette.",
          "Passe haute orientée vers l'attaquant.",
          "Service par-dessous régulier.",
          "Service par-dessus et organisation de la réception.",
          "Enchaîner réception – passe – attaque.",
          "Réaliser une attaque sécurisée.",
          "Bloc + défense avec couverture.",
          "Stratégie simple de service/attaque collective.",
          "Match dirigé.",
          "Évaluation en match officiel."
        ],
      },
      {
        aps: "Football",
        seances: [
          "Détecter le niveau en match.",
          "Contrôle au sol, orientation vers la cible et tir.",
          "Contrôle aérien, orientation vers espace libre et tir.",
          "Contrôle orienté au sol + tir.",
          "Contrôler en mouvement une balle au sol, orienter et tirer.",
          "Contrôler en mouvement une balle en l'air, orienter et tirer.",
          "Conduite de balle + passe courte pour attaquer.",
          "Conduite de balle + passe longue pour attaquer.",
          "Contrôler/conduire puis passe longue pour attaquer.",
          "Contrôler/conduire puis passe en l'air pour attaquer.",
          "Contrôle aérien, passe courte et tir.",
          "Évaluation sommative (7c7)."
        ],
      },
      {
        aps: "Handball",
        seances: [
          "Détecter le niveau individuel et collectif.",
          "Réaliser différents types de passes en situation.",
          "Donner et réceptionner en mouvement.",
          "Jouer en mouvement jusqu'à la zone de marque et tirer.",
          "Passes rapides en supériorité numérique.",
          "Se démarquer dans les zones libres.",
          "Respecter son poste et avancer collectivement.",
          "Pré-test.",
          "Défendre puis organiser une contre-attaque.",
          "Choisir passe/dribble en égalité numérique.",
          "Appui/soutien pour favoriser l'échange de balle.",
          "Évaluation en match (7c7)."
        ],
      },
      {
        aps: "Gymnastique au sol",
        seances: [
          "Évaluation diagnostique (niveau gymnique).",
          "Éléments de liaison — difficulté A.",
          "Éléments de liaison — difficulté A (suite).",
          "Éléments — difficulté B.",
          "Éléments — difficulté B (suite).",
          "Éléments — difficulté C avec parade.",
          "Éléments — difficulté C avec parade (suite).",
          "Mini-enchaînement (2A + 2B).",
          "Mini-enchaînement (2A + 1B + 1C).",
          "Enchaînement (2A + 2B + 1C).",
          "Pré-évaluation : (2A + 3B + 2C).",
          "Évaluation sommative (enchaînement complet)."
        ],
      },
      {
        aps: "Athlétisme — Course de vitesse",
        seances: [
          "Test d'observation.",
          "Position correcte des appuis au départ.",
          "Réaction rapide au signal.",
          "Réagir aux signaux visuels/auditifs.",
          "Placement par rapport au starting-block.",
          "Identifier le pied de poussée.",
          "Redressement progressif + synchronisation.",
          "Course rectiligne (appui du pied).",
          "Course à rythme variable.",
          "Bon départ + redressement + course rythmique.",
          "Bon départ + redressement + course axée.",
          "Évaluation (80m G / 60m F)."
        ],
      },
      {
        aps: "Athlétisme — Course de durée",
        seances: [
          "Déterminer la VMA (Luc Léger).",
          "25' à 70% VMA.",
          "20' à 75% VMA.",
          "15' à 80% VMA.",
          "2×12' à 85% VMA.",
          "3×8' à 85% VMA.",
          "2×5' à 90% VMA.",
          "3×3' à 95% VMA.",
          "2×(15/15s) à 100% VMA.",
          "3×(10/10s) à 110% VMA.",
          "Pré-test (1000m G / 600m F).",
          "Évaluation (1000m G / 600m F)."
        ],
      },
      {
        aps: "Athlétisme — Lancer de poids",
        seances: [
          "Détecter le niveau initial.",
          "Mobiliser les ressources musculaires.",
          "Tenir l'engin correctement (contre le cou).",
          "Construire une forme de lancer adaptée.",
          "Obtenir une vitesse horizontale maximale.",
          "Synchroniser membres inférieurs/supérieurs.",
          "Contrôler épaules/appuis à la réception.",
          "Évaluation intermédiaire.",
          "Angle d'envol optimal (35°–45°).",
          "Lancer droit avec variantes.",
          "Enchaîner toutes les phases du lancer.",
          "Évaluation finale (4kg G / 3kg F)."
        ],
      },
      {
        aps: "Athlétisme — Saut en longueur",
        seances: [
          "Évaluation diagnostique.",
          "Course d'élan + impulsion sur planche.",
          "Optimiser la course d'élan.",
          "Ajuster le pied d'appel.",
          "Liaison course/impulsion sans perte.",
          "Saut avec angle optimal.",
          "Suspension avec ouverture.",
          "Suspension avec ramené.",
          "Réception vers l'avant.",
          "Pré-test global.",
          "Saut réglementaire complet.",
          "Évaluation finale."
        ],
      }
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  2: {
    numero: 2,
    nom: "Gestion de l'effort physique",
    aps: [
      {
        aps: "Basket-ball",
        seances: [
          "Déterminer le niveau initial (basketball).",
          "Rappels règles/techniques/tactique de base.",
          "Passes pour conserver la balle face à la défense.",
          "Dribble efficace + tir.",
          "Supériorité numérique : échanges + tir réussi.",
          "Supériorité numérique : échanges + tir (suite).",
          "Montée rapide en égalité pour marquer.",
          "Contre-attaque face à défense non organisée.",
          "Utiliser les couloirs latéraux pour progresser.",
          "Fixer la défense et jouer ailleurs.",
          "Match dirigé d'intégration.",
          "Évaluation des niveaux (indiv/collectif).",
        ],
      },
      {
        aps: "Volleyball",
        seances: [
          "Observer le niveau initial.",
          "Règles et rotations.",
          "Réception manchette.",
          "Passe haute correcte.",
          "Service par-dessous régulier.",
          "Service par-dessus efficace.",
          "Réception – passe – attaque.",
          "Attaque dirigée.",
          "Bloc et défense collectifs.",
          "Stratégie collective service/attaque.",
          "Match dirigé.",
          "Évaluation en match officiel.",
        ],
      },
      {
        aps: "Football",
        seances: [
          "Observer le niveau en match.",
          "Contrôle au sol + tir.",
          "Contrôle aérien + tir.",
          "Contrôle orienté + tir.",
          "Contrôler en mouvement (sol) + tir.",
          "Contrôler en mouvement (air) + tir.",
          "Conduite + passe courte.",
          "Conduite + passe longue.",
          "Contrôler/conduire + passe longue.",
          "Contrôler/conduire + passe en l'air.",
          "Contrôle en l'air + passe courte + tir.",
          "Évaluation collective en match.",
        ],
      },
      {
        aps: "Handball",
        seances: [
          "Détecter niveau individuel/collectif.",
          "Différents types de passes.",
          "Donner/recevoir en mouvement.",
          "Jouer jusqu'à la zone adverse et tirer.",
          "Passes rapides en supériorité.",
          "Se démarquer pour progresser.",
          "Respecter son poste et attaquer collectivement.",
          "Pré-test.",
          "Défendre puis contre-attaquer.",
          "Choisir passe/dribble (égalité).",
          "Appui/soutien pour faciliter l'attaque.",
          "Évaluation finale en match.",
        ],
      },
      {
        aps: "Gymnastique au sol",
        seances: [
          "Évaluation diagnostique (niveau gymnique).",
          "Éléments de liaison — A.",
          "Éléments de liaison — A (suite).",
          "Éléments — B.",
          "Éléments — B (suite).",
          "Éléments — C avec parade.",
          "Éléments — C avec parade (suite).",
          "Mini-enchaînement (2A + 2B).",
          "Mini-enchaînement (2A + 1B + 1C).",
          "Enchaînement (2A + 2B + 1C).",
          "Pré-évaluation : (2A + 3B + 2C).",
          "Évaluation finale (enchaînement complet).",
        ],
      },
      {
        aps: "Athlétisme — Course de vitesse",
        seances: [
          "Test d'observation.",
          "Appuis au départ.",
          "Réaction au signal.",
          "Réagir aux signaux visuels/auditifs.",
          "Placement au starting-block.",
          "Pied de poussée.",
          "Redressement progressif + synchronisation.",
          "Course rectiligne (appui).",
          "Rythme variable.",
          "Départ + redressement + course rythmique.",
          "Départ + redressement + course axée.",
          "Évaluation (80m G / 60m F).",
        ],
      },
      {
        aps: "Athlétisme — Course de durée",
        seances: [
          "VMA (Luc Léger).",
          "25' à 70% VMA.",
          "20' à 75% VMA.",
          "15' à 80% VMA.",
          "2×12' à 85% VMA.",
          "3×8' à 85% VMA.",
          "2×5' à 90% VMA.",
          "3×3' à 95% VMA.",
          "2×(15/15s) à 100% VMA.",
          "3×(10/10s) à 110% VMA.",
          "Pré-test (1000/600m).",
          "Évaluation (1000/600m).",
        ],
      },
      {
        aps: "Athlétisme — Lancer de poids",
        seances: [
          "Niveau initial.",
          "Ressources musculaires.",
          "Tenue de l'engin.",
          "Forme de lancer adaptée.",
          "Vitesse horizontale.",
          "Synchronisation MI/MS.",
          "Contrôle épaules/appuis.",
          "Évaluation intermédiaire.",
          "Angle d'envol 35°–45°.",
          "Lancer dans l'axe (variantes).",
          "Phases du lancer enchaînées.",
          "Évaluation finale (4kg/3kg).",
        ],
      },
      {
        aps: "Athlétisme — Saut en longueur",
        seances: [
          "Éval. diagnostique.",
          "Course d'élan + impulsion sur planche.",
          "Course d'élan optimale.",
          "Réglage du pied d'appel.",
          "Liaison course/impulsion.",
          "Saut angle optimal.",
          "Suspension — ouverture.",
          "Suspension — ramené.",
          "Réception vers l'avant.",
          "Pré-test global.",
          "Saut réglementaire.",
          "Évaluation finale.",
        ],
      }
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  3: {
    numero: 3,
    nom: "Effort physique et performance sportive",
    aps: [
      { 
        aps: "Basket-ball", 
        seances: [
          "Évaluer le niveau initial en situation de référence.",
          "Connaître définition, règles et bases techniques.",
          "Conserver la balle par passes et tenter un tir.",
          "Dribbler efficacement et tirer.",
          "Échanges en supériorité offensive et tir.",
          "Supériorité offensive : conclure par un tir.",
          "Montée rapide en égalité et marquer.",
          "Contre-attaque face à défense non organisée.",
          "Utiliser les couloirs latéraux.",
          "Fixer la défense et jouer ailleurs.",
          "Match dirigé d'intégration.",
          "Évaluation finale (indiv/collectif)."
        ]
      },
      { 
        aps: "Volleyball", 
        seances: [
          "Évaluer le niveau technique initial.",
          "Connaître règles, rotations, bases.",
          "Réception manchette.",
          "Passe haute orientée.",
          "Service par-dessous régulier.",
          "Service par-dessus efficace.",
          "Réception – passe – attaque.",
          "Attaque sécurisée.",
          "Bloc + défense coopérative.",
          "Stratégie simple service/attaque.",
          "Match dirigé.",
          "Évaluation finale en match officiel."
        ]
      },
      { 
        aps: "Football", 
        seances: [
          "Observer le niveau initial (match).",
          "Contrôle au sol + tir.",
          "Contrôle aérien + tir.",
          "Contrôle orienté + tir.",
          "Contrôle en mouvement (sol) + tir.",
          "Contrôle en mouvement (air) + tir.",
          "Conduite + passe courte.",
          "Conduite + passe longue.",
          "Contrôler/conduire + passe longue.",
          "Contrôler/conduire + passe en l'air.",
          "Contrôle en l'air + passe courte + tir.",
          "Évaluation (7c7)."
        ]
      },
      { 
        aps: "Handball", 
        seances: [
          "Détecter niveau individuel/collectif.",
          "Types de passes.",
          "Donner/recevoir en mouvement.",
          "Jouer jusqu'à la zone de marque + tirer.",
          "Passes rapides en supériorité.",
          "Se démarquer vers la cible.",
          "Respect des postes + attaque collective.",
          "Pré-test.",
          "Défense → contre-attaque.",
          "Choix passe vs dribble (égalité).",
          "Appui/soutien pour échanger.",
          "Évaluation finale en match."
        ]
      },
      { 
        aps: "Gymnastique au sol", 
        seances: [
          "Évaluation diagnostique.",
          "Éléments de liaison — A.",
          "Consolider A.",
          "Éléments — B.",
          "Consolider B.",
          "Éléments — C avec parade.",
          "Consolider C.",
          "Mini-enchaînement 2A+2B.",
          "Mini-enchaînement 2A+1B+1C.",
          "Enchaînement 2A+2B+1C.",
          "Préparer 2A+3B+2C.",
          "Évaluation finale (enchaînement complet)."
        ]
      },
      { 
        aps: "Athlétisme — Course de vitesse", 
        seances: [
          "Test d'observation.",
          "Appuis au départ.",
          "Réaction rapide (positions du corps).",
          "Réagir aux signaux visuels/auditifs.",
          "Se positionner au starting-block.",
          "Pied de poussée + passage du pied libre.",
          "Redressement + synchro bras/jambes.",
          "Trajet rectiligne + appui pied.",
          "Trajet rectiligne + rythme variable.",
          "Bon départ + redressement + course rythmique.",
          "Bon départ + redressement + course axée.",
          "Évaluation (80m G / 60m F)."
        ]
      },
      { 
        aps: "Athlétisme — Course de durée", 
        seances: [
          "VMA (Luc Léger) et groupes.",
          "25' à 70% VMA (200 m).",
          "20' à 75% VMA.",
          "15' à 80% VMA.",
          "2×12' à 85% VMA.",
          "3×8' à 85% VMA.",
          "2×5' à 90% VMA.",
          "3×3' à 95% VMA.",
          "2×(15/15s) à 100% VMA.",
          "3×(10/10s) à 110% VMA.",
          "Pré-test (1000m G / 600m F).",
          "Évaluation sommative (1000/600)."
        ]
      },
      { 
        aps: "Athlétisme — Lancer de poids", 
        seances: [
          "Détecter le niveau initial.",
          "Mobiliser les ressources musculaires.",
          "Tenue (coude levé).",
          "Forme de lancer adaptée.",
          "Position de force optimale.",
          "Synchroniser MI/MS.",
          "Contrôle équilibre/appuis.",
          "Pré-test.",
          "Ajuster l'angle d'envol (35–45°).",
          "Lancer dans l'axe (variantes).",
          "Enchaîner placement → blocage → élan → lancer.",
          "Évaluation finale (test bilan)."
        ]
      },
      { 
        aps: "Athlétisme — Saut en longueur", 
        seances: [
          "Détecter le niveau initial.",
          "Étalonner course d'élan + impulsion.",
          "Course optimale.",
          "Ajuster pied d'appel (3 dernières foulées).",
          "Liaison course–impulsion.",
          "Saut angle optimal.",
          "Suspension : ouverture.",
          "Suspension : ramené.",
          "Réception vers l'avant.",
          "Pré-test des acquis.",
          "Saut réglementaire.",
          "Évaluation finale."
        ]
      },
      ],
    },

  // ────────────────────────────────────────────────────────────────────────────
  4: {
    numero: 4,
    nom: "Engagement moteur et efficience sportive",
    aps: [
      { 
        aps: "Basket-ball", 
        seances: [
          "Observer le niveau initial.",
          "Règles/techniques/tactiques de base.",
          "Conserver la balle sous pression défensive.",
          "Dribbler efficacement et conclure par un tir.",
          "Échanges en supériorité offensive et tir.",
          "Maintenir la supériorité et conclure.",
          "Montée rapide vs défense non organisée.",
          "Contre-attaque et marquer.",
          "Utiliser les couloirs latéraux pour progresser.",
          "Fixer la défense et jouer ailleurs.",
          "Match dirigé (préparation évaluation).",
          "Évaluation des niveaux pratiques."
        ]
      },
      { 
        aps: "Volleyball", 
        seances: [
          "Évaluer le niveau initial.",
          "Règles/rotations/principes de jeu.",
          "Réception manchette.",
          "Passe haute.",
          "Service par-dessous régulier.",
          "Service par-dessus précis.",
          "Réception – passe – attaque.",
          "Attaque simple.",
          "Bloc + défense collectifs.",
          "Stratégie service/attaque.",
          "Match dirigé d'intégration.",
          "Évaluation finale."
        ]
      },
      { 
        aps: "Football", 
        seances: [
          "Observer le niveau initial.",
          "Contrôle au sol + tir.",
          "Contrôle aérien + tir.",
          "Contrôle orienté + tir.",
          "Contrôle en mouvement (sol) + tir.",
          "Contrôle en mouvement (air) + tir.",
          "Conduite + passe courte.",
          "Conduite + passe longue.",
          "Contrôler/conduire + passe longue.",
          "Contrôler/conduire + passe en l'air.",
          "Contrôle aérien + passe courte + tir.",
          "Évaluation (7c7)."
        ]
      },
      { 
        aps: "Handball", 
        seances: [
          "Détecter niveau individuel/collectif.",
          "Différents types de passes.",
          "Donner/recevoir en mouvement.",
          "Jouer jusqu'à la zone adverse + tir.",
          "Passes rapides en supériorité.",
          "Se démarquer vers la cible.",
          "Respect des postes + attaque collective.",
          "Pré-test.",
          "Défense → contre-attaque.",
          "Choix passe vs dribble (égalité).",
          "Appui/soutien.",
          "Évaluation finale en match."
        ]
      },
      { 
        aps: "Gymnastique au sol", 
        seances: [
          "Évaluation diagnostique.",
          "Éléments de liaison — A.",
          "Poursuivre A.",
          "Éléments — B.",
          "Suite B.",
          "Éléments — C avec parade.",
          "Suite C.",
          "Mini-enchaînement (2A + 2B).",
          "Mini-enchaînement (2A + 1B + 1C).",
          "Enchaînement (2A + 2B + 1C).",
          "Pré-évaluation : 2A+3B+2C.",
          "Évaluation finale (enchaînement complet)."
        ]
      },
      { 
        aps: "Athlétisme — Course de vitesse", 
        seances: [
          "Test d'observation.",
          "Appuis au départ.",
          "Réagir au signal.",
          "Réagir aux signaux (visuels/auditifs).",
          "Position au starting-block.",
          "Pied de poussée.",
          "Redressement + synchronisation.",
          "Course rectiligne (appui).",
          "Rythme variable.",
          "Départ + redressement + course rythmique.",
          "Départ + redressement + course axée.",
          "Évaluation (80/60m)."
        ]
      },
      { 
        aps: "Athlétisme — Course de durée", 
        seances: [
          "VMA (Luc Léger).",
          "25' à 70% VMA.",
          "20' à 75% VMA.",
          "15' à 80% VMA.",
          "2×12' à 85% VMA.",
          "3×8' à 85% VMA.",
          "2×5' à 90% VMA.",
          "3×3' à 95% VMA.",
          "2×(15/15s) à 100% VMA.",
          "3×(10/10s) à 110% VMA.",
          "Pré-test (1000/600m).",
          "Évaluation (1000/600m)."
        ]
      },
      { 
        aps: "Athlétisme — Lancer de poids", 
        seances: [
          "Détecter niveau initial.",
          "Mobiliser ressources musculaires.",
          "Tenir l'engin (coude levé).",
          "Forme de lancer adaptée.",
          "Position de force optimale.",
          "Synchroniser MI/MS.",
          "Contrôler équilibre/appuis.",
          "Pré-test.",
          "Angle d'envol 35–45°.",
          "Lancer dans l'axe (variantes).",
          "Enchaîner placement → blocage → élan → lancer.",
          "Évaluation finale."
        ]
      },
      { 
        aps: "Athlétisme — Saut en longueur", 
        seances: [
          "Éval. diagnostique.",
          "Course d'élan + impulsion.",
          "Course optimale.",
          "Pied d'appel (3 dernières foulées).",
          "Liaison course–impulsion.",
          "Saut angle optimal.",
          "Suspension : ouverture.",
          "Suspension : ramené.",
          "Réception vers l'avant.",
          "Pré-test.",
          "Saut réglementaire.",
          "Évaluation finale."
        ]
      }
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  5: {
    numero: 5,
    nom: "Prise d'initiative et pratique physique responsable",
    aps: [
      { 
        aps: "Basket-ball", 
        seances: [
          "Détecter les niveaux (référence 5c5).",
          "Passes/réceptions en situations variées.",
          "Passes rapides + exploitation des couloirs.",
          "Passes correctes en mouvement vers l'avant.",
          "Dribbler des défenseurs en jeu collectif vers l'avant (espaces libres).",
          "Multiplier les échanges : passes au partenaire démarqué (appui/soutien).",
          "Montée rapide en créant/utilisant des espaces libres.",
          "Montée rapide par couloirs + tir.",
          "Organisation défensive (propre camp).",
          "Organisation offensive (créer l'incertitude).",
          "Occupation organisée de l'espace de jeu.",
          "Test bilan 5c5."
        ]
      },
      { 
        aps: "Football", 
        seances: [
          "Détecter niveau tactique/technique en match.",
          "Conduite/contrôle/passe précise + tir.",
          "Conduite vers le but avec dribble de l'adversaire.",
          "Progresser individuellement (dribble) + tir.",
          "Progresser collectivement par passes courtes + tir.",
          "Triangles d'échange (soutien/appui) pour accéder à la surface.",
          "Créer des espaces libres pour recevoir/aider.",
          "Monter rapidement devant défense placée (rôle dans l'équipe).",
          "Pré-évaluation (préparer test bilan).",
          "Attaque organisée par occupation rationnelle.",
          "Contre-attaque rapide + tir.",
          "Test bilan (individuel/collectif)."
        ]
      },
      { 
        aps: "Volley-ball", 
        seances: [
          "Déterminer le niveau initial.",
          "Touche de balle au-dessus du filet.",
          "Manchette de renvoi vers le camp adverse.",
          "Service en bas au-delà des 9 m.",
          "Différencier frappes de renvoi/conservation.",
          "Orienter appuis + passe précise vers un passeur désigné.",
          "Chercher la rupture pour marquer.",
          "3 touches (réception, passe, attaque).",
          "Renvoi en ≤2 touches.",
          "Maintenir l'échange et renvoyer en 2c2.",
          "Pré-évaluation des acquis.",
          "Match en respectant les règles."
        ]
      },
      { 
        aps: "Athlétisme — Course de durée", 
        seances: [
          "Évaluation diagnostique (niveau initial).",
          "Continu 75% VMA (10').",
          "Continu 80% VMA (10').",
          "Continu 85% VMA (10').",
          "Long-long 90% VMA : 2×12' (160 m).",
          "Évaluation des acquis : 1000m (G) / 600m (F).",
          "Long-long 90% VMA : 2×12'.",
          "Long-long 95% VMA : 3×3'.",
          "Puissance aérobie (court-court).",
          "Puissance aérobie (court-court) — suite.",
          "Évaluation formative.",
          "Évaluation sommative."
        ]
      },
      { 
        aps: "Athlétisme — Lancer de poids",
        seances: [
          "Tenue de l'engin (bases des doigts, coude levé).",
          "Lever l'engin, bras en arrière, ouvrir buste/hanche, bras libre (rattrapage).",
          "Ouverture bras arrière (rattrapage).",
          "Impulsion horizontale pour position de force.",
          "Impulsion horizontale (suite).",
          "Ouverture hanche/épaule + extension du coude ; rattraper l'équilibre.",
          "Synchroniser MI/MS pour restituer l'énergie.",
          "Enchaîner placement → blocage → élan → lancer → rattrapage.",
          "Position de force + synchronisation (ajuster l'angle d'envol).",
          "Évaluation formative.",
          "Évaluation sommative.",
          "—"
        ]
      },
      {
        aps: "Handball",
        seances: [
          "Détecter niveau individuel/collectif (progression, conservation, efficacité attaque/défense).",
          "Différents types de passes en égalité numérique.",
          "Donner et réceptionner en mouvement.",
          "Jouer en mouvement jusqu'à la zone de marque et tirer.",
          "Passes précises et rapides en supériorité numérique.",
          "Se démarquer dans les zones libres (égalité).",
          "Respecter son poste et avancer collectivement.",
          "Pré-test.",
          "Défendre son poste puis s'organiser pour contre-attaquer.",
          "Choix alternatif passe/dribble (égalité).",
          "Se situer en appui/soutien pour favoriser l'échange.",
          "Évaluation en match (individuel/collectif)."
        ]
      },
      {
        aps: "Gymnastique au sol",
        seances: [
          "Évaluation diagnostique (fiche de niveau).",
          "Éléments A + liaisons.",
          "Consolider A.",
          "Éléments B.",
          "Consolider B.",
          "Éléments C avec aide/parade.",
          "Consolider C.",
          "Mini-enchaînement 2A+2B.",
          "Mini-enchaînement 2A+1B+1C.",
          "Enchaînement 2A+2B+1C.",
          "Préparer 2A+3B+2C.",
          "Évaluation finale (enchaînement complet)."
        ]
      },
      {
        aps: "Athlétisme — Course de vitesse",
        seances: [
          "Observer le niveau initial.",
          "Position des appuis au départ.",
          "Réagir rapidement (positions du corps).",
          "Réagir aux signaux visuels/auditifs.",
          "Se positionner au starting-block (prise de contact).",
          "Conscience du pied de poussée + passage du pied libre.",
          "Redressement progressif + synchro bras/jambes.",
          "Trajet rectiligne + positionnement du pied en fin de course.",
          "Trajet rectiligne à rythme variable.",
          "Bon départ + redressement + course rythmique.",
          "Bon départ + redressement + course axée.",
          "Évaluation (80m G / 60m F)."
        ]
      },
      {
        aps: "Athlétisme — Saut en longueur",
        seances: [
          "Détecter le niveau initial.",
          "Étalonner course d'élan + impulsion.",
          "Recherche de course optimale.",
          "Ajuster le pied d'appel (3 dernières foulées).",
          "Liaison course–impulsion sans perte.",
          "Saut avec angle optimal.",
          "Suspension — ouverture.",
          "Suspension — ramené.",
          "Réception vers l'avant.",
          "Pré-test des acquis.",
          "Saut réglementaire.",
          "Évaluation finale."
        ]
      }
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  6: {
    numero: 6,
    nom: "Efficacité et créativité motrice sportive",
    aps: [
      { 
        aps: "Football", 
        seances: [
          "Détecter le niveau (procédural et conceptuel).",
          "Se démarquer pour l'appui puis jouer en soutien.",
          "Appui vers l'avant ou soutien en retrait.",
          "Se placer en zone neutre, jouer en appui puis avancer vers la cible.",
          "Appel circulaire puis tir vers la cible.",
          "Récupérer et contre-attaquer pour tirer.",
          "Dépasser à 2 un défenseur (feinte) et tirer.",
          "Réévaluer les acquisitions.",
          "Tir en coup de pied depuis espace libre.",
          "Tir en frappe à l'extérieur depuis espace libre.",
          "Progresser collectivement avec une tactique choisie contre défense, pour tirer.",
          "Évaluer acquisitions (procédural/conceptuel)."
        ]
      },
      { 
        aps: "Handball", 
        seances: [
          "Détecter niveau individuel/collectif (progression, conservation, efficacité attaque/défense).",
          "Différents types de passes en égalité numérique.",
          "Donner et réceptionner en mouvement.",
          "Jouer en mouvement jusqu'à la zone de marque et tirer.",
          "Passes précises et rapides en supériorité numérique.",
          "Se démarquer dans les zones libres (égalité).",
          "Respecter son poste et avancer collectivement.",
          "Pré-test.",
          "Défendre son poste puis s'organiser pour contre-attaquer.",
          "Choix alternatif passe/dribble (égalité).",
          "Se situer en appui/soutien pour favoriser l'échange.",
          "Évaluation en match (individuel/collectif)."
        ]
      },
      { 
        aps: "Basket-ball", 
        seances: [
          "Test d'observation (détecter niveaux indiv/collectif).",
          "Séance théorique (règles/technique/tactique).",
          "Garder la balle par passes face à défense et tenter un tir.",
          "Dribbler et finir par un tir.",
          "Supériorité offensive : échanges + tir réussi.",
          "Supériorité offensive : échanges + tir réussi (suite).",
          "Égalité numérique : montée rapide vs défense non organisée.",
          "Contre-attaque vs défense non organisée.",
          "Égalité numérique : échanges collectifs en utilisant couloirs latéraux.",
          "Supériorité : projet collectif pour fixer la défense et jouer ailleurs.",
          "Match dirigé (préparation test).",
          "Test bilan (niveaux indiv/collectif)."
        ]
      },
      { 
        aps: "Volley-ball", 
        seances: [
          "Détecter le niveau (service, réception, passe, attaque).",
          "Règles et rotation.",
          "Réception par manchette.",
          "Passe haute orientée.",
          "Service par-dessous régulier et efficace.",
          "Service par-dessus (ou flottant) + organiser la réception.",
          "Enchaîner réception – passe – attaque en situation réelle.",
          "Attaque frappée/placée sécurisée.",
          "Bloc + défense avec couverture.",
          "Stratégie simple de service/attaque collective.",
          "Match dirigé (4c4/6c6).",
          "Évaluation finale (match officiel)."
        ]
      },
      { 
        aps: "Athlétisme — Course de vitesse", 
        seances: [
          "Observer le niveau initial.",
          "Position des appuis au départ.",
          "Réagir rapidement (positions du corps).",
          "Réagir aux signaux visuels/auditifs.",
          "Se positionner au starting-block (prise de contact).",
          "Conscience du pied de poussée + passage du pied libre.",
          "Redressement progressif + synchro bras/jambes.",
          "Trajet rectiligne + positionnement du pied en fin de course.",
          "Trajet rectiligne à rythme variable.",
          "Bon départ + redressement + course rythmique.",
          "Bon départ + redressement + course axée.",
          "Évaluation (80m G / 60m F)."
        ]
      },
      { 
        aps: "Athlétisme — Course de durée", 
        seances: [
          "VMA (Luc Léger) → groupes.",
          "25' à 70% VMA (piste 200 m).",
          "20' à 75% VMA.",
          "15' à 80% VMA.",
          "2×12' à 85% VMA.",
          "3×8' à 85% VMA.",
          "2×5' à 90% VMA.",
          "3×3' à 95% VMA.",
          "2×(15/15s) à 100% VMA.",
          "3×(10/10s) à 110% VMA.",
          "Pré-test (1000m G / 600m F).",
          "Évaluation sommative (1000/600)."
        ]
      },
      { 
        aps: "Athlétisme — Saut en longueur", 
        seances: [
          "Détecter le niveau initial.",
          "Étalonner course d'élan + impulsion.",
          "Recherche de course optimale.",
          "Ajuster le pied d'appel (3 dernières foulées).",
          "Liaison course–impulsion sans perte.",
          "Saut avec angle optimal.",
          "Suspension — ouverture.",
          "Suspension — ramené.",
          "Réception vers l'avant.",
          "Pré-test des acquis.",
          "Saut réglementaire.",
          "Évaluation finale."
        ]
      },
      { 
        aps: "Athlétisme — Lancer de poids", 
        seances: [
          "Détecter le niveau initial.",
          "Mobiliser ressources musculaires.",
          "Tenir l'engin (coude levé).",
          "Forme de lancer adaptée.",
          "Position de force optimale.",
          "Synchroniser MI/MS.",
          "Contrôler équilibre/appuis.",
          "Pré-test.",
          "Angle d'envol 35–45°.",
          "Lancer dans l'axe (variantes).",
          "Enchaîner placement → blocage → élan → lancer.",
          "Évaluation finale (test bilan)."
        ]
      },
      { 
        aps: "Gymnastique au sol", 
        seances: [
          "Évaluation diagnostique (fiche de niveau).",
          "Éléments A + liaisons.",
          "Consolider A.",
          "Éléments B.",
          "Consolider B.",
          "Éléments C avec aide/parade.",
          "Consolider C.",
          "Mini-enchaînement 2A+2B.",
          "Mini-enchaînement 2A+1B+1C.",
          "Enchaînement 2A+2B+1C.",
          "Préparer 2A+3B+2C.",
          "Évaluation finale (enchaînement complet)."
        ]
      }
    ],
  }
};

// Structure finale organisée par niveau pour compatibilité avec l'app
const OBJECTIFS: Record<Niveau, Record<number, ModuleObjectifs>> = {
  TC: {
    1: MODULES_DATA[1],
    2: MODULES_DATA[2]
  },
  "1ère Bac": {
    3: MODULES_DATA[3],
    4: MODULES_DATA[4]
  },
  "2ème Bac": {
    5: MODULES_DATA[5],
    6: MODULES_DATA[6]
  }
};

export default OBJECTIFS;
