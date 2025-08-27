import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, FileText, Users, CheckCircle2, Clock } from 'lucide-react';
import { useEpsData } from '../hooks/useEpsData';
import { exportPdfCycle } from '../utils/exportPdf';
import type { Cycle, Seance } from '../types';

const CycleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useEpsData();
  
  const cycle = state.cycles.find(c => c.id === id);
  
  if (!cycle) {
    navigate('/cycles');
    return null;
  }

  const [activeTab, setActiveTab] = useState<'planning' | 'appel' | 'cahier' | 'evaluation'>('planning');

  // Calculs de progression
  const totalSeances = cycle.seances.length;
  const seancesRealisees = cycle.seances.filter(s => s.locked).length;
  const seancesAvecAppel = cycle.seances.filter(s => s.statut === 'Appel fait' || s.statut === 'Évaluée').length;
  const seancesEvaluees = cycle.seances.filter(s => s.statut === 'Évaluée').length;

  const progressionAppel = totalSeances > 0 ? Math.round((seancesAvecAppel / totalSeances) * 100) : 0;
  const progressionEvaluation = totalSeances > 0 ? Math.round((seancesEvaluees / totalSeances) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/cycles')}
          className="text-neutral-600 hover:text-primary-600 p-1"
          title="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900">
            {cycle.aps} — Module {cycle.module}
          </h1>
          <p className="text-neutral-600">
            {cycle.classeNom} • Semestre {cycle.semestre} • {totalSeances} séances
          </p>
        </div>
        <button
          onClick={() => exportPdfCycle(cycle)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Export PDF
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-neutral-600">Progression</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {seancesRealisees}/{totalSeances}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-sm text-neutral-600">Appels</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {progressionAppel}%
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-neutral-600">Évaluations</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {progressionEvaluation}%
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-neutral-600">Statut</span>
          </div>
          <div className="text-lg font-medium text-neutral-900 mt-1 capitalize">
            {cycle.statut || 'Planifié'}
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8">
          {[
            { key: 'planning', label: 'Planning', count: totalSeances },
            { key: 'appel', label: 'Appels', count: seancesAvecAppel },
            { key: 'cahier', label: 'Cahier', count: cycle.seances.filter(s => s.cahier?.objectifs || s.cahier?.contenu).length },
            { key: 'evaluation', label: 'Évaluations', count: seancesEvaluees }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Onglet Planning */}
        {activeTab === 'planning' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">N°</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Thème</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {cycle.seances.length > 0 ? cycle.seances.map((seance) => (
                  <tr key={seance.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {seance.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {new Date(seance.date).toLocaleDateString('fr-FR')}
                      {seance.estReportee && seance.dateOriginale && (
                        <div className="text-xs text-orange-600 mt-1">
                          Initialement : {new Date(seance.dateOriginale).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {seance.heure || '09:30'}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {seance.theme}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        seance.locked 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {seance.locked ? 'Réalisée' : 'Planifiée'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                      Aucune séance planifiée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Onglet Appels */}
        {activeTab === 'appel' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">N°</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Appel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {cycle.seances.length > 0 ? cycle.seances.map((seance) => {
                  const appelStatus = seance.listeAppel?.length > 0 ? 'Fait' : 'À faire';
                  
                  return (
                    <tr key={seance.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {seance.numero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {new Date(seance.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {seance.heure || '09:30'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appelStatus === 'Fait' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appelStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/appel/${cycle.classeId}/${seance.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Prendre l'appel
                        </Link>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                      Aucune séance planifiée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Onglet Cahier */}
        {activeTab === 'cahier' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">N°</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Cahier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {cycle.seances.length > 0 ? cycle.seances.map((seance) => {
                  const cahierStatus = (seance.cahier?.objectifs || seance.cahier?.contenu) ? 'Complété' : 'Vide';
                  
                  return (
                    <tr key={seance.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {seance.numero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {new Date(seance.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {seance.heure || '09:30'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cahierStatus === 'Complété' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {cahierStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/cahier/${cycle.classeId}/${seance.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Ouvrir le cahier
                        </Link>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                      Aucune séance planifiée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Onglet Évaluations */}
        {activeTab === 'evaluation' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">N°</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Évaluation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {cycle.seances.length > 0 ? cycle.seances.map((seance) => {
                  const evaluationStatus = seance.statut === 'Évaluée' ? 'Fait' : seance.evalDue ? 'Prévue' : 'Non prévue';
                  
                  return (
                    <tr key={seance.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {seance.numero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {new Date(seance.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {seance.heure || '09:30'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          evaluationStatus === 'Fait' 
                            ? 'bg-green-100 text-green-800' 
                            : evaluationStatus === 'Prévue'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {evaluationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {seance.evalDue ? (
                          <Link
                            to={`/evaluation/${cycle.classeId}/${seance.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            {seance.statut === 'Évaluée' ? 'Voir' : 'Évaluer'}
                          </Link>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                      Aucune séance planifiée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CycleDetailPage;
