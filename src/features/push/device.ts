import Constants from "expo-constants";
import * as Device from "expo-device";
import {
  AndroidImportance,
  AndroidNotificationVisibility,
  getExpoPushTokenAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  type NotificationPermissionsStatus,
} from "expo-notifications";
import { Platform } from "react-native";

export type PushPermission = "granted" | "askable" | "denied";

const ANDROID_CHANNEL_ID = "default";

function toPermission(response: NotificationPermissionsStatus): PushPermission {
  if (response.granted) return "granted";
  return response.canAskAgain ? "askable" : "denied";
}

export function isPushSupported(): boolean {
  return (
    Device.isDevice && (Platform.OS === "android" || Platform.OS === "ios")
  );
}

export function pushPlatform(): "android" | "ios" {
  return Platform.OS === "ios" ? "ios" : "android";
}

export async function readPushPermission(): Promise<PushPermission> {
  return toPermission(await getPermissionsAsync());
}

export async function requestPushPermission(): Promise<PushPermission> {
  return toPermission(await requestPermissionsAsync());
}

export async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Notificaciones",
    importance: AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: AndroidNotificationVisibility.PRIVATE,
  });
}

export async function readExpoPushToken(): Promise<string> {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  const token = await getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  return token.data;
}
