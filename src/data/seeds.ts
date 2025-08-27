import { Classe, Eleve } from '../types';

// Petite chaîne base64 pour illustrer les photos des élèves. Dans un vrai projet,
// vous importerez ou générerez une image en base64 complète. Ici, la chaîne
// est volontairement raccourcie pour alléger le fichier.
const placeholderPhoto =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAECAYAAACtBE5DAAAMTGlDQ1BJQ0MgUHJvZmlsZQAASImV';

// Définition des classes initiales : TC A, 1ère A et 2ème A, chacune avec au
// moins un horaire hebdomadaire. Ces horaires servent de base au générateur
// de séances lors de la création de cycles.
export const seedClasses: Classe[] = [
  {
    id: 'class-tc-a',
    nom: 'TC A',
    niveau: 'TC',
    horaires: [
      {
        weekday: 1, // lundi
        start: '08:00',
        durationMin: 60,
        lieu: 'Gymnase'
      }
    ]
  },
  {
    id: 'class-1a',
    nom: '1ère A',
    niveau: '1ère Bac',
    horaires: [
      {
        weekday: 2, // mardi
        start: '10:00',
        durationMin: 60,
        lieu: 'Stade'
      }
    ]
  },
  {
    id: 'class-2a',
    nom: '2ème A',
    niveau: '2ème Bac',
    horaires: [
      {
        weekday: 4, // jeudi
        start: '09:00',
        durationMin: 60,
        lieu: 'Salle polyvalente'
      }
    ]
  }
];

// Élèves de base (6 par classe). Chaque élève reçoit un identifiant unique,
// appartient à une classe et contient un niveau correspondant à sa classe.
export const seedEleves: Eleve[] = [
  // TC A
  { id: 'eleve-01', classeId: 'class-tc-a', nom: 'Amina', numero: 1, photoBase64: placeholderPhoto, niveau: 'TC' },
  { id: 'eleve-02', classeId: 'class-tc-a', nom: 'Youssef', numero: 2, photoBase64: placeholderPhoto, niveau: 'TC' },
  { id: 'eleve-03', classeId: 'class-tc-a', nom: 'Sara', numero: 3, photoBase64: placeholderPhoto, niveau: 'TC' },
  { id: 'eleve-04', classeId: 'class-tc-a', nom: 'Mohammed', numero: 4, photoBase64: placeholderPhoto, niveau: 'TC' },
  { id: 'eleve-05', classeId: 'class-tc-a', nom: 'Karim', numero: 5, photoBase64: placeholderPhoto, niveau: 'TC' },
  { id: 'eleve-06', classeId: 'class-tc-a', nom: 'Lina', numero: 6, photoBase64: placeholderPhoto, niveau: 'TC' },
  // 1ère A
  { id: 'eleve-07', classeId: 'class-1a', nom: 'Hassan', numero: 1, photoBase64: placeholderPhoto, niveau: '1ère Bac' },
  { id: 'eleve-08', classeId: 'class-1a', nom: 'Khadija', numero: 2, photoBase64: placeholderPhoto, niveau: '1ère Bac' },
  { id: 'eleve-09', classeId: 'class-1a', nom: 'Omar', numero: 3, photoBase64: placeholderPhoto, niveau: '1ère Bac' },
  { id: 'eleve-10', classeId: 'class-1a', nom: 'Fatima', numero: 4, photoBase64: placeholderPhoto, niveau: '1ère Bac' },
  { id: 'eleve-11', classeId: 'class-1a', nom: 'Said', numero: 5, photoBase64: placeholderPhoto, niveau: '1ère Bac' },
  { id: 'eleve-12', classeId: 'class-1a', nom: 'Rachid', numero: 6, photoBase64: placeholderPhoto, niveau: '1ère Bac' },
  // 2ème A
  { id: 'eleve-13', classeId: 'class-2a', nom: 'Imane', numero: 1, photoBase64: placeholderPhoto, niveau: '2ème Bac' },
  { id: 'eleve-14', classeId: 'class-2a', nom: 'Nabil', numero: 2, photoBase64: placeholderPhoto, niveau: '2ème Bac' },
  { id: 'eleve-15', classeId: 'class-2a', nom: 'Jamal', numero: 3, photoBase64: placeholderPhoto, niveau: '2ème Bac' },
  { id: 'eleve-16', classeId: 'class-2a', nom: 'Samira', numero: 4, photoBase64: placeholderPhoto, niveau: '2ème Bac' },
  { id: 'eleve-17', classeId: 'class-2a', nom: 'Siham', numero: 5, photoBase64: placeholderPhoto, niveau: '2ème Bac' },
  { id: 'eleve-18', classeId: 'class-2a', nom: 'Ali', numero: 6, photoBase64: placeholderPhoto, niveau: '2ème Bac' }
];

// Structure globale des données initiales : pas de cycles de base afin que
// l'utilisateur puisse les créer via l'assistant. L'application ajoute les
// cycles dans cette structure.
const seeds = {
  classes: seedClasses,
  eleves: seedEleves,
  cycles: []
};

export default seeds;