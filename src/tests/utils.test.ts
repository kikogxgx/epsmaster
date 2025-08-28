import { describe, it, expect } from 'vitest';
import { roundHalf, computeNoteFinale } from '../utils/scoring';
import { generateSeancesFromHoraire, bulkCreateCyclesByNiveau } from '../utils/planning';
import { presenceRate } from '../utils/aggregates';

describe('scoring utils', () => {
  it('roundHalf arrondit correctement', () => {
    expect(roundHalf(9.76)).toBe(9.5);
    expect(roundHalf(14.9)).toBe(15);
    expect(roundHalf(-1)).toBe(0);
    expect(roundHalf(20.4)).toBe(20);
  });
  it('computeNoteFinale calcule une note pour TC', () => {
    const note = computeNoteFinale('TC', { motricite: 10, comportement: 10, connaissances: 10 });
    // 10*0.6 + 10*0.2 + 10*0.2 = 10
    expect(note).toBe(10);
  });
  it('computeNoteFinale calcule une note pour 1ère Bac', () => {
    const note = computeNoteFinale('1ère Bac', { motricite: 12, tactique: 10, comportement: 8, connaissances: 6 });
    // (12*50 + 10*30 + 8*10 + 6*10)/100 = 10.8 arrondi à 10.5
    expect(note).toBe(10.5);
  });
  it('computeNoteFinale calcule une note pour 2ème Bac', () => {
    const note = computeNoteFinale('2ème Bac', { projet: 20, tactique: 0, comportement: 0, connaissances: 0 });
    // (20*50)/100 = 10
    expect(note).toBe(10);
  });
});

describe('planning utils', () => {
  it('generateSeancesFromHoraire génère la bonne quantité', () => {
    const seances = generateSeancesFromHoraire({
      startDate: '2025-01-01',
      nbSeances: 3,
      horaire: { weekday: 1, start: '09:00', durationMin: 60 }
    });
    expect(seances.length).toBe(3);
    // Toutes les séances doivent avoir un numéro et une date
    seances.forEach((s, idx) => {
      expect(s.numero).toBe(idx + 1);
      expect(typeof s.date).toBe('string');
    });
  });
  it('bulkCreateCyclesByNiveau crée un cycle par classe', () => {
    const classes = [
      { id: 'c1', nom: 'C1', niveau: 'TC', horaires: [{ weekday: 1, start: '08:00', durationMin: 60 }] },
      { id: 'c2', nom: 'C2', niveau: '1ère Bac', horaires: [{ weekday: 2, start: '10:00', durationMin: 60 }] }
    ];
    const cycles = bulkCreateCyclesByNiveau({
      niveau: 'TC',
      module: 1,
      aps: 'Basket-ball',
      semestre: 1,
      nbSeances: 2,
      startDate: '2025-01-01',
      classes
    });
    expect(cycles.length).toBe(1);
    expect(cycles[0].classeId).toBe('c1');
    expect(cycles[0].seances.length).toBe(2);
  });
});

describe('aggregates utils', () => {
  it('presenceRate retourne 0 dans le prototype', () => {
    expect(presenceRate('any')).toBe(0);
  });
});