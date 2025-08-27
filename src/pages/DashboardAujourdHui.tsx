import React from 'react';
import { Link } from 'react-router-dom';
import { useEpsData } from '../hooks/useEpsData';
import { useToday } from '../hooks/useToday';

/**
 * Page Dashboard pour afficher toutes les séances du jour courant.
 * Affiche une carte "Aucune séance" si aucune séance n'est planifiée pour aujourd'hui.
 * Chaque séance est présentée avec son statut et des actions rapides vers l'appel, le cahier et l'évaluation.
 */
const DashboardAujourdHui: React.FC = () => {
  const { state } = useEpsData();
  const todayIso = useToday();

  // Extraire toutes les séances du jour
  const seancesAujourdHui = state.cycles
    .flatMap(cycle =>
      cycle.seances.map(seance => ({
        ...seance,
        classeId: cycle.classeId,
        classeNom: cycle.classeNom,
        aps: cycle.aps,
        cycleId: cycle.id
      }))
    )
    .filter(seance => seance.date === todayIso)
    .sort((a, b) => {
      // Trier par heure croissante (HH:MM)
      const ah = a.heure || '';
      const bh = b.heure || '';
      return ah.localeCompare(bh);
    });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-neutral-900">Séances d'aujourd'hui</h1>
      <p className="text-neutral-600">Séances planifiées pour le {new Date(todayIso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      {seancesAujourdHui.length === 0 ? (
        <div className="bg-white border border-neutral-100 shadow-sm rounded-lg p-8 text-center text-neutral-500">
          Aucune séance
        </div>
      ) : (
        <div className="space-y-4">
          {seancesAujourdHui.map(seance => (
            <div key={`${seance.cycleId}-${seance.id}`} className="bg-white border border-neutral-100 shadow-sm rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-2 md:mb-0">
                <p className="text-sm font-semibold text-neutral-900">{seance.classeNom} • {seance.aps}</p>
                <p className="text-sm text-neutral-700">{seance.heure || 'Heure non définie'} — {seance.theme}</p>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                {/* Badge de statut */}
                <span className={
                  seance.statut === 'Évaluée'
                    ? 'px-2 py-1 rounded-full text-xs font-medium text-white bg-green-500'
                    : seance.statut === 'Appel fait'
                      ? 'px-2 py-1 rounded-full text-xs font-medium text-white bg-blue-500'
                      : 'px-2 py-1 rounded-full text-xs font-medium text-neutral-600 bg-neutral-200'
                }>
                  {seance.statut || 'Planifiée'}
                </span>
                {/* Actions */}
                <Link
                  to={`/classe/${seance.classeId}/seance/${seance.id}/appel`}
                  className="px-3 py-1 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  Appel
                </Link>
                <Link
                  to={`/classe/${seance.classeId}/seance/${seance.id}/cahier`}
                  className="px-3 py-1 rounded-md bg-white border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  Cahier
                </Link>
                {seance.evalDue && (
                  <Link
                    to={`/classe/${seance.classeId}/seance/${seance.id}/evaluation`}
                    className="px-3 py-1 rounded-md bg-white border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  >
                    Évaluation
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardAujourdHui;