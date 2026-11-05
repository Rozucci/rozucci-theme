import { site } from '../site.config';

const formatter = new Intl.NumberFormat(site.store.priceLocale, {
  style: 'currency',
  currency: site.store.currency,
  maximumFractionDigits: 0,
});

/** Prices are codes: always Latin digits, in both locales. */
export function formatPrice(value: number): string {
  return formatter.format(value);
}
