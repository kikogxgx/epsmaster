import * as XLSX from 'xlsx';
import type { Classe, Eleve, Cycle } from '../types';

/**
 * Exporte les données d'une classe au format Excel. Le classeur comporte
 * actuellement un onglet "Élèves" contenant la liste des élèves et leurs
 * numéros. D'autres onglets (présences, évaluations, synthèse) peuvent être
 * ajoutés ultérieurement selon les besoins.
 */
export function exportClasseExcel(classe: Classe, eleves: Eleve[], cycles: Cycle[]) {
  const wb = XLSX.utils.book_new();
  // Onglet Élèves
  const elevesData = [['Nom', 'Numéro']].concat(
    eleves
      .filter((e) => e.classeId === classe.id)
      .map((e) => [e.nom, e.numero ?? ''])
  );
  const wsEleves = XLSX.utils.aoa_to_sheet(elevesData);
  XLSX.utils.book_append_sheet(wb, wsEleves, 'Élèves');
  // Écriture du fichier et déclenchement du téléchargement
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `classe_${classe.nom}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}