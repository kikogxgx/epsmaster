import { describe, it, expect, vi } from 'vitest';
import type { Cycle, AbsenceProfesseur } from '../types';

vi.mock('../hooks/useEpsData', () => ({
  useEpsData: () => ({
    state: {
      classes: [
        {
          id: 'c1',
          nom: 'Classe 1',
          niveau: 'TC',
          horaires: [
            { weekday: 4, start: '09:00', durationMin: 60 },
            { weekday: 5, start: '10:00', durationMin: 60 }
          ]
        }
      ],
      cycles: []
    },
    updateCycle: vi.fn()
  })
}));

import { useReprogrammationSeances } from '../hooks/useReprogrammationSeances';

describe('reprogrammation de cycle', () => {
  it('conserve les jours jeudi et vendredi après reprogrammation', () => {
    const { reprogrammerCycle } = useReprogrammationSeances();
    const cycle: Cycle = {
      id: 'cy1',
      classeId: 'c1',
      classeNom: 'Classe 1',
      niveau: 'TC',
      aps: 'Basket',
      module: 1,
      semestre: 1,
      nbSeances: 4,
      seances: [
        { id: 's1', cycleId: 'cy1', numero: 1, date: '2025-03-20', heure: '09:00', theme: '', locked: false, listeAppel: [], cahier: {}, statut: 'Planifiée' },
        { id: 's2', cycleId: 'cy1', numero: 2, date: '2025-03-21', heure: '10:00', theme: '', locked: false, listeAppel: [], cahier: {}, statut: 'Planifiée' },
        { id: 's3', cycleId: 'cy1', numero: 3, date: '2025-03-27', heure: '09:00', theme: '', locked: false, listeAppel: [], cahier: {}, statut: 'Planifiée' },
        { id: 's4', cycleId: 'cy1', numero: 4, date: '2025-03-28', heure: '10:00', theme: '', locked: false, listeAppel: [], cahier: {}, statut: 'Planifiée' }
      ],
      statut: 'planifié'
    };
    const absence: AbsenceProfesseur = {
      id: 'a1',
      dateDebut: '2025-03-20',
      dateFin: '2025-03-21',
      type: 'maladie' as any,
      motif: '',
      statut: 'en_attente',
      createdAt: '',
      seancesImpactees: []
    };

    const { cycleModifie } = reprogrammerCycle(cycle, absence);
    const jours = cycleModifie.seances.map(s => new Date(s.date).getDay());
    expect(jours.every(j => j === 4 || j === 5)).toBe(true);
  });
});
