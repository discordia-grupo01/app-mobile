import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "discordia_auth_token";
const USER_KEY = "discordia_auth_user";
const THEME_KEY = "discordia_theme_preference";

export type ThemePreference = "dark" | "light";

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser<T>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setSession(token: string, user: unknown): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
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
