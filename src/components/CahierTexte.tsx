import React, { useState } from 'react';
import type { Cahier, Seance } from '../types';

interface CahierTexteProps {
  seance: Seance;
  onUpdate: (seanceId: string, cahier: Cahier) => void;
}

const CahierTexte: React.FC<CahierTexteProps> = ({ seance, onUpdate }) => {
  const [cahier, setCahier] = useState<Cahier>(seance.cahier || {});
  const [activeTab, setActiveTab] = useState<keyof Cahier>('objectifs');

  const handleFieldChange = (field: keyof Cahier, value: string) => {
    const newCahier = { ...cahier, [field]: value };
    setCahier(newCahier);
    onUpdate(seance.id, newCahier);
  };

  const tabs: { key: keyof Cahier; label: string; placeholder: string }[] = [
    {
      key: 'objectifs',
      label: 'Objectifs',
      placeholder: 'Objectifs pédagogiques de la séance...'
    },
    {
      key: 'contenu',
      label: 'Contenu',
      placeholder: 'Déroulement de la séance, exercices, situations...'
    },
    {
      key: 'organisation',
      label: 'Organisation',
      placeholder: 'Organisation matérielle et spatiale...'
    },
    {
      key: 'consignes',
      label: 'Consignes',
      placeholder: 'Consignes données aux élèves...'
    },
    {
      key: 'criteres',
      label: 'Critères',
      placeholder: 'Critères d\'évaluation et de réussite...'
    }
  ];

  const getCompletionPercentage = () => {
    const filledFields = tabs.filter(tab => cahier[tab.key]?.trim()).length;
    return Math.round((filledFields / tabs.length) * 100);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Cahier de texte - Séance {seance.numero}
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">
            Complété à {getCompletionPercentage()}%
          </div>
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {cahier[tab.key]?.trim() && (
                <span className="ml-1 w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[200px]">
        {tabs.map(tab => (
          activeTab === tab.key && (
            <div key={tab.key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {tab.label}
              </label>
              <textarea
                value={cahier[tab.key] || ''}
                onChange={(e) => handleFieldChange(tab.key, e.target.value)}
                placeholder={tab.placeholder}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
              <div className="text-xs text-gray-500">
                {(cahier[tab.key] || '').length} caractères
              </div>
            </div>
          )
        ))}
      </div>

      {/* Templates pré-remplis */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Templates rapides :</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFieldChange('objectifs', 
              `- Développer la motricité spécifique à l'APS\n- Améliorer la technique gestuelle\n- Renforcer l'esprit d'équipe`
            )}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            Objectifs type
          </button>
          <button
            onClick={() => handleFieldChange('organisation', 
              `Matériel : \nEspace : \nGroupes : \nDurée : ${seance.heure || '60'} min`
            )}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            Organisation type
          </button>
          <button
            onClick={() => handleFieldChange('criteres', 
              `Critères de réussite :\n- \n- \n\nCritères de réalisation :\n- \n- `
            )}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            Critères type
          </button>
        </div>
      </div>
    </div>
  );
};

export default CahierTexte;
