// Shared state for the order label: the form, the summary and the 3D box all read it.
import type { Area } from './order';

export interface OrderState {
  serviceSlug: string;
  serviceName: string;
  leadDays: number;
  pkgId: string;
  pkgName: string;
  price: number;
  unit: string;
  minOrder: number;
  variant: string;
  qty: number;
  date: string;
  area: Area;
}

type Listener = (s: OrderState) => void;

let state: OrderState | null = null;
const listeners = new Set<Listener>();
const EVENT = 'aroma:order';

export function getOrder(): OrderState | null {
  return state;
}

export function setOrder(next: Partial<OrderState>) {
  if (!state && !isComplete(next)) return;
  state = { ...(state as OrderState), ...next };
  for (const fn of listeners) fn(state);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: state }));
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  if (state) fn(state);
  return () => listeners.delete(fn);
}

function isComplete(s: Partial<OrderState>): s is OrderState {
  return Boolean(s.serviceSlug && s.pkgId && s.unit && typeof s.price === 'number');
}
