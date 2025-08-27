import type { Horaire } from '../types';

export interface CreneauInput {
  jour: string;
  heure: string; // format 'HH:MM-SS'
}

export interface GenerateInput {
  classe: string;
  module: string;
  semestre: string;
  periode: string; // "YYYY-MM-DD -> YYYY-MM-DD"
  creneaux: CreneauInput[];
  themes: string[];
}

export interface SeanceJson {
  n: number;
  date: string; // DD/MM/YYYY
  heure: string; // HH:MM
  theme: string;
  statut: string;
}

/**
 * Convert French day names to JavaScript weekday numbers (0=Sunday, 1=Monday,...).
 */
const dayNameToNumber: Record<string, number> = {
  'dimanche': 0,
  'lundi': 1,
  'mardi': 2,
  'mercredi': 3,
  'jeudi': 4,
  'vendredi': 5,
  'samedi': 6
};

/**
 * Parse a date string in 'YYYY-MM-DD' format to a Date (local timezone).
 */
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Format a Date object to 'DD/MM/YYYY'.
 */
function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Generate a timetable JSON based on the provided input.
 *
 * - It generates all sessions that fall on the specified days within the period.
 * - It assigns themes sequentially to weeks: for each week, the first session
 *   uses the base theme and the second session (if present) uses the same theme
 *   suffixed with " (atelier / mise en application)".
 * - Sessions are sorted by date and numbered starting at 1.
 */
export function generateTimetableJson(input: GenerateInput): { seances: SeanceJson[] } {
  const [startStr, endStr] = input.periode.split('->').map(s => s.trim());
  const startDate = parseDate(startStr);
  const endDate = parseDate(endStr);

  // Map creneaux to weekday number and start time (first part of heure string)
  const creneauDays: { weekday: number; time: string }[] = input.creneaux.map((c) => {
    const weekday = dayNameToNumber[c.jour.toLowerCase()];
    // Extract start time (HH:MM) from 'HH:MM-HH:MM'
    const timeMatch = c.heure.split('-')[0].trim();
    return { weekday, time: timeMatch };
  });

  // Generate list of all session dates within the period for the specified weekdays
  const sessionDates: { date: Date; time: string }[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Find if this date's weekday matches any of the creneaux
    const weekday = d.getDay();
    creneauDays.forEach(({ weekday: cW, time }) => {
      if (weekday === cW) {
        sessionDates.push({ date: new Date(d), time });
      }
    });
  }

  // Sort session dates by actual date and then by time (optional but consistent)
  sessionDates.sort((a, b) => {
    const diff = a.date.getTime() - b.date.getTime();
    if (diff !== 0) return diff;
    return a.time.localeCompare(b.time);
  });

  // Assign themes to each session
  const seances: SeanceJson[] = [];
  for (let i = 0; i < sessionDates.length; i++) {
    const { date, time } = sessionDates[i];
    // Determine theme index by floor(i / number of sessions per theme). We have 2 sessions per theme (week)
    const themeIndex = Math.floor(i / input.creneaux.length);
    const baseTheme = input.themes[themeIndex % input.themes.length] || '';
    // Determine if this is the second session of the week (i % creneaux.length == 1)
    const suffixIndex = i % input.creneaux.length;
    let theme = baseTheme;
    if (suffixIndex === 1) {
      // Append atelier/mise en application
      theme += ' (atelier / mise en application)';
    }
    // Format time as HH:MM (take first 5 chars)
    const heure = time.slice(0, 5);
    seances.push({
      n: i + 1,
      date: formatDate(date),
      heure,
      theme,
      statut: 'Planifiée'
    });
  }
  return { seances };
}