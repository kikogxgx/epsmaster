import { describe, expect, test } from 'vitest';
import { grillesAPS } from '../data/grillesAPS';
import type { APS } from '../data/grillesAPS';
import type { Niveau } from '../types';

const niveaux: Niveau[] = ['TC', '1ère Bac', '2ème Bac'];

describe('grillesAPS totals', () => {
  (Object.keys(grillesAPS) as APS[]).forEach(aps => {
    niveaux.forEach(niveau => {
      test(`${aps} ${niveau} totals 20`, () => {
        const criteres = grillesAPS[aps];
        const total = criteres.reduce((sum, c) => {
          if (c.sousCriteres) {
            return sum + c.sousCriteres.reduce((s, sc) => s + sc.bareme[niveau], 0);
          }
          return sum + c.bareme[niveau];
        }, 0);
        expect(total).toBe(20);
      });
    });
  });
});
