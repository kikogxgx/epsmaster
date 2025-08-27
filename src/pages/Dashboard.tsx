import React from 'react';
import { useEpsData } from '../hooks/useEpsData';
import { Calendar, Users, BookOpen, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state } = useEpsData();

  // Récupérer les séances des 7 prochains jours
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const prochainesSeances = state.cycles
    .flatMap(cycle => 
      cycle.seances.map(seance => ({
        ...seance,
        classeNom: cycle.classeNom,
        cycleId: cycle.id,
        aps: cycle.aps,
        uniqueId: `${cycle.id}-${seance.id}` // ✅ Clé unique garantie
      }))
    )
    .filter(seance => {
      const seanceDate = new Date(seance.date);
      return seanceDate >= today && seanceDate <= nextWeek && !seance.locked;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);

  const stats = {
    totalClasses: state.classes.length,
    totalEleves: state.eleves.length,
    totalCycles: state.cycles.length,
    seancesAPrevenir: prochainesSeances.length
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
      <p className="text-neutral-600">Vue d'ensemble de votre activité EPS</p>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-neutral-100 shadow-sm rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-600" />
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalClasses}</p>
              <p className="text-neutral-600 text-sm">Classes</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-100 shadow-sm rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-success-600" />
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalEleves}</p>
              <p className="text-neutral-600 text-sm">Élèves</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-100 shadow-sm rounded-lg p-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalCycles}</p>
              <p className="text-neutral-600 text-sm">Cycles</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-100 shadow-sm rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-warning-600" />
            <div>
              <p className="text-2xl font-bold text-neutral-900">{stats.seancesAPrevenir}</p>
              <p className="text-neutral-600 text-sm">Séances à venir</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prochaines séances */}
      <div className="bg-white border border-neutral-100 shadow-sm rounded-lg">
        <div className="p-6 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Prochaines séances (7 jours)</h2>
        </div>
        <div className="p-6">
          {prochainesSeances.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">Aucune séance prévue dans les 7 prochains jours</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prochainesSeances.map(seance => (
                <div 
                  key={seance.uniqueId}  // ✅ Clé unique composée cycle+seance
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {new Date(seance.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-500">
                      {seance.heure || 'Heure non définie'}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-900">{seance.classeNom}</p>
                    <p className="text-sm text-neutral-600">{seance.aps} • {seance.theme}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cycles récents */}
      <div className="bg-white border border-neutral-100 shadow-sm rounded-lg">
        <div className="p-6 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">Cycles récents</h2>
        </div>
        <div className="p-6">
          {state.cycles.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">Aucun cycle créé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.cycles.slice(0, 6).map(cycle => (
                <div
                  key={cycle.id}  // ✅ Clé unique sur cycle.id
                  className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-neutral-900">{cycle.classeNom}</h3>
                    <span className="text-xs text-neutral-500">M{cycle.module}</span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{cycle.aps}</p>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>{cycle.seances.length} séances</span>
                    <span>S{cycle.semestre}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
