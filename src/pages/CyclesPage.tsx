import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useEpsData } from '../hooks/useEpsData';
import type { Cycle } from '../types';
import objectifs from '../data/objectifs';

const CyclesPage: React.FC = () => {
  const { state, createCycle, deleteCycle } = useEpsData();
  const navigate = useNavigate();

  // --- Formulaire ---
  // Lors de la création d'un cycle, on peut cibler soit une classe spécifique (classeId)
  // soit un niveau complet (niveauSelect). Si classeId est renseigné, niveauSelect est ignoré.
  const [classeId, setClasseId] = useState('');
  const [niveauSelect, setNiveauSelect] = useState('');
  const [module, setModule] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [aps, setAps] = useState('');
  const [semestre, setSemestre] = useState<1 | 2>(1);
  const [nbSeances, setNbSeances] = useState(12);
  const [startDate, setStartDate] = useState('2025-09-01');

  /**
   * Retourne la liste des APS disponibles en fonction de la classe ou du niveau sélectionnés.
   * Si une classe est choisie, on utilise son niveau pour chercher les objectifs.
   * Si un niveau est choisi, on utilise ce niveau.
   * En l'absence de niveau, on se replie sur le niveau TC pour éviter les erreurs.
   */
  const getAvailableAps = (): { aps: string; seances: string[] }[] => {
    // Déterminer le niveau à utiliser
    let level: string = '';
    if (classeId) {
      const cls = state.classes.find(c => c.id === classeId);
      level = cls?.niveau || '';
    } else if (niveauSelect) {
      level = niveauSelect;
    }
    if (!level) {
      level = 'TC';
    }
    const niveauObj: any = (objectifs as any)[level] || {};
    // Chercher le module pour ce niveau
    let moduleObj: any = niveauObj[module];
    if (!moduleObj) {
      const modulesDisponibles = Object.values(niveauObj);
      moduleObj = modulesDisponibles.length > 0 ? modulesDisponibles[0] : null;
    }
    return moduleObj?.aps || [];
  };

  /**
   * Retourne la liste des modules disponibles pour la classe ou le niveau sélectionné.
   * Chaque entrée contient le numéro du module et son nom complet.
   */
  const getAvailableModules = (): { numero: number; nom: string }[] => {
    // Construire une liste globale de modules en rassemblant tous ceux définis
    // dans le fichier d'objectifs, peu importe le niveau. S'il existe des
    // doublons de numéro entre niveaux, on garde le premier rencontré.
    const modulesMap = new Map<number, string>();
    const niveaux = Object.keys(objectifs) as (keyof typeof objectifs)[];
    niveaux.forEach(niv => {
      const niveauObj: any = (objectifs as any)[niv] || {};
      Object.values(niveauObj).forEach((m: any) => {
        if (!modulesMap.has(m.numero)) {
          modulesMap.set(m.numero, m.nom);
        }
      });
    });
    const result: { numero: number; nom: string }[] = [];
    modulesMap.forEach((nom, numero) => {
      result.push({ numero, nom });
    });
    // Trier par numéro croissant
    result.sort((a, b) => a.numero - b.numero);
    return result;
  };

  // MAJ liste APS quand module, classe ou niveau changent
  useEffect(() => {
    const available = getAvailableAps();
    if (available && available.length > 0) {
      setAps(available[0].aps);
    } else {
      setAps('');
    }
  }, [module, classeId, niveauSelect]);

  const handleCreate = () => {
    // Ne rien faire si aucun ciblage n'est défini
    if (!classeId && !niveauSelect) return;
    if (classeId) {
      createCycle({ classeId, aps, module, semestre, nbSeances, startDate });
    } else if (niveauSelect) {
      createCycle({ niveau: niveauSelect as any, aps, module, semestre, nbSeances, startDate });
    }
  };

  // Lorsque la classe ou le niveau change, s'assurer que le module sélectionné
  // est bien disponible. Si ce n'est pas le cas, sélectionner le premier module disponible.
  useEffect(() => {
    const modulesDisponibles = getAvailableModules();
    if (modulesDisponibles && modulesDisponibles.length > 0) {
      const numeroExist = modulesDisponibles.some(m => m.numero === module);
      if (!numeroExist) {
        setModule(modulesDisponibles[0].numero as any);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classeId, niveauSelect]);

  // ---------- RENDER ----------
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-neutral-900">Cycles</h1>

      {/* ----- Formulaire création ----- */}
      <div className="bg-white border border-neutral-100 p-6 rounded-lg shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-800">Créer un cycle</h2>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Sélection d'une classe spécifique */}
          <select
            value={classeId}
            onChange={e => {
              setClasseId(e.target.value);
              // Si une classe est sélectionnée, réinitialiser le niveau pour éviter les doubles cibles
              if (e.target.value) setNiveauSelect('');
            }}
            className="px-3 py-2 border border-neutral-300 rounded-md"
          >
            <option value="">Classe…</option>
            {state.classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>

          {/* Sélection d'un niveau (pour toutes les classes de ce niveau) */}
          <select
            value={niveauSelect}
            onChange={e => {
              setNiveauSelect(e.target.value);
              // Si un niveau est sélectionné, réinitialiser l'identifiant de classe pour cibler toutes les classes du niveau
              if (e.target.value) setClasseId('');
            }}
            className="px-3 py-2 border border-neutral-300 rounded-md"
          >
            <option value="">Niveau…</option>
            {(['TC', "1ère Bac", "2ème Bac"] as const).map(niv => (
              <option key={niv} value={niv}>
                {niv}
              </option>
            ))}
          </select>

          <select
            value={aps}
            onChange={e => setAps(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-md"
          >
            {getAvailableAps().map((a: any) => (
              <option key={a.aps} value={a.aps}>
                {a.aps}
              </option>
            ))}
          </select>

          <select
            value={module}
            onChange={e => setModule(Number(e.target.value) as any)}
            className="px-3 py-2 border border-neutral-300 rounded-md"
          >
            {getAvailableModules().map(m => (
              <option key={m.numero} value={m.numero}>
                {/* Afficher à la fois le numéro et le nom pour aider au choix */}
                Module {m.numero} — {m.nom}
              </option>
            ))}
          </select>

          <select
            value={semestre}
            onChange={e => setSemestre(Number(e.target.value) as any)}
            className="px-3 py-2 border border-neutral-300 rounded-md"
          >
            <option value={1}>Semestre 1</option>
            <option value={2}>Semestre 2</option>
          </select>

          <input
            type="number"
            value={nbSeances}
            onChange={e => setNbSeances(Number(e.target.value))}
            min={1}
            max={20}
            className="px-3 py-2 border border-neutral-300 rounded-md"
            placeholder="Nb séances"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-md"
          />
          <button
            onClick={handleCreate}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Créer le cycle
          </button>
        </div>
      </div>

      {/* ----- Liste des cycles ----- */}
      <div className="overflow-x-auto bg-white border border-neutral-100 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-neutral-100 text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-2 text-left">Classe</th>
              <th className="px-4 py-2 text-left">APS</th>
              <th className="px-4 py-2 text-center">Module</th>
              <th className="px-4 py-2 text-center">Semestre</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {state.cycles.map(cy => (
              <tr key={cy.id}>
                <td className="px-4 py-2">{cy.classeNom}</td>
                <td className="px-4 py-2">{cy.aps}</td>
                <td className="px-4 py-2 text-center">{cy.module}</td>
                <td className="px-4 py-2 text-center">{cy.semestre}</td>
                <td className="px-4 py-2 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => navigate(`/cycles/${cy.id}`)}
                      className="bg-primary-50 text-primary-700 px-3 py-1 rounded text-sm hover:bg-primary-100"
                    >
                      Ouvrir
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Supprimer définitivement ce cycle ?')) {
                          deleteCycle(cy.id);
                        }
                      }}
                      className="text-error-600 hover:text-error-800 p-1"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {state.cycles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  Aucun cycle créé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CyclesPage;
