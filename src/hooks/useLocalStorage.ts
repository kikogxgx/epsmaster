import { useState, useEffect } from 'react';

/**
 * Hook simplifié pour synchroniser un état React avec localStorage.
 * Toutes les écritures sont automatiquement persistées sous forme de JSON.
 *
 * @param key Nom de la clé localStorage
 * @param initialValue Valeur initiale si aucune donnée n'existe dans le storage
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // ignore parsing errors and fallback to initial value
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage peut être indisponible (quota) : on ignore l'erreur.
    }
  }, [key, state]);

  return [state, setState];
}