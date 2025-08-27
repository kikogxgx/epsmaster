import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Trash2,
  Camera,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { useEpsData } from '../hooks/useEpsData';
import type { Eleve } from '../types';

const StudentsPage: React.FC = () => {
  // -------- contexte et données --------
  const { id } = useParams();           // id de la classe
  const navigate = useNavigate();
  const { state, addEleve, deleteEleve, updateEleve } = useEpsData();

  const classe = state.classes.find(c => c.id === id);
  if (!classe) {
    // classe supprimée ou URL invalide → retour
    navigate('/classes');
    return null;
  }

  const eleves = state.eleves.filter(e => e.classeId === classe.id);

  // -------- formulaire ajout élève --------
  const [nom, setNom] = useState('');
  const [numero, setNumero] = useState<number | ''>('');

  const nextNumero =
    Math.max(0, ...eleves.map(e => e.numero ?? 0)) + 1;

  const add = () => {
    const n = nom.trim();
    if (!n) return;

    const num = numero === '' ? nextNumero : Number(numero);

    const el: Eleve = {
      id: `eleve-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      classeId: classe.id,
      nom: n,
      numero: num,
      niveau: classe.niveau,
      photoBase64: undefined
    };

    addEleve(el);
    setNom('');
    setNumero('');
  };

  // -------- helpers photo --------
  const toBase64 = (f: File) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  const setPhoto = async (
    e: React.ChangeEvent<HTMLInputElement>,
    eleveId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    updateEleve(eleveId, { photoBase64: b64 });
  };

  const removePhoto = (id: string) =>
    updateEleve(id, { photoBase64: undefined });

  // -------- rendu --------
  return (
    <div className="space-y-8">
      {/* en-tête */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/classes')}
          className="text-neutral-600 hover:text-primary-600 p-1"
          title="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-neutral-900">
          Élèves – {classe.nom}
        </h1>
      </div>

      {/* formulaire */}
      <div className="bg-white border border-neutral-100 p-6 rounded-lg shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-800">
          Ajouter un élève
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={nom}
            onChange={e => setNom(e.target.value)}
            placeholder="Nom"
            className="px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:ring-2"
          />

          <input
            type="number"
            value={numero}
            onChange={e =>
              setNumero(e.target.value ? Number(e.target.value) : '')
            }
            placeholder={`Numéro (auto : ${nextNumero})`}
            min={1}
            className="px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:ring-2"
          />

          <button
            onClick={add}
            className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            <UserPlus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto bg-white border border-neutral-100 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-neutral-100 text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Nom</th>
              <th className="px-4 py-2 text-center">Photo</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {eleves.map(el => (
              <tr key={el.id}>
                <td className="px-4 py-2">{el.numero}</td>
                <td className="px-4 py-2">{el.nom}</td>

                {/* photo */}
                <td className="px-4 py-2 text-center">
                  {el.photoBase64 ? (
                    <div className="relative inline-block">
                      <img
                        src={el.photoBase64}
                        alt={el.nom}
                        className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                      />
                      <button
                        onClick={() => removePhoto(el.id)}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 text-error-600 hover:text-error-800"
                        title="Supprimer photo"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-dashed border-neutral-300 text-neutral-400 cursor-pointer hover:bg-neutral-50"
                      title="Ajouter photo"
                    >
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => setPhoto(e, el.id)}
                      />
                    </label>
                  )}
                </td>

                {/* actions */}
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Supprimer l'élève « ${el.nom} » ?`
                        )
                      )
                        deleteEleve(el.id);
                    }}
                    className="text-error-600 hover:text-error-800 p-1"
                    title="Supprimer élève"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}

            {eleves.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-neutral-500"
                >
                  Aucun élève dans cette classe.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsPage;
