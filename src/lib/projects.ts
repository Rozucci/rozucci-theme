/**
 * Project queries. All pages get projects through these helpers so locale
 * handling, ordering and drafts are consistent.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { LocaleCode } from '../site.config';
import { localizePath } from '../i18n/utils';

export type Project = CollectionEntry<'projects'>;

/** Entry id is "<locale>/<slug>". */
export function projectLocale(entry: Project): LocaleCode {
  return entry.id.split('/')[0] as LocaleCode;
}

export function projectSlug(entry: Project): string {
  return entry.id.split('/').slice(1).join('/');
}

export function projectHref(entry: Project): string {
  return localizePath(`/work/${projectSlug(entry)}/`, projectLocale(entry));
}

/** Published projects for a locale, in index order. */
export async function getProjects(locale: LocaleCode): Promise<Project[]> {
  const all = await getCollection(
    'projects',
    (p) => projectLocale(p) === locale && (import.meta.env.DEV || !p.data.draft),
  );
  return all.sort((a, b) => a.data.order - b.data.order);
}

/** Locales in which a project slug exists (for hreflang on detail pages). */
export async function localesForSlug(slug: string): Promise<LocaleCode[]> {
  const all = await getCollection('projects', (p) => projectSlug(p) === slug && !p.data.draft);
  return all.map(projectLocale);
}
