import { useSyncExternalStore } from "react";
import { AppState } from "react-native";

function subscribe(onChange: () => void): () => void {
  const subscription = AppState.addEventListener("change", onChange);
  return () => subscription.remove();
}

const isActive = () =>
  AppState.currentState !== "background" &&
  AppState.currentState !== "inactive";

/** `false` mientras la app está en segundo plano o tapada (iOS: `inactive`). */
export function useAppActive(): boolean {
  return useSyncExternalStore(subscribe, isActive, isActive);
}
