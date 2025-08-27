import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calculator } from 'lucide-react';
import { useEpsData } from '../hooks/useEpsData';

interface Params {
  classeId: string;
  seanceId: string;
}

interface EvaluationEleve {
  eleveId: string;
  notes: {
    technique: number;
    tactique: number;
    engagement: number;
    assiduite: number;
  };
  moyenne: number;
  commentaire: string;
}

const EvaluationSeance: React.FC = () => {
  const { classeId, seanceId } = useParams<Params>();
  const navigate = useNavigate();
  const { state, updateCycle } = useEpsData();

  // Trouver la séance et le cycle correspondant
  const cycle = state.cycles.find(cy => cy.seances.some(s => s.id === seanceId));
  const seance = cycle ? cycle.seances.find(s => s.id === seanceId) : null;

  // Trouver la classe et les élèves actifs
  const classe = state.classes.find(c => c.id === classeId);
  const eleves = state.eleves.filter(e => e.classeId === classeId && e.actif !== false);

  // État des évaluations
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationEleve>>({});

  useEffect(() => {
    if (seance && eleves.length > 0) {
      const initial: Record<string, EvaluationEleve> = {};
      
      if (seance.evaluations && seance.evaluations.length > 0) {
        // Charger les évaluations existantes
        seance.evaluations.forEach((evalData: any) => {
          initial[evalData.eleveId] = evalData;
        });
      } else {
        // Initialiser les évaluations vides pour tous les élèves
        eleves.forEach(eleve => {
          initial[eleve.id] = {
            eleveId: eleve.id,
            notes: {
              technique: 0,
              tactique: 0,
              engagement: 0,
              assiduite: 0
            },
            moyenne: 0,
            commentaire: ''
          };
        });
      }
      
      setEvaluations(initial);
    }
  }, [seance, eleves]);

  // Calculer la moyenne d'un élève
  const calculerMoyenne = (notes: EvaluationEleve['notes']): number => {
    const valeurs = Object.values(notes);
    const somme = valeurs.reduce((acc, note) => acc + note, 0);
    return Math.round((somme / valeurs.length) * 10) / 10;
  };

  // Mettre à jour une note
  const updateNote = (eleveId: string, critere: keyof EvaluationEleve['notes'], valeur: number) => {
    setEvaluations(prev => {
      const newEvals = { ...prev };
      const evaluation = { ...newEvals[eleveId] }; // ✅ Changé "eval" en "evaluation"
      
      // Limiter la valeur entre 0 et 20
      evaluation.notes[critere] = Math.max(0, Math.min(20, valeur));
      
      // Recalculer la moyenne
      evaluation.moyenne = calculerMoyenne(evaluation.notes);
      
      newEvals[eleveId] = evaluation;
      return newEvals;
    });
  };

  // Mettre à jour un commentaire
  const updateCommentaire = (eleveId: string, commentaire: string) => {
    setEvaluations(prev => ({
      ...prev,
      [eleveId]: {
        ...prev[eleveId],
        commentaire
      }
    }));
  };

  // Sauvegarder les évaluations
  const saveEvaluations = () => {
    if (!cycle || !seance) return;

    const evaluationsList = eleves.map(eleve => evaluations[eleve.id]).filter(Boolean);

    const updatedSeances = cycle.seances.map(s => {
      if (s.id !== seanceId) return s;

      return {
        ...s,
        evaluations: evaluationsList,
        statut: 'Évaluée' as const
      };
    });

    updateCycle(cycle.id, { seances: updatedSeances });
    navigate(-1);
  };

  // Obtenir la couleur selon la note
  const getNoteColor = (note: number): string => {
    if (note >= 16) return 'text-green-600';
    if (note >= 12) return 'text-blue-600';
    if (note >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!seance || !classe) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg text-neutral-600">Séance introuvable</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 text-primary-600 hover:text-primary-800"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-neutral-600 hover:text-primary-600 p-1"
          title="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900">
            Évaluation — {classe.nom}
          </h1>
          <p className="text-neutral-600">
            {new Date(seance.date).toLocaleDateString('fr-FR')} • {seance.theme}
          </p>
        </div>
        <button
          onClick={saveEvaluations}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Save className="w-4 h-4 inline mr-2" />
          Enregistrer
        </button>
      </div>

      {/* Tableau d'évaluation */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {eleves.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            Aucun élève dans cette classe.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Technique
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Tactique
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Assiduité
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Moyenne
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Commentaire
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {eleves.map(el => {
                  const evaluation = evaluations[el.id];
                  if (!evaluation) return null;
                  
                  return (
                    <tr key={el.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {el.photoBase64 && (
                            <img 
                              src={el.photoBase64} 
                              alt={el.nom}
                              className="w-8 h-8 rounded-full object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-neutral-900">
                              {el.nom} {el.prenom || ''}
                            </div>
                            {el.numero && (
                              <div className="text-sm text-neutral-500">
                                N° {el.numero}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* Notes pour chaque critère */}
                      {(['technique', 'tactique', 'engagement', 'assiduite'] as const).map(critere => (
                        <td key={critere} className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={evaluation.notes[critere] || 0}
                            onChange={(e) => updateNote(el.id, critere, parseFloat(e.target.value) || 0)}
                            className="w-16 text-center px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <div className="text-xs text-gray-500 mt-1">/20</div>
                        </td>
                      ))}
                      
                      {/* Moyenne */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className={`text-lg font-semibold ${getNoteColor(evaluation.moyenne)}`}>
                          {evaluation.moyenne > 0 ? evaluation.moyenne.toFixed(1) : '0.0'}
                        </div>
                        <div className="text-xs text-gray-500">/20</div>
                      </td>
                      
                      {/* Commentaire */}
                      <td className="px-6 py-4">
                        <textarea
                          value={evaluation.commentaire}
                          onChange={(e) => updateCommentaire(el.id, e.target.value)}
                          placeholder="Observations..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistiques de classe */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(() => {
          const moyennesValides = eleves
            .map(el => evaluations[el.id]?.moyenne || 0)
            .filter(m => m > 0);
          
          const moyenneClasse = moyennesValides.length > 0 
            ? moyennesValides.reduce((sum, m) => sum + m, 0) / moyennesValides.length 
            : 0;
          
          const notesSupA16 = moyennesValides.filter(m => m >= 16).length;
          const notesSupA12 = moyennesValides.filter(m => m >= 12).length;
          const notesInfA10 = moyennesValides.filter(m => m < 10).length;
          
          return [
            { 
              label: 'Moyenne classe', 
              value: moyenneClasse > 0 ? moyenneClasse.toFixed(1) : '0.0', 
              color: getNoteColor(moyenneClasse)
            },
            { 
              label: 'Excellentes (≥16)', 
              value: notesSupA16.toString(), 
              color: 'text-green-600' 
            },
            { 
              label: 'Bonnes (≥12)', 
              value: notesSupA12.toString(), 
              color: 'text-blue-600' 
            },
            { 
              label: 'Insuffisantes (<10)', 
              value: notesInfA10.toString(), 
              color: 'text-red-600' 
            }
          ];
        })().map(stat => (
          <div key={stat.label} className="bg-white p-4 rounded-lg border text-center">
            <div className="text-sm text-neutral-600 mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Calculator className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Aide à l'évaluation</h3>
            <div className="text-sm text-blue-700 mt-1">
              <p><strong>Technique :</strong> Maîtrise des gestes techniques de l'APS</p>
              <p><strong>Tactique :</strong> Compréhension et application des stratégies</p>
              <p><strong>Engagement :</strong> Implication et participation active</p>
              <p><strong>Assiduité :</strong> Présence et ponctualité aux séances</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationSeance;
