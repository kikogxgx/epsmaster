import type { Niveau, Dims } from '../types';

/**
 * Arrondi une note à la demi-unité près en limitant l'intervalle à [0, 20].
 * Exemple : 9,76 → 9,5 ; 14,9 → 15,0.
 */
export function roundHalf(note: number): number {
  const clamped = Math.max(0, Math.min(20, note));
  const floored = Math.floor(clamped * 10) / 10; // tronquer à 1 décimale
  const base = Math.floor(floored);
  const decimal = floored - base;
  if (decimal >= 0.75) return base + 1;
  if (decimal >= 0.25) return base + 0.5;
  return base;
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
    // Pondérations spécifiques : projet 50 %, tactique 25 %, comportement 15 %, connaissances 10 %
    total += get('projet') * 50;
    total += get('tactique') * 25;
    total += get('comportement') * 15;
    total += get('connaissances') * 10;
    coeff = 100;
  }
  // Convertir en moyenne sur 20 puis arrondir à 0,5 près.
  const moyenne = coeff > 0 ? total / coeff : 0;
  return roundHalf(moyenne);
}