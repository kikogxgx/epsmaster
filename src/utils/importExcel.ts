import * as XLSX from 'xlsx';
import type { Eleve, Niveau } from '../types';

interface ImportResult {
  success: boolean;
  data?: Eleve[];
  errors: string[];
}

export async function importElevesFromExcel(
  file: File, 
  classeId: string, 
  niveau: Niveau
): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const eleves: Eleve[] = [];
        const errors: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          const rowNum = index + 2; // +2 car ligne 1 = headers

          // Validation des champs requis
          if (!row.Nom && !row.nom) {
            errors.push(`Ligne ${rowNum}: Le nom est requis`);
            return;
          }

          const nom = (row.Nom || row.nom || '').toString().trim();
          const numero = row.Numero || row.numero || row.Numéro || row.numéro;
          
          if (nom.length === 0) {
            errors.push(`Ligne ${rowNum}: Le nom ne peut pas être vide`);
            return;
          }

          eleves.push({
            id: `eleve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            classeId,
            nom,
            numero: numero ? parseInt(numero.toString()) : undefined,
            niveau,
            photoBase64: undefined
          });
        });

        resolve({
          success: errors.length === 0,
          data: eleves,
          errors
        });

      } catch (error) {
        resolve({
          success: false,
          errors: [`Erreur lors de la lecture du fichier: ${error}`]
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        errors: ['Erreur lors de la lecture du fichier']
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

export function exportElevesTemplate() {
  const templateData = [
    ['Nom', 'Numero'],
    ['Exemple Élève 1', '1'],
    ['Exemple Élève 2', '2'],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(templateData);
  
  ws['!cols'] = [
    { wch: 20 }, // Nom
    { wch: 10 }  // Numero
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Élèves');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template_eleves.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
