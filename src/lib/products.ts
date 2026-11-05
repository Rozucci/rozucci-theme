/**
 * Product queries (store demo). Mirrors src/lib/projects.ts.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { LocaleCode } from '../site.config';
import { localizePath } from '../i18n/utils';

export type Product = CollectionEntry<'products'>;

export function productLocale(entry: Product): LocaleCode {
  return entry.id.split('/')[0] as LocaleCode;
}

export function productSlug(entry: Product): string {
  return entry.id.split('/').slice(1).join('/');
}

export function productHref(entry: Product): string {
  return localizePath(`/shop/${productSlug(entry)}/`, productLocale(entry));
}

export async function getProducts(locale: LocaleCode): Promise<Product[]> {
  const all = await getCollection(
    'products',
    (p) => productLocale(p) === locale && (import.meta.env.DEV || !p.data.draft),
  );
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function localesForProduct(slug: string): Promise<LocaleCode[]> {
  const all = await getCollection('products', (p) => productSlug(p) === slug && !p.data.draft);
  return all.map(productLocale);
}

/** Lowest price across variants — "from $45". */
export function fromPrice(p: Product): number {
  const prices = p.data.variants.map((v) => v.price ?? p.data.price);
  return prices.length ? Math.min(...prices) : p.data.price;
}
