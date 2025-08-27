import React, { useState } from 'react';
import { useEpsData } from '../hooks/useEpsData';
import type { Seance, ListeAppelItem, Eleve } from '../types';

interface ListeAppelProps {
  seance: Seance;
  eleves: Eleve[];
  onUpdate: (seanceId: string, listeAppel: ListeAppelItem[]) => void;
}

const ListeAppel: React.FC<ListeAppelProps> = ({ seance, eleves, onUpdate }) => {
  const [listeAppel, setListeAppel] = useState<ListeAppelItem[]>(
    seance.listeAppel.length > 0 
      ? seance.listeAppel 
      : eleves.map(eleve => ({
          eleveId: eleve.id,
          nom: eleve.nom,
          statut: 'P' as const,
          comportement: ''
        }))
  );

  const updateStatut = (eleveId: string, statut: 'P' | 'A' | 'R' | 'S' | 'M') => {
    const newListe = listeAppel.map(item => 
      item.eleveId === eleveId ? { ...item, statut } : item
    );
    setListeAppel(newListe);
    onUpdate(seance.id, newListe);
  };

  const updateComportement = (eleveId: string, comportement: '+' | '-' | '') => {
    const newListe = listeAppel.map(item => 
      item.eleveId === eleveId ? { ...item, comportement } : item
    );
    setListeAppel(newListe);
    onUpdate(seance.id, newListe);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'P': return 'bg-green-100 text-green-800';
      case 'A': return 'bg-red-100 text-red-800';
      case 'R': return 'bg-yellow-100 text-yellow-800';
      case 'S': return 'bg-blue-100 text-blue-800';
      case 'M': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    present: listeAppel.filter(item => item.statut === 'P').length,
    absent: listeAppel.filter(item => item.statut === 'A').length,
    total: listeAppel.length
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Liste d'appel - Séance {seance.numero}</h3>
        <div className="text-sm text-gray-600">
          <span className="bg-green-100 px-2 py-1 rounded mr-2">
            Présents: {stats.present}/{stats.total}
          </span>
          <span className="bg-red-100 px-2 py-1 rounded">
            Absents: {stats.absent}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2">Élève</th>
              <th className="text-center p-2">Présence</th>
              <th className="text-center p-2">Comportement</th>
            </tr>
          </thead>
          <tbody>
            {listeAppel.map((item) => (
              <tr key={item.eleveId} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{item.nom}</td>
                <td className="p-2">
                  <div className="flex justify-center gap-1">
                    {(['P', 'A', 'R', 'S', 'M'] as const).map((statut) => (
                      <button
                        key={statut}
                        onClick={() => updateStatut(item.eleveId, statut)}
                        className={`px-2 py-1 rounded text-xs font-medium border ${
                          item.statut === statut
                            ? getStatutColor(statut) + ' border-current'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                        title={{
                          P: 'Présent',
                          A: 'Absent',
                          R: 'Retard',
                          S: 'Sortie anticipée',
                          M: 'Maladie'
                        }[statut]}
                      >
                        {statut}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex justify-center gap-1">
                    {(['+', '', '-'] as const).map((comp) => (
                      <button
                        key={comp || 'neutre'}
                        onClick={() => updateComportement(item.eleveId, comp)}
                        className={`w-8 h-8 rounded text-sm font-bold border ${
                          item.comportement === comp
                            ? comp === '+' ? 'bg-green-100 text-green-800 border-green-300'
                              : comp === '-' ? 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-gray-100 text-gray-600 border-gray-300'
                            : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {comp || '○'}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListeAppel;
