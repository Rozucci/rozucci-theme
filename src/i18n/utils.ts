/**
 * i18n helpers: dictionaries, locale-aware paths and number formatting.
 *
 * Path model: a "route" is a locale-free path that starts and ends with a
 * slash (`/work/`, `/work/some-project/`, `/`). `localizePath()` adds the
 * base path and the locale prefix; `routeFromPathname()` removes them.
 */
import { site, type LocaleCode, type LocaleDef } from '../site.config';
import en, { type Dict } from './en';
import fa from './fa';

const dictionaries: Record<LocaleCode, Dict> = { en, fa };

export const locales: readonly LocaleDef[] = site.locales;
export const defaultLocale: LocaleCode = site.defaultLocale;

export function isLocale(value: unknown): value is LocaleCode {
  return typeof value === 'string' && locales.some((l) => l.code === value);
}

/** Dictionary for a locale. */
export function useTranslations(locale: LocaleCode): Dict {
  return dictionaries[locale];
}

export function getLocaleDef(locale: LocaleCode): LocaleDef {
  const def = locales.find((l) => l.code === locale);
  if (!def) throw new Error(`Unknown locale: ${locale}`);
  return def;
}

/** The other locales, for the language switcher and hreflang. */
export function otherLocales(locale: LocaleCode): LocaleDef[] {
  return locales.filter((l) => l.code !== locale);
}

/** URL segment for a locale: undefined for the default locale (served at /). */
export function localeParam(locale: LocaleCode): string | undefined {
  return locale === defaultLocale ? undefined : locale;
}

/** Resolve the `[...locale]` route param back to a locale code. */
export function localeFromParam(param: string | undefined): LocaleCode {
  if (param === undefined || param === '') return defaultLocale;
  if (isLocale(param)) return param;
  throw new Error(`Unknown locale segment: ${param}`);
}

/** getStaticPaths entries for a page that exists once per locale. */
export function localeStaticPaths() {
  return locales.map((l) => ({
    params: { locale: localeParam(l.code) },
    props: { locale: l.code },
  }));
}

function normalizeBase(): string {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

function normalizeRoute(route: string): string {
  let r = route.startsWith('/') ? route : `/${route}`;
  // Keep hashes / queries intact, ensure a trailing slash on the path part.
  const match = r.match(/^([^?#]*)(.*)$/);
  let path = match?.[1] ?? r;
  const rest = match?.[2] ?? '';
  if (!path.endsWith('/') && !/\.[a-z0-9]+$/i.test(path)) path = `${path}/`;
  r = path + rest;
  return r;
}

/** Locale-free route → full href including base path and locale prefix. */
export function localizePath(route: string, locale: LocaleCode): string {
  const base = normalizeBase();
  const prefix = localeParam(locale);
  const r = normalizeRoute(route);
  return `${base}${prefix ? `${prefix}/` : ''}${r.slice(1)}`;
}

/** Path to a non-localised asset or page inside the base (fonts, /styleguide/). */
export function withBase(path: string): string {
  const base = normalizeBase();
  return `${base}${path.replace(/^\//, '')}`;
}

/** Full pathname (with base + locale prefix) → locale-free route. */
export function routeFromPathname(pathname: string): string {
  const base = normalizeBase();
  let p = pathname.startsWith(base) ? `/${pathname.slice(base.length)}` : pathname;
  const first = p.split('/')[1];
  if (first && isLocale(first) && first !== defaultLocale) {
    p = p.slice(first.length + 1) || '/';
  }
  return normalizeRoute(p);
}

/** Same page, other language. */
export function switchLocalePath(pathname: string, target: LocaleCode): string {
  return localizePath(routeFromPathname(pathname), target);
}

/** Absolute URL for canonical / hreflang tags. */
export function absoluteUrl(href: string, siteUrl: URL | string | undefined): string {
  return new URL(href, siteUrl ?? site.url).toString();
}

/* ------------------------------------------------------------------ *
 * Numbers
 * ------------------------------------------------------------------ */

/**
 * Localised number for prose and values: Persian digits in `fa`.
 * Years should pass `{ useGrouping: false }`.
 */
export function num(
  value: number,
  locale: LocaleCode,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(getLocaleDef(locale).lang, options).format(value);
}

/** A year: localised digits, no grouping separator. */
export function year(value: number, locale: LocaleCode): string {
  return num(value, locale, { useGrouping: false });
}

/**
 * A code that always stays Latin: section indices, week codes, prices.
 * `code(3)` → '03', `code(12, 3)` → '012'.
 */
export function code(value: number | string, pad = 2): string {
  return String(value).padStart(pad, '0');
}

/** Section index sign: `(01)`. Always Latin. */
export function indexSign(n: number): string {
  return `(${code(n)})`;
}

/* ------------------------------------------------------------------ *
 * Dates
 * ------------------------------------------------------------------ */

/**
 * Format a date for the locale. `fa` uses the Persian (Solar Hijri) calendar.
 */
export function formatDate(
  date: Date,
  locale: LocaleCode,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' },
): string {
  const tag = locale === 'fa' ? 'fa-IR-u-ca-persian' : getLocaleDef(locale).lang;
  return new Intl.DateTimeFormat(tag, options).format(date);
}
