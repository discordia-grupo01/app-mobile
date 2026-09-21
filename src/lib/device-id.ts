import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "discordia_device_id";

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await readDeviceId();
  if (existing) return existing;

  const generated = generateId();
  await writeDeviceId(generated);
  return generated;
}

function readDeviceId(): Promise<string | null> {
  if (Platform.OS === "web") {
    return Promise.resolve(
      typeof localStorage === "undefined"
        ? null
        : localStorage.getItem(DEVICE_ID_KEY),
    );
  }
  return SecureStore.getItemAsync(DEVICE_ID_KEY);
}

function writeDeviceId(value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DEVICE_ID_KEY, value);
    }
    return Promise.resolve();
  }
  return SecureStore.setItemAsync(DEVICE_ID_KEY, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

function generateId(): string {
  const random = () => Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}-${random()}-${random()}`;
}
