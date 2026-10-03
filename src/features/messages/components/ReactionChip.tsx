import type { MessageReaction } from "@discordia/client-shared";

import { Text, TouchableOpacity } from "react-native";

import { cn } from "../../../lib/cn";

interface ReactionChipProps {
  reaction: MessageReaction;
  onToggle: () => void;
}

export function ReactionChip({ reaction, onToggle }: ReactionChipProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      className={cn(
        "flex-row items-center gap-1 rounded-full border px-2.5 py-1",
        reaction.reacted_by_me
          ? "border-accent bg-accent/15"
          : "border-line bg-surface-input",
      )}
      accessibilityRole="button"
      accessibilityState={{ selected: reaction.reacted_by_me }}
      accessibilityLabel={`${reaction.emoji} ${reaction.count}`}
    >
      <Text className="text-[13px]">{reaction.emoji}</Text>
      <Text className="text-[12px] font-semibold text-content-muted">
        {reaction.count}
      </Text>
    </TouchableOpacity>
  );
}
