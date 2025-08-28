import React, { useState } from 'react';
import { computeNoteFinale } from '../utils/scoring';
import type { Niveau, Dims, Eleve } from '../types';
import GrilleAPS from './GrilleAPS';
import { useEpsData } from '../hooks/useEpsData';

interface EvaluationFormProps {
  eleve: Eleve;
  cycleId: string;
  onSave: (eleveId: string, cycleId: string, evaluation: EvaluationData) => void;
  initialData?: EvaluationData;
}

interface EvaluationData {
  dims: Dims;
  noteFinale: number;
  commentaire?: string;
  dateEvaluation: string;
}

// NOTE: Ces coefficients doivent rester alignés avec computeNoteFinale.
// Si l'utilitaire change, mettez à jour la table ci-dessous ou déportez-la
// dans un module partagé (p.ex. ../utils/scoring).
const COEFFICIENTS: Record<Niveau, Partial<Record<keyof Dims, number>>> = {
  TC: { motricite: 60, comportement: 20, connaissances: 20 },
  "1ère Bac": { motricite: 50, tactique: 30, comportement: 10, connaissances: 10 },
  // Variante observée dans la branche: { projet: 50, tactique: 25, comportement: 15, connaissances: 10 }
  // Choix retenu (main): 40/30/20/10. Adaptez si besoin.
  "2ème Bac": { projet: 40, tactique: 30, comportement: 20, connaissances: 10 },
} as any;

const getDimensionsForNiveau = (niveau: Niveau): (keyof Dims)[] => {
  switch (niveau) {
    case 'TC':
      return ['motricite', 'comportement', 'connaissances'];
    case '1ère Bac':
      return ['motricite', 'tactique', 'comportement', 'connaissances'];
    case '2ème Bac':
      return ['projet', 'tactique', 'comportement', 'connaissances'];
    default:
      return [];
  }
};

const getCoefficient = (niveau: Niveau, dimension: keyof Dims): number => {
  return COEFFICIENTS[niveau]?.[dimension] ?? 0;
};

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  eleve,
  cycleId,
  onSave,
  initialData,
}) => {
  const [dims, setDims] = useState<Dims>(initialData?.dims || {} as Dims);
  const [commentaire, setCommentaire] = useState(initialData?.commentaire || '');
  const { state } = useEpsData();
  const cycle = state.cycles.find((c) => c.id === cycleId);

  const updateDimension = (key: keyof Dims, value: number) => {
    const v = Number.isFinite(value) ? value : 0;
    const clamped = Math.max(0, Math.min(20, v));
    const newDims = { ...dims, [key]: clamped } as Dims;
    setDims(newDims);
  };

  const noteFinale = computeNoteFinale(eleve.niveau, dims);

  const handleSave = () => {
    const evaluation: EvaluationData = {
      dims,
      noteFinale,
      commentaire,
      dateEvaluation: new Date().toISOString().split('T')[0],
    };
    onSave(eleve.id, cycleId, evaluation);
  };

  const dimensions = getDimensionsForNiveau(eleve.niveau);

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <GrilleAPS
        aps={cycle?.aps}
        niveau={eleve.niveau}
        eleve={eleve.nom}
        date={initialData?.dateEvaluation}
      />

      <div className="border-t" />

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Évaluation - {eleve.nom}</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{noteFinale.toFixed(1)}/20</div>
          <div className="text-sm text-gray-500">Note finale</div>
        </div>
      </div>

      <div className="grid gap-4 mb-6">
        {dimensions.map((dim) => (
          <div key={String(dim)} className="flex items-center gap-4">
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {String(dim)}
                <span className="text-xs text-gray-500 ml-1">({getCoefficient(eleve.niveau, dim)}%)</span>
              </label>
            </div>
            <div className="flex-1">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={20}
                step={0.5}
                value={dims[dim] ?? ''}
                onChange={(e) => updateDimension(dim, parseFloat(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
              />
              <span className="ml-2 text-sm text-gray-500">/20</span>
            </div>
            <div className="w-20 text-right text-sm text-gray-600">
              {dims[dim] != null
                ? `${((Number(dims[dim]) * getCoefficient(eleve.niveau, dim)) / 100).toFixed(1)}`
                : '0.0'}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Observations sur la progression de l'élève..."
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h4 className="font-medium mb-2">Détail du calcul :</h4>
        <div className="text-sm space-y-1">
          {dimensions.map((dim) =>
            dims[dim] != null ? (
              <div key={String(dim)} className="flex justify-between">
                <span className="capitalize">
                  {String(dim)} ({getCoefficient(eleve.niveau, dim)}%)
                </span>
                <span>
                  {dims[dim]} × {getCoefficient(eleve.niveau, dim)}% ={' '}
                  {((Number(dims[dim]) * getCoefficient(eleve.niveau, dim)) / 100).toFixed(1)}
                </span>
              </div>
            ) : null
          )}
          <hr className="my-2" />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{noteFinale.toFixed(1)}/20</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          Enregistrer l'évaluation
        </button>
      </div>
    </div>
  );
};

export default EvaluationForm;
