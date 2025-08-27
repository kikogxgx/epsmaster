import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEpsData } from '../hooks/useEpsData';

interface Params {
  classeId: string;
  seanceId: string;
}

/**
 * Page pour prendre l’appel des élèves lors d’une séance.
 * Permet de sélectionner rapidement le statut de chaque élève (Présent, Retard, Absent, Excusé).
 * Les données sont enregistrées dans la séance correspondante lors de la validation.
 */
const AppelSeance: React.FC = () => {
  const { classeId, seanceId } = useParams<Params>();
  const navigate = useNavigate();
  const { state, updateCycle } = useEpsData();

  // Trouver la séance et le cycle correspondant
  // Trouver le cycle et la séance contenant seanceId
  const cycle = state.cycles.find(cy => cy.seances.some(s => s.id === seanceId));
  let seance: any = null;
  if (cycle) {
    seance = cycle.seances.find(s => s.id === seanceId);
  }
  // Trouver la classe et les élèves actifs
  const classe = state.classes.find(c => c.id === classeId);
  const eleves = state.eleves.filter(e => e.classeId === classeId && (e as any).actif !== false);

  // Initialiser l’état local pour la liste d’appel
  const [listeAppel, setListeAppel] = useState<Record<string, { statut: 'PRESENT' | 'RETARD' | 'ABSENT' | 'EXCUSE'; comportement?: string }>>({});

  useEffect(() => {
    if (seance) {
      // Charger l’existant
      const initial: Record<string, { statut: 'PRESENT' | 'RETARD' | 'ABSENT' | 'EXCUSE'; comportement?: string }> = {};
      seance.listeAppel?.forEach((item: any) => {
        initial[item.eleveId] = { statut: item.statut, comportement: item.comportement };
      });
      setListeAppel(initial);
    }
  }, [seance]);

  // Définir un statut pour un élève
  const setStatut = (eleveId: string, statut: 'PRESENT' | 'RETARD' | 'ABSENT' | 'EXCUSE') => {
    setListeAppel(prev => ({ ...prev, [eleveId]: { statut } }));
  };

  // Compter les statuts
  const countStatut = (statut: 'PRESENT' | 'RETARD' | 'ABSENT' | 'EXCUSE'): number => {
    return eleves.reduce((acc, el) => (listeAppel[el.id]?.statut === statut ? acc + 1 : acc), 0);
  };

  // Tout présent
  const markAllPresent = () => {
    const all: Record<string, { statut: 'PRESENT' | 'RETARD' | 'ABSENT' | 'EXCUSE' }> = {};
    eleves.forEach(el => {
      all[el.id] = { statut: 'PRESENT' };
    });
    setListeAppel(all);
  };

  // Enregistrer l’appel et mettre à jour la séance
  const saveAppel = () => {
    if (!cycle || !seance) return;
    const updatedSeances = cycle.seances.map(s => {
      if (s.id !== seanceId) return s;
      // Construire la liste d’appel sous forme de tableau
      const newListe = eleves.map(el => ({
        eleveId: el.id,
        nom: `${el.nom} ${el.prenom ?? ''}`.trim(),
        statut: listeAppel[el.id]?.statut || 'ABSENT',
        comportement: listeAppel[el.id]?.comportement || ''
      }));
      return {
        ...s,
        listeAppel: newListe,
        statut: 'Appel fait'
      };
    });
    updateCycle(cycle.id, { seances: updatedSeances });
    navigate(-1);
  };

  if (!seance || !classe) {
    return <div className="p-6">Séance introuvable</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Appel — {classe.nom} ({new Date(seance.date).toLocaleDateString('fr-FR')})</h1>
      {/* Compteurs */}
      <div className="flex flex-wrap gap-4">
        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">Présents : {countStatut('PRESENT')}</span>
        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">Retards : {countStatut('RETARD')}</span>
        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">Absents : {countStatut('ABSENT')}</span>
        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">Excusés : {countStatut('EXCUSE')}</span>
      </div>
      {/* Boutons rapides */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={markAllPresent}
          className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          Tout présent
        </button>
        <button
          onClick={saveAppel}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Enregistrer
        </button>
      </div>
      {/* Liste des élèves */}
      <div className="mt-6 space-y-4">
        {eleves.length === 0 ? (
          <p>Aucun élève dans cette classe.</p>
        ) : (
          eleves.map(el => {
            const statut = listeAppel[el.id]?.statut;
            return (
              <div key={el.id} className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <span className="font-medium text-neutral-900">{el.nom} {el.prenom}</span>
                <div className="flex gap-2">
                  {(['PRESENT', 'RETARD', 'ABSENT', 'EXCUSE'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setStatut(el.id, opt)}
                      className={
                        'px-3 py-1 rounded-full text-xs font-medium ' +
                        (statut === opt
                          ? opt === 'PRESENT'
                            ? 'bg-green-600 text-white'
                            : opt === 'RETARD'
                              ? 'bg-yellow-600 text-white'
                              : opt === 'ABSENT'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-600 text-white'
                          : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300')
                      }
                    >
                      {opt === 'PRESENT'
                        ? 'Présent'
                        : opt === 'RETARD'
                        ? 'Retard'
                        : opt === 'ABSENT'
                        ? 'Absent'
                        : 'Excusé'}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AppelSeance;