import {
  EMOJI_ANIMATED_BADGE,
  EMOJI_DELETE_COPY,
  emojiAuthorLabel,
  emojiLabel,
  formatDayAndMonth,
  type ServerEmoji,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { resolveEmojiImageUrl } from "../api";
import { EmojiPremiumBadge } from "./EmojiPremiumBadge";

interface EmojiRowProps {
  emoji: ServerEmoji;
  authorName: string | null;
  canManage: boolean;
  isPremium: boolean;
  onDelete: (emoji: ServerEmoji) => void;
}

export function EmojiRow({
  emoji,
  authorName,
  canManage,
  isPremium,
  onDelete,
}: EmojiRowProps) {
  const colors = useThemeColors();
  const imageUrl = resolveEmojiImageUrl(emoji.image_url);

  const authorText =
    authorName !== null
      ? emojiAuthorLabel(authorName, emoji.created_at)
      : formatDayAndMonth(emoji.created_at);

  return (
    <View className="flex-row items-center gap-3.5 border-b border-line px-3.5 py-3">
      <View className="relative">
        <Image
          source={{ uri: imageUrl }}
          style={{ width: 34, height: 34 }}
          contentFit="contain"
          accessibilityLabel={emojiLabel(emoji.name)}
        />
        {emoji.animated && !isPremium ? (
          <EmojiPremiumBadge size={14} className="absolute -top-1 -right-1" />
        ) : null}
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text
            className="text-[15px] font-semibold text-content"
            numberOfLines={1}
          >
            {emojiLabel(emoji.name)}
          </Text>
          {emoji.animated ? (
            <View className="shrink-0 rounded-md border border-boost-warn-line bg-boost-warn-soft px-1.5 py-0.5">
              <Text className="text-[10px] font-bold text-boost-warn">
                {EMOJI_ANIMATED_BADGE}
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          className="mt-0.5 text-[12px] text-content-subtle"
          numberOfLines={1}
        >
          {authorText}
        </Text>
      </View>

      {canManage ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onDelete(emoji)}
          accessibilityRole="button"
          accessibilityLabel={`${EMOJI_DELETE_COPY.confirm} ${emojiLabel(emoji.name)}`}
          className="h-9.5 w-9.5 items-center justify-center rounded-xl bg-surface-input"
        >
          <Feather name="trash-2" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
