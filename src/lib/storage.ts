import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "discordia_auth_token";
const USER_KEY = "discordia_auth_user";
const THEME_KEY = "discordia_theme_preference";

export type ThemePreference = "dark" | "light";

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

export async function getThemePreference(): Promise<ThemePreference> {
  const raw = await AsyncStorage.getItem(THEME_KEY);
  return raw === "light" ? "light" : "dark";
}

export async function setThemePreference(
  preference: ThemePreference,
): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, preference);
}
