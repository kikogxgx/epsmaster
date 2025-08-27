import { describe, it, expect } from 'vitest';
import type { Cycle, Seance, AbsenceProfesseur } from '../types';
import { reprogrammerCycle } from '../hooks/useReprogrammationSeances';

function makeSeance(id: string, date: string, numero: number, theme: string): Seance {
  return {
    id,
    cycleId: 'cycle1',
    numero,
    date,
    heure: '09:30',
    theme,
    locked: false,
    listeAppel: [],
    cahier: {}
  } as Seance;
}

describe('reprogrammerCycle', () => {
  it('glisse les séances et recalcule les numéros en sautant les dates indisponibles', () => {
    const cycle: Cycle = {
      id: 'cycle1',
      classeId: 'classe1',
      classeNom: 'Classe',
      niveau: 'TC',
      aps: 'Test',
      module: 1,
      semestre: 1,
      nbSeances: 4,
      seances: [
        makeSeance('s1', '2025-09-01', 1, 'A'),
        makeSeance('s2', '2025-09-08', 2, 'B'),
        makeSeance('s3', '2025-09-15', 3, 'C'),
        makeSeance('s4', '2025-09-22', 4, 'D')
      ]
    };

    const absence: AbsenceProfesseur = {
      id: 'abs1',
      dateDebut: '2025-09-08',
      dateFin: '2025-09-08',
      type: 'maladie',
      motif: '',
      statut: 'approuve',
      createdAt: '2024-12-01',
      seancesImpactees: []
    };

    const { cycleModifie, nbSeancesReportees } = reprogrammerCycle(cycle, absence, ['2025-09-29']);

    const dates = cycleModifie.seances.map(s => s.date);
    expect(dates).toEqual([
      '2025-09-01',
      '2025-09-15',
      '2025-09-22',
      '2025-10-06'
    ]);
    const numeros = cycleModifie.seances.map(s => s.numero);
    expect(numeros).toEqual([1, 2, 3, 4]);
    expect(nbSeancesReportees).toBe(1);
  });
});
