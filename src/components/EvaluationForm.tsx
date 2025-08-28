import React, { useState } from 'react';
import { computeNoteFinale } from '../utils/scoring';
import type { Niveau, Dims, Eleve } from '../types';
import GrilleAPS from './GrilleAPS';

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

const EvaluationForm: React.FC<EvaluationFormProps> = ({ 
  eleve, 
  cycleId, 
  onSave, 
  initialData 
}) => {
  const [dims, setDims] = useState<Dims>(initialData?.dims || {});
  const [commentaire, setCommentaire] = useState(initialData?.commentaire || '');

  const updateDimension = (key: keyof Dims, value: number) => {
    const newDims = { ...dims, [key]: Math.max(0, Math.min(20, value)) };
    setDims(newDims);
  };

  const noteFinale = computeNoteFinale(eleve.niveau, dims);

  const handleSave = () => {
    const evaluation: EvaluationData = {
      dims,
      noteFinale,
      commentaire,
      dateEvaluation: new Date().toISOString().split('T')[0]
    };
    onSave(eleve.id, cycleId, evaluation);
  };

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
    const coefficients = {
      'TC': { motricite: 60, comportement: 20, connaissances: 20 },
      '1ère Bac': { motricite: 50, tactique: 30, comportement: 10, connaissances: 10 },
      '2ème Bac': { projet: 40, tactique: 30, comportement: 20, connaissances: 10 }
    };
    return coefficients[niveau]?.[dimension] || 0;
  };

  const dimensions = getDimensionsForNiveau(eleve.niveau);

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <GrilleAPS />
      <div className="border-t" />
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">
          Évaluation - {eleve.nom}
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {noteFinale.toFixed(1)}/20
          </div>
          <div className="text-sm text-gray-500">Note finale</div>
        </div>
      </div>

      <div className="grid gap-4 mb-6">
        {dimensions.map((dim) => (
          <div key={dim} className="flex items-center gap-4">
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {dim}
                <span className="text-xs text-gray-500 ml-1">
                  ({getCoefficient(eleve.niveau, dim)}%)
                </span>
              </label>
            </div>
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={dims[dim] || ''}
                onChange={(e) => updateDimension(dim, parseFloat(e.target.value) || 0)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
              />
              <span className="ml-2 text-sm text-gray-500">/20</span>
            </div>
            <div className="w-20 text-right text-sm text-gray-600">
              {dims[dim] ? `${((dims[dim]! * getCoefficient(eleve.niveau, dim)) / 100).toFixed(1)}` : '0.0'}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Commentaire
        </label>
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
          {dimensions.map((dim) => (
            dims[dim] ? (
              <div key={dim} className="flex justify-between">
                <span className="capitalize">{dim} ({getCoefficient(eleve.niveau, dim)}%)</span>
                <span>{dims[dim]} × {getCoefficient(eleve.niveau, dim)}% = {((dims[dim]! * getCoefficient(eleve.niveau, dim)) / 100).toFixed(1)}</span>
              </div>
            ) : null
          ))}
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
