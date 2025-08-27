import React from 'react';
import { useEpsData } from '../hooks/useEpsData';
import { usePlanification } from '../hooks/usePlanification';

/**
 * Page de démonstration de la nouvelle application de planification
 * au design épuré et professionnel.
 */
export default function PlanningPro() {
  const { state } = useEpsData();
  const { trierSeances } = usePlanification();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
        Planification Professionnelle
      </h1>
      {state.cycles.map(cycle => (
        <div key={cycle.id} className="bg-white shadow-md rounded-lg mb-6 p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{cycle.classeNom}</h2>
          <ul className="divide-y divide-gray-200">
            {trierSeances(cycle.seances).map(seance => (
              <li key={seance.id} className="py-2 flex justify-between">
                <span>
                  {seance.numero}. {seance.date}
                </span>
                {seance.estReportee && (
                  <span className="text-sm text-orange-500">Reportée</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
