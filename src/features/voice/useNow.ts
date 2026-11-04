import { useSyncExternalStore } from "react";

const TICK_MS = 1000;

let now = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

export function subscribeToNow(listener: () => void): () => void {
  listeners.add(listener);
  if (timer === null) {
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((notify) => notify());
    }, TICK_MS);
  }
  now = Date.now();
  listener();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function getNow(): number {
  return now;
}

/** La hora actual en ms, al dia cada segundo. */
export function useNow(): number {
  return useSyncExternalStore(subscribeToNow, getNow);
}
