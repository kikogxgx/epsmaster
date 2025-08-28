import React, { useState, useMemo } from 'react';
import { grillesAPS, resolveAPS, APS, Critere } from '../data/grillesAPS';
import type { Niveau } from '../types';

const niveaux: Niveau[] = ['TC', '1ère Bac', '2ème Bac'];
const apsOptions = ['Athlétisme', 'Sports collectifs', 'Football', 'Basket', 'Handball', 'Volley', 'Gymnastique'];

interface GrilleAPSProps {
  aps?: string;
  niveau?: Niveau;
  eleve?: string;
  date?: string;
}

const GrilleAPS: React.FC<GrilleAPSProps> = ({ aps: apsProp = '', niveau: niveauProp = 'TC', eleve, date }) => {
  const [apsInput, setApsInput] = useState(apsProp);
  const aps: APS = useMemo(() => resolveAPS(apsInput), [apsInput]);
  const [niveau, setNiveau] = useState<Niveau>(niveauProp);
  const [notes, setNotes] = useState<Record<string, number>>({});
  const [commentaires, setCommentaires] = useState<Record<string, string>>({});
  const [dateEval, setDateEval] = useState(date || new Date().toISOString().split('T')[0]);

  const criteres = grillesAPS[aps];

  const total = criteres.reduce((sum, crit) => {
    if (crit.sousCriteres) {
      return sum + crit.sousCriteres.reduce((s, c) => s + (notes[c.id] || 0), 0);
    }
    return sum + (notes[crit.id] || 0);
  }, 0);

  const updateNote = (id: string, value: number, max: number) => {
    const v = Math.max(0, Math.min(max, value));
    setNotes(prev => ({ ...prev, [id]: v }));
  };

  const sumBareme = (crit: Critere): number => {
    if (crit.sousCriteres) {
      return crit.sousCriteres.reduce((s, c) => s + c.bareme[niveau], 0);
    }
    return crit.bareme[niveau];
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">APS</label>
          <input
            list="aps-options"
            value={apsInput}
            onChange={e => { setApsInput(e.target.value); setNotes({}); }}
            className="border rounded px-2 py-1"
          />
          <datalist id="aps-options">
            {apsOptions.map(opt => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Niveau</label>
          <select
            value={niveau}
            onChange={e => { setNiveau(e.target.value as Niveau); setNotes({}); }}
            className="border rounded px-2 py-1"
          >
            {niveaux.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Élève/Équipe</label>
          <input
            type="text"
            value={eleve || ''}
            readOnly
            className="border rounded px-2 py-1 bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={dateEval}
            onChange={e => setDateEval(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="ml-auto text-lg font-semibold">
          <span className="px-3 py-1 bg-blue-600 text-white rounded-full">{total}/20</span>
        </div>
      </div>

      {criteres.map(crit => (
        <details key={crit.id} className="border rounded">
          <summary className="cursor-pointer px-4 py-2 font-medium bg-gray-50">
            {crit.id}. {crit.titre} ({sumBareme(crit)})
          </summary>
          <div className="p-4 space-y-2">
            <div className="text-sm text-gray-600">{crit.definition}</div>
            <div className="text-sm text-gray-600">Outils : {crit.outils}</div>
            {crit.sousCriteres ? (
              crit.sousCriteres.map(sc => (
                <div key={sc.id} className="flex items-center gap-2">
                  <label className="flex-1 text-sm">
                    {sc.label} ({sc.bareme[niveau]})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={sc.bareme[niveau]}
                    value={notes[sc.id] ?? ''}
                    onChange={e => updateNote(sc.id, parseFloat(e.target.value), sc.bareme[niveau])}
                    className="w-16 border rounded px-2 py-1"
                  />
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2">
                <label className="flex-1 text-sm">
                  Barème {crit.bareme[niveau]}
                </label>
                <input
                  type="number"
                  min="0"
                  max={crit.bareme[niveau]}
                  value={notes[crit.id] ?? ''}
                  onChange={e => updateNote(crit.id, parseFloat(e.target.value), crit.bareme[niveau])}
                  className="w-16 border rounded px-2 py-1"
                />
              </div>
            )}
            <textarea
              value={commentaires[crit.id] || ''}
              onChange={e => setCommentaires(prev => ({ ...prev, [crit.id]: e.target.value }))}
              placeholder="Commentaire"
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </details>
      ))}
    </div>
  );
};

export default GrilleAPS;
