// tests/grillesAPS.spec.ts
import { describe, expect, test } from 'vitest';

// Support both import styles across branches:
import * as APSData from '../data/grillesAPS';
import type { APS } from '../data/grillesAPS';
import type { Niveau } from '../types';

// Prefer values off the namespace to avoid tree-shaking mismatches
const { grillesAPS, resolveAPS } = APSData;

const niveaux: Niveau[] = ['TC', '1ère Bac', '2ème Bac'];

describe('grillesAPS totals', () => {
  (Object.keys(grillesAPS) as APS[]).forEach((aps) => {
    niveaux.forEach((niveau) => {
      test(`${aps} ${niveau} totals 20`, () => {
        const criteres = grillesAPS[aps];
        const total = criteres.reduce((sum, c) => {
          if ('sousCriteres' in c && c.sousCriteres?.length) {
            const sousTotal = c.sousCriteres.reduce((s, sc) => s + sc.bareme[niveau], 0);
            return sum + sousTotal;
          }
          return sum + c.bareme[niveau];
        }, 0);
        expect(total).toBe(20);
      });
    });
  });
});

// Only run mapping tests if resolveAPS is available on this branch
if (typeof resolveAPS === 'function') {
  describe('resolveAPS mapping', () => {
    test('maps football terms to sports collectifs', () => {
      expect(resolveAPS('foot')).toBe('Sports collectifs');
      expect(resolveAPS('Football')).toBe('Sports collectifs');
      expect(resolveAPS('basket')).toBe('Sports collectifs');
    });
  });
}
