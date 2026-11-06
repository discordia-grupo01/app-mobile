import Constants from "expo-constants";
import * as Device from "expo-device";
import {
  AndroidImportance,
  AndroidNotificationVisibility,
  deleteNotificationChannelAsync,
  getExpoPushTokenAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  type NotificationPermissionsStatus,
} from "expo-notifications";
import { Platform } from "react-native";

export type PushPermission = "granted" | "askable" | "denied";

// Los canales de Android no cambian de sonido una vez creados: el viejo
// "default" (sonido del sistema) se reemplaza por "messages".
const LEGACY_CHANNEL_ID = "default";
const MESSAGES_CHANNEL_ID = "messages";
const MESSAGE_SOUND = "nuevo_mensaje.wav";
const INCOMING_CALL_CHANNEL_ID = "private_calls";
const INCOMING_CALL_SOUND = "llamada_entrante.wav";

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
  await deleteNotificationChannelAsync(LEGACY_CHANNEL_ID);
  await setNotificationChannelAsync(MESSAGES_CHANNEL_ID, {
    name: "Mensajes",
    importance: AndroidImportance.HIGH,
    sound: MESSAGE_SOUND,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: AndroidNotificationVisibility.PRIVATE,
  });
  await setNotificationChannelAsync(INCOMING_CALL_CHANNEL_ID, {
    name: "Llamadas entrantes",
    importance: AndroidImportance.MAX,
    sound: INCOMING_CALL_SOUND,
    vibrationPattern: [0, 800, 400, 800, 400, 800],
    lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
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
