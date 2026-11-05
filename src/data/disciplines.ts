/**
 * The disciplines of the practice. Order defines the (01)…(06) index.
 * Display names and descriptions live in the i18n dictionaries under
 * `disciplines.<key>`.
 */
export const DISCIPLINES = [
  'visual-art',
  'video',
  'web',
  'creative-coding',
  'music',
  'ai',
] as const;

export type Discipline = (typeof DISCIPLINES)[number];

/** Two-digit Latin index for a discipline: 'web' → '03'. */
export function disciplineIndex(key: Discipline): string {
  return String(DISCIPLINES.indexOf(key) + 1).padStart(2, '0');
}
