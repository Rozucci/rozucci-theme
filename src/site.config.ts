/**
 * Single site configuration.
 *
 * Everything that changes per site lives here: identity, locales, navigation,
 * social links, default theme and motion feature flags. Components and pages
 * read from this file — never hardcode these values elsewhere.
 */

export type LocaleCode = 'fa' | 'en';

export interface LocaleDef {
  code: LocaleCode;
  /** BCP 47 tag used for <html lang> and Intl formatting. */
  lang: string;
  dir: 'rtl' | 'ltr';
  /** Name of the language written in itself (shown in the switcher). */
  label: string;
  /** Short code shown in compact UI. */
  short: string;
  /** Open Graph locale. */
  og: string;
}

export interface NavItem {
  /** Route without locale prefix, with trailing slash. */
  href: string;
  /** Key in the i18n dictionary under `nav`. */
  key: 'work' | 'orbit' | 'about' | 'contact';
}

export interface SocialLink {
  label: string;
  href: string;
}

export type ThemeName = 'ivory' | 'bone';
export type ColorMode = 'auto' | 'light' | 'dark';

export const site = {
  name: 'Rozucci',
  /** Canonical origin, used for absolute URLs, sitemap and hreflang. */
  url: 'https://rozucci.ir',
  author: 'Shayan',
  email: 'hello@rozucci.ir',

  locales: [
    { code: 'fa', lang: 'fa-IR', dir: 'rtl', label: 'فارسی', short: 'فا', og: 'fa_IR' },
    { code: 'en', lang: 'en', dir: 'ltr', label: 'English', short: 'EN', og: 'en_US' },
  ] satisfies LocaleDef[],

  /** Served at `/`. Other locales are served under `/<code>/`. */
  defaultLocale: 'fa' as LocaleCode,

  nav: [
    { href: '/work/', key: 'work' },
    { href: '/orbit/', key: 'orbit' },
    { href: '/about/', key: 'about' },
    { href: '/contact/', key: 'contact' },
  ] satisfies NavItem[],

  socials: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'YouTube', href: 'https://youtube.com/' },
    { label: 'LinkedIn', href: 'https://linkedin.com/' },
    { label: 'Pinterest', href: 'https://pinterest.com/' },
  ] satisfies SocialLink[],

  /** Themes that exist in src/styles/themes/. The first is not special. */
  themes: ['ivory', 'bone'] satisfies ThemeName[],
  defaultTheme: 'ivory' as ThemeName,
  /** `auto` follows the operating system (prefers-color-scheme). */
  defaultMode: 'auto' as ColorMode,

  /**
   * Motion feature flags. Turn any feature off here and it is removed
   * site-wide. `prefers-reduced-motion: reduce` always disables smoothScroll,
   * reveals, parallax and cursorLabel regardless of these flags.
   */
  motion: {
    /** Lenis smooth wheel scrolling (touch always keeps native scroll). */
    smoothScroll: true,
    /** Scroll-triggered reveals: hairline draws, line-by-line headlines, media wipes. */
    reveals: true,
    /** Gentle parallax on media. */
    parallax: true,
    /** Astro view transitions between pages (crossfade + line wipe). */
    pageTransitions: true,
    /** Desktop-only `[ VIEW ]` label following the cursor over project cards. */
    cursorLabel: true,
    /** Flip animation when filtering the work index. */
    flipFilter: true,
  },
} as const;

export type SiteConfig = typeof site;
