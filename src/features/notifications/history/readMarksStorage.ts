import type { NotificationReadMarks } from "@discordia/client-shared";

import AsyncStorage from "@react-native-async-storage/async-storage";

const keyFor = (userId: string) => `discordia:notification-reads:${userId}`;

export function parseReadMarks(raw: string | null): NotificationReadMarks {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(data).filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === "string" && !Number.isNaN(Date.parse(entry[1])),
      ),
    );
  } catch {
    return {};
  }
}

export async function readNotificationReadMarks(
  userId: string,
): Promise<NotificationReadMarks> {
  try {
    return parseReadMarks(await AsyncStorage.getItem(keyFor(userId)));
  } catch {
    return {};
  }
}

export async function writeNotificationReadMarks(
  userId: string,
  marks: NotificationReadMarks,
): Promise<void> {
  try {
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify(marks));
  } catch {
    return;
  }
}
