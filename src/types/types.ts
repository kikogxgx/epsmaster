// Définition des types principaux de l'application EPS.

// ---------- Classes & Élèves ----------
export type Niveau = 'TC' | '1ère Bac' | '2ème Bac';

// Horaire hebdomadaire obligatoire pour une classe.
export interface Horaire {
  weekday: number; // 0 (dimanche) à 6 (samedi)
  start: string; // HH:MM format 24h
  durationMin: number; // durée en minutes
  lieu?: string; // lieu facultatif
}

// Classe d'élèves.
export interface Classe {
  id: string;
  nom: string;
  niveau: Niveau;
  horaires: Horaire[]; // au moins un horaire obligatoire
}

// Élève appartenant à une classe.
export interface Eleve {
  id: string;
  classeId: string;
  nom: string;
  prenom?: string;
  numero?: number;
  photoBase64?: string;
  niveau: Niveau;
  actif?: boolean;
}

// ---------- Cycles & Séances ----------
export interface Dims {
  motricite?: number;
  tactique?: number;
  comportement?: number;
  connaissances?: number;
  projet?: number;
}

export type CycleStatut = 'planifié' | 'réalisé' | 'évalué';

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
}

// Item de liste d'appel (VERSION UNIFIÉE)
export interface ListeAppelItem {
  eleveId: string;
  nom: string;
  statut: 'PRESENT' | 'RETARD' | 'ABSENT' | 'EXCUSE';
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

// Évaluation d'un élève pour une séance
export interface EvaluationEleve {
  eleveId: string;
  notes: {
    technique: number;
    tactique: number;
    engagement: number;
    assiduite: number;
  };
  moyenne: number;
  commentaire?: string;
}

// Séance d'un cycle.
export interface Seance {
  id: string;
  cycleId: string;
  numero: number;
  date: string; // ISO AAAA-MM-JJ
  heure?: string; // HH:MM
  theme: string;
  locked?: boolean;
  fiche_pdf_page?: number;
  listeAppel: ListeAppelItem[];
  cahier: Cahier;
  evalDue?: boolean;
  statut?: 'Planifiée' | 'Appel fait' | 'Évaluée';
  evaluations?: EvaluationEleve[];
  // Champs pour la reprogrammation
  estReportee?: boolean;
  absenceOriginId?: string;
  dateOriginale?: string;
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

// Réorganisation ou rattrapage d'une séance.
export interface RemplacementSeance {
  seanceId: string;
  dateOrigine: string; // ISO
  nouvelleDate: string; // ISO
  nouvelleHeure: string; // HH:MM
  lieu?: string;
  professeurRemplacant?: string;
  statut: 'planifie' | 'realise' | 'annule';
}
