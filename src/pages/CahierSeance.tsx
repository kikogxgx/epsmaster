import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEpsData } from '../hooks/useEpsData';

interface Params {
  classeId: string;
  seanceId: string;
}

/**
 * Page Cahier de séance pour saisir le contenu, les objectifs et les observations de la séance.
 * Les modifications sont sauvegardées automatiquement et à la validation.
 */
const CahierSeance: React.FC = () => {
  const { classeId, seanceId } = useParams<Params>();
  const navigate = useNavigate();
  const { state, updateCycle } = useEpsData();

  const cycle = state.cycles.find(cy => cy.seances.some(s => s.id === seanceId));
  let seance: any = null;
  if (cycle) {
    seance = cycle.seances.find(s => s.id === seanceId);
  }

  // Local state pour le cahier
  const [objectifs, setObjectifs] = useState('');
  const [contenu, setContenu] = useState('');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (seance) {
      setObjectifs(seance.cahier?.objectifs || '');
      setContenu(seance.cahier?.contenu || '');
      setObservations(seance.cahier?.observations || '');
    }
  }, [seance]);

  // Sauvegarder les modifications dans la séance
  const saveCahier = () => {
    if (!cycle || !seance) return;
    const updatedSeances = cycle.seances.map(s => {
      if (s.id !== seanceId) return s;
      return {
        ...s,
        cahier: {
          objectifs: objectifs || undefined,
          contenu: contenu || undefined,
          observations: observations || undefined
        }
      };
    });
    updateCycle(cycle.id, { seances: updatedSeances });
  };

  // Autosave on field change (debounced?) – here simply call saveCahier when fields change
  useEffect(() => {
    saveCahier();
  }, [objectifs, contenu, observations]);

  if (!seance) {
    return <div className="p-6">Séance introuvable</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-neutral-900">Cahier de séance</h1>
      <p className="text-neutral-600">{new Date(seance.date).toLocaleDateString('fr-FR')} — {seance.theme}</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Objectifs</label>
          <textarea
            className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
            rows={3}
            value={objectifs}
            onChange={e => setObjectifs(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Contenu</label>
          <textarea
            className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
            rows={4}
            value={contenu}
            onChange={e => setContenu(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Observations</label>
          <textarea
            className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
            rows={3}
            value={observations}
            onChange={e => setObservations(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          Retour
        </button>
      </div>
    </div>
  );
};

export default CahierSeance;