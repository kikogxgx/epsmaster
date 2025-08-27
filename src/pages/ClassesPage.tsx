import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useEpsData } from '../hooks/useEpsData';
import type { Horaire, Classe } from '../types';
import { Users, BookOpen, Trash2 } from 'lucide-react';
import { Edit2 } from 'lucide-react';

const ClassesPage: React.FC = () => {
  const { state, addClass, updateClass, deleteClass } = useEpsData();
  const navigate = useNavigate();

  // --- Formulaire ---
  const [nom, setNom] = useState('');
  const [niveau, setNiveau] = useState<'TC' | '1ère Bac' | '2ème Bac'>('TC');
  const [horaires, setHoraires] = useState<Horaire[]>([
    { weekday: 1, start: '08:00', durationMin: 60, lieu: '' }
  ]);

  const jours = [
    { value: 0, label: 'Dimanche' },
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' }
  ];

  const updateHoraire = (idx: number, field: keyof Horaire, value: any) => {
    const nh = [...horaires];
    nh[idx] = { ...nh[idx], [field]: value };
    setHoraires(nh);
  };

  const addHoraire = () =>
    horaires.length < 7 &&
    setHoraires([...horaires, { weekday: 1, start: '08:00', durationMin: 60, lieu: '' }]);

  const removeHoraire = (idx: number) =>
    horaires.length > 1 && setHoraires(horaires.filter((_, i) => i !== idx));

  const handleAddClass = () => {
    if (!nom.trim()) return;

    // Vérifie doublon de weekday
    const wd = horaires.map(h => h.weekday);
    if (wd.length !== [...new Set(wd)].length) {
      alert('Erreur : deux horaires ont le même jour.');
      return;
    }

    const newClass: Classe = {
      id: `class-${Date.now()}`,
      nom: nom.trim(),
      niveau,
      horaires: horaires.map(h => ({ ...h, lieu: h.lieu?.trim() || undefined }))
    };

    addClass(newClass);
    // Reset formulaire
    setNom('');
    setHoraires([{ weekday: 1, start: '08:00', durationMin: 60, lieu: '' }]);
  };

  // ------- Édition de classe -------
  const [editingClass, setEditingClass] = useState<Classe | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editNiveau, setEditNiveau] = useState<'TC' | '1ère Bac' | '2ème Bac'>('TC');
  const [editHoraires, setEditHoraires] = useState<Horaire[]>([]);

  // Ouvrir le formulaire d'édition pour une classe donnée
  const openEditModal = (classe: Classe) => {
    setEditingClass(classe);
    setEditNom(classe.nom);
    setEditNiveau(classe.niveau);
    setEditHoraires(classe.horaires.map(h => ({ ...h })));
  };

  // Mettre à jour un champ horaire dans le formulaire d'édition
  const updateEditHoraire = (idx: number, field: keyof Horaire, value: any) => {
    const nh = [...editHoraires];
    nh[idx] = { ...nh[idx], [field]: value };
    setEditHoraires(nh);
  };

  const addEditHoraire = () =>
    editHoraires.length < 7 &&
    setEditHoraires([...editHoraires, { weekday: 1, start: '08:00', durationMin: 60, lieu: '' }]);

  const removeEditHoraire = (idx: number) =>
    editHoraires.length > 1 && setEditHoraires(editHoraires.filter((_, i) => i !== idx));

  // Sauvegarder les modifications de classe
  const handleSaveEdit = () => {
    if (!editingClass) return;
    if (!editNom.trim()) return;
    // Vérifie doublon de weekday
    const wd = editHoraires.map(h => h.weekday);
    if (wd.length !== [...new Set(wd)].length) {
      alert('Erreur : deux horaires ont le même jour.');
      return;
    }
    // Mettre à jour la classe
    const updated = {
      nom: editNom.trim(),
      niveau: editNiveau,
      horaires: editHoraires.map(h => ({ ...h, lieu: h.lieu?.trim() || undefined }))
    };
    updateClass(editingClass.id, updated);
    setEditingClass(null);
  };

  const formatHoraires = (hs: Horaire[]) =>
    hs
      .map(h => {
        const jour = jours.find(j => j.value === h.weekday)?.label ?? '';
        const fin = new Date(`2000-01-01T${h.start}:00`);
        fin.setMinutes(fin.getMinutes() + h.durationMin);
        const finStr = fin.toTimeString().substring(0, 5);
        return `${jour} ${h.start}-${finStr}${h.lieu ? ` (${h.lieu})` : ''}`;
      })
      .join(' • ');

  // ---------- RENDER ----------
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-neutral-900">Classes</h1>

      {/* ---------- Formulaire de création ---------- */}
      <div className="bg-white border border-neutral-100 p-6 rounded-lg shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-neutral-800">Créer une nouvelle classe</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Nom de la classe</label>
            <input
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:ring-2"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Niveau</label>
            <select
              value={niveau}
              onChange={e => setNiveau(e.target.value as any)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:ring-2"
            >
              <option value="TC">Tronc Commun</option>
              <option value="1ère Bac">1ère Baccalauréat</option>
              <option value="2ème Bac">2ème Baccalauréat</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-neutral-700">Horaires hebdomadaires</h3>
            <button
              onClick={addHoraire}
              disabled={horaires.length === 7}
              className="bg-success-600 text-white px-3 py-1 rounded text-sm hover:bg-success-700 disabled:bg-neutral-400"
            >
              + Ajouter horaire
            </button>
          </div>

          {horaires.map((h, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <select
                value={h.weekday}
                onChange={e => updateHoraire(idx, 'weekday', Number(e.target.value))}
                className="px-2 py-1 border border-neutral-300 rounded text-sm"
              >
                {jours.map(j => (
                  <option key={j.value} value={j.value}>
                    {j.label}
                  </option>
                ))}
              </select>

              <input
                type="time"
                value={h.start}
                onChange={e => updateHoraire(idx, 'start', e.target.value)}
                className="px-2 py-1 border border-neutral-300 rounded text-sm"
              />

              <input
                type="number"
                value={h.durationMin}
                onChange={e => updateHoraire(idx, 'durationMin', Number(e.target.value))}
                className="px-2 py-1 border border-neutral-300 rounded text-sm"
                min={15}
                max={180}
              />

              <input
                type="text"
                value={h.lieu}
                onChange={e => updateHoraire(idx, 'lieu', e.target.value)}
                placeholder="Lieu"
                className="px-2 py-1 border border-neutral-300 rounded text-sm"
              />

              {horaires.length > 1 && (
                <button
                  onClick={() => removeHoraire(idx)}
                  className="text-error-600 hover:text-error-800 p-1"
                  title="Supprimer cet horaire"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleAddClass}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Créer la classe
        </button>
      </div>

      {/* ---------- Liste des classes ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.classes.length === 0 ? (
          <div className="col-span-full text-neutral-600">
            Aucune classe créée. Utilisez le formulaire ci-dessus.
          </div>
        ) : (
          state.classes.map(c => {
            const elevesCount = state.eleves.filter(e => e.classeId === c.id).length;
            const cyclesCount = state.cycles.filter(cy => cy.classeId === c.id).length;

            return (
              <div
                key={c.id}
                className="bg-white border border-neutral-100 shadow-sm rounded-lg p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {c.nom.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 text-lg">{c.nom}</h3>
                      <p className="text-neutral-600 text-sm">{c.niveau}</p>
                    </div>
                  </div>

                  <p className="text-sm text-neutral-500 mb-3">{formatHoraires(c.horaires)}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-neutral-400" />
                      <span>{elevesCount} élève{elevesCount > 1 && 's'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-neutral-400" />
                      <span>{cyclesCount} cycle{cyclesCount > 1 && 's'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <NavLink
                    to={`/classes/${c.id}`}
                    className="flex-1 text-center bg-primary-50 text-primary-700 px-3 py-1 rounded text-sm hover:bg-primary-100"
                  >
                    Élèves
                  </NavLink>

                  {/* Bouton de modification de classe */}
                  <button
                    onClick={() => openEditModal(c)}
                    className="text-primary-600 hover:text-primary-800 p-1"
                    title="Modifier"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(`Supprimer la classe "${c.nom}" et tous ses élèves ?`)
                      ) {
                        deleteClass(c.id);
                      }
                    }}
                    className="text-error-600 hover:text-error-800 p-1"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal d'édition de classe */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl space-y-6">
            <h2 className="text-xl font-semibold text-neutral-800">Modifier la classe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Nom de la classe</label>
                <input
                  type="text"
                  value={editNom}
                  onChange={e => setEditNom(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:ring-2"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Niveau</label>
                <select
                  value={editNiveau}
                  onChange={e => setEditNiveau(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:ring-2"
                >
                  <option value="TC">Tronc Commun</option>
                  <option value="1ère Bac">1ère Baccalauréat</option>
                  <option value="2ème Bac">2ème Baccalauréat</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-neutral-700">Horaires hebdomadaires</h3>
                <button
                  onClick={addEditHoraire}
                  disabled={editHoraires.length === 7}
                  className="bg-success-600 text-white px-3 py-1 rounded text-sm hover:bg-success-700 disabled:bg-neutral-400"
                >
                  + Ajouter horaire
                </button>
              </div>
              {editHoraires.map((h, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                  <select
                    value={h.weekday}
                    onChange={e => updateEditHoraire(idx, 'weekday', Number(e.target.value))}
                    className="px-2 py-1 border border-neutral-300 rounded text-sm"
                  >
                    {jours.map(j => (
                      <option key={j.value} value={j.value}>{j.label}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={h.start}
                    onChange={e => updateEditHoraire(idx, 'start', e.target.value)}
                    className="px-2 py-1 border border-neutral-300 rounded text-sm"
                  />
                    <input
                      type="number"
                      value={h.durationMin}
                      onChange={e => updateEditHoraire(idx, 'durationMin', Number(e.target.value))}
                      className="px-2 py-1 border border-neutral-300 rounded text-sm"
                      min={15}
                      max={180}
                    />
                  <input
                    type="text"
                    value={h.lieu || ''}
                    onChange={e => updateEditHoraire(idx, 'lieu', e.target.value)}
                    placeholder="Lieu"
                    className="px-2 py-1 border border-neutral-300 rounded text-sm"
                  />
                  {editHoraires.length > 1 && (
                    <button
                      onClick={() => removeEditHoraire(idx)}
                      className="text-error-600 hover:text-error-800 p-1"
                      title="Supprimer cet horaire"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingClass(null)}
                className="px-4 py-2 rounded-md bg-neutral-300 text-neutral-700 text-sm hover:bg-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
