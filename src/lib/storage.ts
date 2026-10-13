import {
  DEFAULT_THEME,
  THEME_NAMES,
  type ThemeName,
} from "@discordia/client-shared";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "discordia_auth_token";
const USER_KEY = "discordia_auth_user";
const THEME_KEY = "discordia_theme_preference";
const PIN_ENABLED_KEY = "discordia_pin_enabled";
const LAST_LOCATION_KEY = "discordia_last_location";

const secureStorage = {
  getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return Promise.resolve(
        typeof localStorage === "undefined" ? null : localStorage.getItem(key),
      );
    }
    return SecureStore.getItemAsync(key);
  },
  setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export async function getToken(): Promise<string | null> {
  return secureStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser<T>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setSession(token: string, user: unknown): Promise<void> {
  await secureStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function updateToken(token: string): Promise<void> {
  await secureStorage.setItem(TOKEN_KEY, token);
}

export async function updateStoredUser(user: unknown): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearSession(): Promise<void> {
  await secureStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

export async function getThemePreference(): Promise<ThemeName> {
  const raw = await AsyncStorage.getItem(THEME_KEY);
  return THEME_NAMES.find((name) => name === raw) ?? DEFAULT_THEME;
}

export async function setThemePreference(preference: ThemeName): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, preference);
}

export async function getPinEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(PIN_ENABLED_KEY);
  return raw === "true";
}

export async function setPinEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(PIN_ENABLED_KEY, enabled ? "true" : "false");
}

const PIN_OWNER_KEY = "discordia_pin_owner";

export interface PinOwner {
  name: string | null;
  email: string | null;
}

export async function getPinOwner(): Promise<PinOwner | null> {
  const raw = await AsyncStorage.getItem(PIN_OWNER_KEY);
  return raw ? (JSON.parse(raw) as PinOwner) : null;
}

export async function setPinOwner(owner: PinOwner | null): Promise<void> {
  if (owner) {
    await AsyncStorage.setItem(PIN_OWNER_KEY, JSON.stringify(owner));
  } else {
    await AsyncStorage.removeItem(PIN_OWNER_KEY);
  }
}

/** Donde estaba parado el usuario, para volver ahi al reabrir la app. */
export interface LastLocation {
  userId: string;
  view: "servers" | "dm";
  serverId: string | null;
  channelId: string | null;
  partnerId: string | null;
}

export async function getLastLocation(
  userId: string,
): Promise<LastLocation | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_LOCATION_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<LastLocation> | null;
    if (!stored || stored.userId !== userId) return null;
    return {
      userId,
      view: stored.view === "servers" ? "servers" : "dm",
      serverId: stored.serverId ?? null,
      channelId: stored.channelId ?? null,
      partnerId: stored.partnerId ?? null,
    };
  } catch {
    return null;
  }
}

export async function setLastLocation(location: LastLocation): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
  } catch {
    // Sin storage simplemente no se recuerda.
  }
}
