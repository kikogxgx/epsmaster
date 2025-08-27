import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Cycle } from '../types';

/**
 * Génère un PDF récapitulatif d’un cycle puis lance le téléchargement.
 * Dépendances :  npm i jspdf jspdf-autotable
 */
export function exportPdfCycle(cycle: Cycle) {
  const doc = new jsPDF();

  /* ----- Titre ---------------------------------------------------- */
  doc.setFontSize(14);
  doc.text(
    `Cycle ${cycle.module} – Semestre ${cycle.semestre} – ${cycle.classeNom}`,
    14,
    20
  );

  /* ----- Tableau des séances ------------------------------------- */
  autoTable(doc, {
    startY: 30,
    head: [['N°', 'Date', 'Heure', 'Thème']],
    body: cycle.seances.map(s => [
      s.numero,
      s.date,
      s.heure ?? '',
      s.theme
    ]),
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [65, 105, 225] } // bleu
  });

  /* ----- Téléchargement ------------------------------------------ */
  doc.save(
    `Cycle-${cycle.module}-${cycle.semestre}-${cycle.classeNom}.pdf`
  );
}
