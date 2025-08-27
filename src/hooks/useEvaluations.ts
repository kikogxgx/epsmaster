import { useLocalStorage } from './useLocalStorage';

export interface Evaluation {
  id: string;
  eleveId: string;
  cycleId: string;
  dims: {
    motricite?: number;
    tactique?: number;
    comportement?: number;
    connaissances?: number;
    projet?: number;
  };
  noteFinale: number;
  commentaire?: string;
  dateEvaluation: string;
}

export function useEvaluations() {
  const [evaluations, setEvaluations] = useLocalStorage<Evaluation[]>('eps:evaluations', []);

  const addEvaluation = (evaluation: Omit<Evaluation, 'id'>) => {
    const newEvaluation: Evaluation = {
      ...evaluation,
      id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setEvaluations(prev => [...prev.filter(e => !(e.eleveId === evaluation.eleveId && e.cycleId === evaluation.cycleId)), newEvaluation]);
  };

  const getEvaluationByCycleAndEleve = (cycleId: string, eleveId: string) => {
    return evaluations.find(e => e.cycleId === cycleId && e.eleveId === eleveId);
  };

  const getEvaluationsByEleve = (eleveId: string) => {
    return evaluations.filter(e => e.eleveId === eleveId);
  };

  const getEvaluationsByCycle = (cycleId: string) => {
    return evaluations.filter(e => e.cycleId === cycleId);
  };

  return {
    evaluations,
    addEvaluation,
    getEvaluationByCycleAndEleve,
    getEvaluationsByEleve,
    getEvaluationsByCycle
  };
}
