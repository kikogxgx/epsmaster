import type { Niveau, Dims } from '../types';

/**
 * Arrondit une note à la demi-unité la plus proche en limitant l'intervalle à [0, 20].
 * Exemple : 9,76 → 10 ; 14,9 → 15,0.
 */
export function roundHalf(note: number): number {
  const clamped = Math.max(0, Math.min(20, note));
  return Math.round(clamped * 2) / 2;
}

/**
 * Calcule la note finale sur 20 en fonction du niveau et des dimensions.
 * Les pondérations sont fixées par niveau conformément au cahier des charges.
 */
export function computeNoteFinale(niveau: Niveau, dims: Dims): number {
  let total = 0;
  let coeff = 0;
  const get = (k: keyof Dims) => (dims[k] ?? 0);

  if (niveau === 'TC') {
    total += get('motricite') * 60;
    total += get('comportement') * 20;
    total += get('connaissances') * 20;
    coeff = 100;
  } else if (niveau === '1ère Bac') {
    total += get('motricite') * 50;
    total += get('tactique') * 30;
    total += get('comportement') * 10;
    total += get('connaissances') * 10;
    coeff = 100;
  } else if (niveau === '2ème Bac') {
    total += get('projet') * 40;
    total += get('tactique') * 30;
    total += get('comportement') * 20;
    total += get('connaissances') * 10;
    coeff = 100;
  }
  // Convertir en moyenne sur 20 puis arrondir à 0,5 près.
  const moyenne = coeff > 0 ? total / coeff : 0;
  return roundHalf(moyenne);
}