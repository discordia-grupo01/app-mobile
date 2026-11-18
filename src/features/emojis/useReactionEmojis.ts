import {
  canUseCustomEmoji,
  customEmojiReactionTooltip,
  customEmojiToken,
  premiumReasonForCustomEmoji,
  type ServerEmoji,
} from "@discordia/client-shared";
import { useCallback, useMemo } from "react";

import { useOwnPremium } from "../billing/useOwnPremium";
import { useServerEmojiCatalog } from "./ServerEmojisContext";
import { useCustomEmojiPicker } from "./useCustomEmojiPicker";

type EmojiUse = Pick<ServerEmoji, "animated" | "server_id">;

export type CustomReactionPick =
  { kind: "react"; token: string } | { kind: "premium" } | { kind: "unknown" };

export interface ReactionEmojis {
  load: () => void;
  pick: (id: string) => CustomReactionPick;
  isLocked: (emoji: EmojiUse) => boolean;
  tooltip: (emoji: EmojiUse, name: string) => string;
}

export function resolveReactionPick(
  emoji: ServerEmoji | undefined,
  isLocked: boolean,
): CustomReactionPick {
  if (!emoji) return { kind: "unknown" };
  if (isLocked) return { kind: "premium" };
  return { kind: "react", token: customEmojiToken(emoji) };
}

export function useReactionEmojis(serverId: string | null): ReactionEmojis {
  const isPremium = useOwnPremium();
  const { load } = useServerEmojiCatalog();
  const catalog = useCustomEmojiPicker(serverId, isPremium);

  const isLocked = useCallback(
    (emoji: EmojiUse) => !canUseCustomEmoji({ emoji, serverId, isPremium }),
    [serverId, isPremium],
  );

  const tooltip = useCallback(
    (emoji: EmojiUse, name: string) =>
      customEmojiReactionTooltip(name, {
        animated: premiumReasonForCustomEmoji(emoji, serverId) === "animated",
        locked: isLocked(emoji),
      }),
    [serverId, isLocked],
  );

  const pick = useCallback(
    (id: string): CustomReactionPick => {
      const emoji = catalog.byId[id];
      return resolveReactionPick(emoji, emoji ? isLocked(emoji) : false);
    },
    [catalog.byId, isLocked],
  );

  return useMemo(
    () => ({
      load,
      pick,
      isLocked,
      tooltip,
    }),
    [load, pick, isLocked, tooltip],
  );
}
