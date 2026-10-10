import {
  ADD_REACTION_LABEL,
  type MessageReaction,
} from "@discordia/client-shared";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { ReactionChip } from "./ReactionChip";

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onToggle: (emoji: string) => void;
  onAddPress: () => void;
  /** Sin `ADD_REACTIONS`: solo se puede sacar la reaccion propia (CA2/CA3). */
  canAdd?: boolean;
}

export function MessageReactions({
  reactions,
  onToggle,
  onAddPress,
  canAdd = true,
}: MessageReactionsProps) {
  const colors = useThemeColors();
  if (reactions.length === 0) return null;

  return (
    <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
      {reactions.map((reaction) => (
        <ReactionChip
          key={reaction.emoji}
          reaction={reaction}
          onToggle={() => onToggle(reaction.emoji)}
          disabled={!canAdd && !reaction.reacted_by_me}
        />
      ))}
      {canAdd ? (
        <TouchableOpacity
          onPress={onAddPress}
          className="h-[26px] items-center justify-center rounded-full border border-line px-2.5"
          accessibilityRole="button"
          accessibilityLabel={ADD_REACTION_LABEL}
        >
          <MaterialCommunityIcons
            name="emoticon-plus-outline"
            size={14}
            color={colors.textSubtle}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
