/**
 * Store categories (order = filter order). Display names live in the i18n
 * dictionaries under `store.categories.<key>`.
 */
export const CATEGORIES = ['print', 'original', 'preset', 'sound', 'template'] as const;
export type Category = (typeof CATEGORIES)[number];
