/**
 * Browser-only cart (store demo). Lines live in localStorage ('rz-cart').
 * Checkout is not connected: swap `cart.write` for a commerce backend call
 * later (see README → "Connect a store backend").
 *
 * Wires, once per document (delegated, survives view transitions):
 *   [data-add-to-cart]        catalog quick-add (default variant, qty 1)
 *   form[data-product-form]   product page add (variant + quantity)
 *   [data-qty-step]           quantity steppers
 *   [data-cart-count]         header count
 */
import { onPageLoad, safeStorage } from './lifecycle';

const KEY = 'rz-cart';

export interface CartLine {
  product: string;
  variant: string;
  qty: number;
}

const valid = (l: unknown): l is CartLine =>
  !!l && typeof (l as CartLine).product === 'string' && typeof (l as CartLine).qty === 'number';

const clampQty = (n: number) => Math.max(1, Math.min(99, Math.round(n) || 1));

export const cart = {
  read(): CartLine[] {
    const v = safeStorage.get<unknown>(KEY, []);
    return Array.isArray(v) ? v.filter(valid) : [];
  },
  write(lines: CartLine[]): void {
    safeStorage.set(KEY, lines);
    document.dispatchEvent(new CustomEvent('rz:cart-change'));
  },
  add(line: CartLine): void {
    const lines = cart.read();
    const found = lines.find((l) => l.product === line.product && l.variant === line.variant);
    if (found) found.qty = clampQty(found.qty + line.qty);
    else lines.push({ ...line, qty: clampQty(line.qty) });
    cart.write(lines);
  },
  setQty(product: string, variant: string, qty: number): void {
    const lines = cart.read();
    const found = lines.find((l) => l.product === product && l.variant === variant);
    if (found) found.qty = clampQty(qty);
    cart.write(lines);
  },
  remove(product: string, variant: string): void {
    cart.write(cart.read().filter((l) => !(l.product === product && l.variant === variant)));
  },
  count(): number {
    return cart.read().reduce((n, l) => n + l.qty, 0);
  },
};

function renderCount() {
  const n = String(cart.count()).padStart(2, '0');
  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
    el.textContent = n;
  });
}

function flash(btn: HTMLElement | null) {
  if (!btn) return;
  const label = btn.querySelector<HTMLElement>('[data-add-label]');
  if (!label) return;
  const original = label.dataset.original ?? label.textContent ?? '';
  label.dataset.original = original;
  label.textContent = btn.dataset.labelAdded ?? original;
  btn.toggleAttribute('data-added', true);
  window.setTimeout(() => {
    label.textContent = original;
    btn.removeAttribute('data-added');
  }, 1600);
}

document.addEventListener('click', (e) => {
  const target = e.target as Element;
  const add = target.closest<HTMLElement>('[data-add-to-cart]');
  if (add && !add.closest('form')) {
    cart.add({ product: add.dataset.product ?? '', variant: add.dataset.variant ?? '', qty: 1 });
    flash(add);
    return;
  }
  const step = target.closest<HTMLElement>('[data-qty-step]');
  if (step) {
    const input = step.closest('[data-qty]')?.querySelector<HTMLInputElement>('input');
    if (!input) return;
    input.value = String(clampQty(Number(input.value) + Number(step.dataset.qtyStep)));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
});

document.addEventListener('submit', (e) => {
  const form = (e.target as Element).closest<HTMLFormElement>('form[data-product-form]');
  if (!form) return;
  e.preventDefault();
  const data = new FormData(form);
  cart.add({
    product: form.dataset.product ?? '',
    variant: String(data.get('variant') ?? ''),
    qty: clampQty(Number(data.get('qty'))),
  });
  flash(form.querySelector<HTMLElement>('[data-add-to-cart]'));
});

// Product page: show the selected variant's price.
document.addEventListener('change', (e) => {
  const input = e.target as HTMLInputElement;
  const form = input.closest<HTMLFormElement>('form[data-product-form]');
  if (!form || input.name !== 'variant') return;
  const out = document.querySelector<HTMLElement>('[data-product-price]');
  if (!out) return;
  const fmt = new Intl.NumberFormat(form.dataset.priceLocale ?? 'en-US', {
    style: 'currency',
    currency: form.dataset.currency ?? 'USD',
    maximumFractionDigits: 0,
  });
  out.textContent = fmt.format(Number(input.dataset.price));
});

document.addEventListener('rz:cart-change', renderCount);
onPageLoad(renderCount);
