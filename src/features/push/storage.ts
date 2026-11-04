import AsyncStorage from "@react-native-async-storage/async-storage";

const deviceKey = (userId: string) => `discordia_push_device_${userId}`;
const wantedKey = (userId: string) => `discordia_push_wanted_${userId}`;

async function read(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function write(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    return;
  }
}

async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    return;
  }
}

export function readPushDeviceId(userId: string): Promise<string | null> {
  return read(deviceKey(userId));
}

export function writePushDeviceId(
  userId: string,
  deviceId: string,
): Promise<void> {
  return write(deviceKey(userId), deviceId);
}

export function clearPushDeviceId(userId: string): Promise<void> {
  return remove(deviceKey(userId));
}

export async function isPushWanted(userId: string): Promise<boolean> {
  return (await read(wantedKey(userId))) === "1";
}

export function markPushWanted(userId: string, wanted: boolean): Promise<void> {
  return wanted ? write(wantedKey(userId), "1") : remove(wantedKey(userId));
}
