// Définition des types principaux de l'application EPS.

// Niveau d'une classe ou d'un élève.
export type Niveau = 'TC' | '1ère Bac' | '2ème Bac';

// Horaire hebdomadaire obligatoire pour une classe.
export interface Horaire {
  weekday: number;        // 0 (dimanche) à 6 (samedi)
  start: string;         // HH:MM format 24h
  durationMin: number;   // durée en minutes
  lieu?: string;         // lieu facultatif
}

// Classe d'élèves.
export interface Classe {
  id: string;
  nom: string;
  niveau: Niveau;
  horaires: Horaire[];   // au moins un horaire obligatoire
}

// Élève appartenant à une classe.
export interface Eleve {
  id: string;
  classeId: string;
  nom: string;
  /**
   * Prénom de l’élève (facultatif).
   */
  prenom?: string;
  /**
   * Numéro d’ordre ou matricule (facultatif).
   */
  numero?: number;
  /**
   * Encodage base64 d’une photo (facultatif).
   */
  photoBase64?: string;
  /**
   * Niveau de la classe à laquelle appartient l’élève.
   */
  niveau: Niveau;
  /**
   * Indique si l’élève est actif dans la classe. Les élèves inactifs ne sont pas proposés pour l’appel.
   */
  actif?: boolean;
}

// Dimensions d'évaluation.
export interface Dims {
  motricite?: number;
  tactique?: number;
  comportement?: number;
  connaissances?: number;
  projet?: number;
}

// Statut possible pour un cycle.
export type CycleStatut = 'planifié' | 'réalisé' | 'évalué';

// Cycle d'apprentissage pour une classe.
export interface Cycle {
  id: string;
  classeId: string;
  classeNom: string;
  niveau: Niveau;
  aps: string;
  module: 1 | 2 | 3 | 4 | 5 | 6;
  semestre: 1 | 2;
  nbSeances: number;
  seances: Seance[];
  statut?: CycleStatut;
  templateId?: string;
  /**
   * Date de dernière modification du cycle (ISO date-time).
   */
  updatedAt?: string;
}

// Item de liste d'appel pour une séance.
export interface ListeAppelItem {
  eleveId: string;
  nom: string;
  /**
   * Statut de présence pour l’élève lors de l’appel.
   * - PRESENT : élève présent à l’heure.
   * - RETARD : élève en retard.
   * - ABSENT : élève absent sans justification.
   * - EXCUSE : élève absent mais excusé.
   */
  statut: 'PRESENT' | 'RETARD' | 'ABSENT' | 'EXCUSE';

  /**
   * Optionnel : marqueur de comportement positif ou négatif durant la séance.
   * '+' pour bon comportement, '-' pour comportement problématique.
   */
  comportement?: '+' | '-' | '';
}

// Cahier de texte d'une séance.
export interface Cahier {
  objectifs?: string;
  contenu?: string;
  organisation?: string;
  consignes?: string;
  criteres?: string;
}

// Séance d'un cycle.
export interface Seance {
  id: string;
  cycleId: string;
  numero: number;
  date: string;        // ISO AAAA-MM-JJ
  heure?: string;      // HH:MM
  theme: string;
  locked?: boolean;
  fiche_pdf_page?: number;
  listeAppel: ListeAppelItem[];
  cahier: Cahier;

  /**
   * Champs ajoutés lorsqu'une séance est déplacée suite à une absence.
   */
  estReportee?: boolean;
  absenceOriginId?: string;
  dateOriginale?: string;

  /**
   * Indique si une évaluation est prévue pour cette séance.
   * Si true, le tableau de bord affichera le bouton d’évaluation.
   */
  evalDue?: boolean;

  /**
   * Statut de la séance pour le suivi des modules pédagogiques.
   * - "Planifiée" : séance planifiée mais aucun appel ni évaluation réalisés.
   * - "Appel fait" : appel effectué, au moins un statut d’élève saisi.
   * - "Évaluée" : notes d’évaluation saisies et validées.
   */
  statut?: 'Planifiée' | 'Appel fait' | 'Évaluée';

  /**
   * Enregistrement des résultats d’évaluation pour chaque élève.
   * Chaque entrée contient les notes par critère et la moyenne calculée.
   * Si aucune évaluation n’a été effectuée, ce tableau peut être vide ou undefined.
   */
  evaluations?: {
    eleveId: string;
    notes: {
      technique: number;
      tactique: number;
      engagement: number;
      assiduite: number;
    };
    moyenne: number;
    commentaire?: string;
  }[];
}

// ---------- Absences professeur ----------

export type TypeAbsence =
  | 'maladie'
  | 'competition'
  | 'formation'
  | 'jour_ferie'
  | 'conge'
  | 'autre';

export interface AbsenceProfesseur {
  id: string;
  dateDebut: string; // ISO AAAA-MM-JJ
  dateFin: string; // ISO AAAA-MM-JJ
  type: TypeAbsence;
  motif: string;
  justificatif?: string; // base64 d'un fichier si besoin
  statut: 'en_attente' | 'approuve' | 'refuse';
  createdAt: string; // ISO Date-Time
  seancesImpactees: string[]; // IDs des séances touchées
}

/** Réorganisation ou rattrapage d'une séance. */
export interface RemplacementSeance {
  seanceId: string;
  dateOrigine: string; // ISO
  nouvelleDate: string; // ISO
  nouvelleHeure: string; // HH:MM
  lieu?: string;
  professeurRemplacant?: string;
  statut: 'planifie' | 'realise' | 'annule';
}