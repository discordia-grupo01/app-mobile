import {
  CUSTOM_EMOJI_REACTION_OFFER_COPY,
  emojiLabel,
  type MessageReaction,
  parseCustomEmojiTokens,
} from "@discordia/client-shared";
import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../lib/cn";
import { DiscordiaPremiumIcon } from "../../billing/components/shared/DiscordiaIcons";
import { CustomEmojiImage } from "../../emojis/components/CustomEmojiImage";
import { useCustomEmoji } from "../../emojis/CustomEmojisContext";
import type { ReactionEmojis } from "../../emojis/useReactionEmojis";

interface ReactionChipProps {
  reaction: MessageReaction;
  onToggle: () => void;
  /** Sin permiso para reaccionar: se ve, pero no se puede sumar a la reaccion. */
  disabled?: boolean;
  /** Las reglas de Premium del chat. Sin esto el chip no marca nada. */
  reactionEmojis?: ReactionEmojis;
  /** Se quiso sumar a una reacción que pide Premium: se ofrece en vez de mandar. */
  onNeedsPremium?: () => void;
}

export function ReactionChip({
  reaction,
  onToggle,
  disabled = false,
  reactionEmojis,
  onNeedsPremium,
}: ReactionChipProps) {
  const [custom] = parseCustomEmojiTokens(reaction.emoji);
  const emoji = useCustomEmoji(custom?.id ?? null);

  const locked =
    !reaction.reacted_by_me &&
    emoji != null &&
    (reactionEmojis?.isLocked(emoji) ?? false) &&
    onNeedsPremium !== undefined;

  const label = custom ? emojiLabel(custom.name) : reaction.emoji;

  return (
    <TouchableOpacity
      onPress={locked ? onNeedsPremium : onToggle}
      disabled={disabled}
      activeOpacity={0.7}
      className={cn(
        "flex-row items-center gap-1 rounded-full border px-2.5 py-1",
        reaction.reacted_by_me
          ? "border-accent bg-accent/15"
          : locked
            ? "border-amber/50 bg-surface-input"
            : "border-line bg-surface-input",
      )}
      accessibilityRole="button"
      accessibilityState={{ selected: reaction.reacted_by_me, disabled }}
      accessibilityLabel={
        locked
          ? `${label} ${reaction.count} · ${CUSTOM_EMOJI_REACTION_OFFER_COPY.locked}`
          : `${label} ${reaction.count}`
      }
    >
      <View className="items-center justify-center">
        {custom ? (
          <CustomEmojiImage id={custom.id} name={custom.name} size={16} />
        ) : (
          <Text className="text-[13px]">{reaction.emoji}</Text>
        )}
      </View>
      <Text className="text-[12px] font-semibold text-content-muted">
        {reaction.count}
      </Text>
      {locked ? <DiscordiaPremiumIcon size={11} /> : null}
    </TouchableOpacity>
  );
}
