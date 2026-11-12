import {
  PROFILE_FALLBACK_CONCURRENCY,
  type VoiceParticipantProfile,
} from "@discordia/client-shared";

import { avatarUriOf } from "../../lib/userProfile";
import { getPublicProfile } from "../profile/service";

const cache = new Map<string, Promise<VoiceParticipantProfile | null>>();

let running = 0;
const waiting: (() => void)[] = [];

/** El back no tiene endpoint batch: de a `PROFILE_FALLBACK_CONCURRENCY`. */
async function withSlot<T>(task: () => Promise<T>): Promise<T> {
  if (running >= PROFILE_FALLBACK_CONCURRENCY) {
    await new Promise<void>((resolve) => waiting.push(resolve));
  }
  running++;
  try {
    return await task();
  } finally {
    running--;
    waiting.shift()?.();
  }
}

async function fetchVoiceProfile(
  userId: string,
): Promise<VoiceParticipantProfile | null> {
  const result = await withSlot(() => getPublicProfile(userId));
  if (!result.ok) {
    cache.delete(userId);
    return null;
  }
  const { name, avatar_url } = result.user;
  return {
    identity: userId,
    name,
    avatarUrl: avatarUriOf({ name, avatar_url }),
  };
}

export function forgetVoiceProfile(userId: string): void {
  cache.delete(userId);
}

export function loadVoiceProfile(
  userId: string,
): Promise<VoiceParticipantProfile | null> {
  const cached = cache.get(userId);
  if (cached) return cached;
  const pending = fetchVoiceProfile(userId).catch(() => {
    cache.delete(userId);
    return null;
  });
  cache.set(userId, pending);
  return pending;
}
