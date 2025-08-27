import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  Edit2,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { useAbsencesProfesseur } from '../hooks/useAbsencesProfesseur';
import type { AbsenceProfesseur, TypeAbsence } from '../types';

const AbsencesProfesseurPage: React.FC = () => {
  const {
    absences,
    saveAbsence,
    validerAbsence,
    refuserAbsence,
    deleteAbsence,
    getAbsencesEnCours,
    validerDates
  } = useAbsencesProfesseur();

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const BLANK: Omit<AbsenceProfesseur, 'id' | 'createdAt' | 'seancesImpactees'> = {
    dateDebut: '',
    dateFin: '',
    type: 'maladie',
    motif: '',
    justificatif: undefined,
    statut: 'en_attente'
  };

  const [form, setForm] = useState(BLANK);
  const [open, setOpen] = useState(false);

  const types = [
    { value: 'maladie', label: 'Maladie', color: 'bg-red-100 text-red-800' },
    { value: 'competition', label: 'Compétition', color: 'bg-blue-100 text-blue-800' },
    { value: 'formation', label: 'Formation', color: 'bg-green-100 text-green-800' },
    { value: 'jour_ferie', label: 'Jour férié', color: 'bg-purple-100 text-purple-800' },
    { value: 'conge', label: 'Congé', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'autre', label: 'Autre', color: 'bg-gray-100 text-gray-800' }
  ];

  const afficherMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleValider = (id: string) => {
    const result = validerAbsence(id);
    afficherMessage(result.success ? 'success' : 'error', result.message);
  };

  const handleRefuser = (id: string) => {
    const result = refuserAbsence(id);
    afficherMessage(result.success ? 'success' : 'error', result.message);
  };

  const handleSupprimer = (id: string) => {
    if (confirm('Supprimer cette absence ? La reprogrammation sera annulée si applicable.')) {
      const result = deleteAbsence(id);
      afficherMessage(result.success ? 'success' : 'error', result.message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation des dates
      if (!validerDates(form.dateDebut, form.dateFin)) {
        afficherMessage('error', '❌ La date de début doit être antérieure ou égale à la date de fin');
        return;
      }

      saveAbsence(form);
      setOpen(false);
      setForm(BLANK);
      afficherMessage('success', '✅ Absence enregistrée avec succès');
    } catch (error) {
      afficherMessage('error', error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Absences Professeur</h1>
        <button
          onClick={() => setOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Déclarer une absence
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-success-50 text-success-800 border-success-200' 
            : 'bg-error-50 text-error-800 border-error-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Alertes absences en cours */}
      {getAbsencesEnCours().length > 0 && (
        <div className="bg-warning-50 border-l-4 border-warning-600 p-4 rounded-r-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-warning-600" />
          <span className="text-warning-800">
            {getAbsencesEnCours().length} absence(s) en cours
          </span>
        </div>
      )}

      {/* Cartes des absences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {absences.map(abs => {
          const info = types.find(t => t.value === abs.type)!;
          const icon =
            abs.statut === 'approuve' ? (
              <CheckCircle className="w-4 h-4" />
            ) : abs.statut === 'refuse' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            );

          const statutLabel = 
            abs.statut === 'en_attente' ? 'En attente' :
            abs.statut === 'approuve' ? 'Approuvée' :
            'Refusée';

          return (
            <div key={abs.id} className="bg-white border border-neutral-100 shadow-sm rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
                  {info.label}
                </span>
                <div className={`flex items-center gap-1 text-sm ${
                  abs.statut === 'approuve'
                    ? 'text-success-600'
                    : abs.statut === 'refuse'
                    ? 'text-error-600'
                    : 'text-warning-600'
                }`}>
                  {icon}
                  {statutLabel}
                </div>
              </div>

              <div className="space-y-2 text-sm text-neutral-700 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(abs.dateDebut).toLocaleDateString('fr-FR')} →{' '}
                    {new Date(abs.dateFin).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {abs.motif && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{abs.motif}</span>
                  </div>
                )}
                <p className="text-neutral-500">
                  Séances reprogrammées : {abs.seancesImpactees.length}
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                {abs.statut === 'en_attente' ? (
                  <div className="flex gap-2">
                    <button
                      title="Valider"
                      onClick={() => handleValider(abs.id)}
                      className="text-success-600 hover:text-success-800 p-1"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      title="Refuser"
                      onClick={() => handleRefuser(abs.id)}
                      className="text-error-600 hover:text-error-800 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-2">
                  <button
                    title="Modifier"
                    onClick={() => {
                      setForm(abs);
                      setOpen(true);
                    }}
                    className="text-primary-600 hover:text-primary-800 p-1"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    title="Supprimer"
                    onClick={() => handleSupprimer(abs.id)}
                    className="text-error-600 hover:text-error-800 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal formulaire */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              {form.id ? 'Modifier absence' : 'Déclarer une absence'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date début
                  </label>
                  <input
                    type="date"
                    required
                    value={form.dateDebut}
                    onChange={e => setForm({ ...form, dateDebut: e.target.value })}
                    className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date fin
                  </label>
                  <input
                    type="date"
                    required
                    value={form.dateFin}
                    onChange={e => setForm({ ...form, dateFin: e.target.value })}
                    className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'absence
                </label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as TypeAbsence })}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {types.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif (optionnel)
                </label>
                <textarea
                  rows={3}
                  value={form.motif}
                  onChange={e => setForm({ ...form, motif: e.target.value })}
                  placeholder="Précisez le motif de l'absence..."
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setForm(BLANK);
                  }}
                  className="flex-1 border border-neutral-300 rounded-md px-4 py-2 hover:bg-neutral-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white rounded-md px-4 py-2 hover:bg-primary-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsencesProfesseurPage;
