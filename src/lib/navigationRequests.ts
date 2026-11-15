import type { BillingSection } from "@discordia/client-shared";

type Listener<T> = (value: T) => void;

export interface NavigationRequest<T> {
  request: (value: T) => void;
  /** Devuelve el pedido sin atender (si cumple `matches`) y lo descarta. */
  take: (matches?: (value: T) => boolean) => T | null;
  subscribe: (listener: Listener<T>) => () => void;
}

/**
 * Pedido para abrir una pantalla que vive en otro lado del árbol. Queda
 * guardado hasta que alguien lo toma, porque quien lo atiende puede montarse
 * recién después (por ejemplo, al cambiar de servidor).
 */
export function createNavigationRequest<T>(): NavigationRequest<T> {
  let pending: T | null = null;
  const listeners = new Set<Listener<T>>();

  return {
    request(value) {
      pending = value;
      listeners.forEach((listener) => listener(value));
    },
    take(matches = () => true) {
      if (pending === null || !matches(pending)) return null;
      const value = pending;
      pending = null;
      return value;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** "Ir a comprar puntos" desde Boosts: abre la configuración de la cuenta en esa solapa. */
export const accountSettingsRequest = createNavigationRequest<BillingSection>();

/** "Gestionar" desde Facturación: abre la sección Boosts de ese servidor. */
export const serverBoostsRequest = createNavigationRequest<string>();
