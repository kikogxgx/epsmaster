import { useMemo } from 'react';

/**
 * Hook qui renvoie la date courante au format ISO (AAAA-MM-JJ) en tenant compte du fuseau horaire local.
 * On utilise useMemo pour ne recalculer la date qu'une seule fois lors du rendu initial.
 */
export function useToday(): string {
  return useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);
}