import {
  canUseCustomEmoji,
  customEmojiTooltip,
  premiumReasonForCustomEmoji,
  type ServerEmoji,
} from "@discordia/client-shared";
import { useMemo } from "react";

import {
  type EmojiCatalogServer,
  useServerEmojiCatalog,
} from "./ServerEmojisContext";

export interface ServerEmojiSection {
  serverId: string;
  serverName: string;
  iconUrl: string | null;
  emojis: {
    emoji: ServerEmoji;
    isLocked: boolean;
    tooltip: string;
  }[];
}

export interface CustomEmojiPickerData {
  sections: ServerEmojiSection[];
  byId: Record<string, ServerEmoji>;
  hasLocked: boolean;
  load: () => void;
}

export function buildCustomEmojiPickerSections({
  servers,
  byServer,
  serverId,
  isPremium,
}: {
  servers: EmojiCatalogServer[];
  byServer: Readonly<Record<string, ServerEmoji[]>>;
  serverId: string | null;
  isPremium: boolean;
}): {
  sections: ServerEmojiSection[];
  byId: Record<string, ServerEmoji>;
  hasLocked: boolean;
} {
  const ordered = [...servers].sort((a, b) =>
    a.id === serverId ? -1 : b.id === serverId ? 1 : 0,
  );

  const sections: ServerEmojiSection[] = [];
  const byId: Record<string, ServerEmoji> = {};
  let hasLocked = false;

  for (const server of ordered) {
    const serverEmojis = byServer[server.id] ?? [];
    if (serverEmojis.length === 0) continue;

    const items = serverEmojis.map((emoji) => {
      const isLocked = !canUseCustomEmoji({ emoji, serverId, isPremium });
      if (isLocked) hasLocked = true;
      const tooltip = customEmojiTooltip(emoji.name, {
        animated: premiumReasonForCustomEmoji(emoji, serverId) === "animated",
        locked: isLocked,
      });
      byId[emoji.id] = emoji;
      return { emoji, isLocked, tooltip };
    });

    sections.push({
      serverId: server.id,
      serverName: server.name,
      iconUrl: server.icon_url,
      emojis: items,
    });
  }

  return { sections, byId, hasLocked };
}

export function useCustomEmojiPicker(
  serverId: string | null,
  isPremium: boolean,
): CustomEmojiPickerData {
  const { servers, byServer, load } = useServerEmojiCatalog();

  return useMemo(() => {
    const { sections, byId, hasLocked } = buildCustomEmojiPickerSections({
      servers,
      byServer,
      serverId,
      isPremium,
    });

    return { sections, byId, hasLocked, load };
  }, [servers, byServer, serverId, isPremium, load]);
}
