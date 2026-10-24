import {
  formatMessageTimestamp,
  type MessageAuthor,
} from "@discordia/client-shared";

import { Pressable, Text, View } from "react-native";

interface MessageHeaderProps {
  author: MessageAuthor;
  createdAt: string;
  onOpenProfile?: () => void;
}

export function MessageHeader({
  author,
  createdAt,
  onOpenProfile,
}: MessageHeaderProps) {
  const roleColor = author.roleColor;
  const name = (
    <Text
      className="text-[15px] font-bold text-content"
      style={roleColor ? { color: roleColor } : undefined}
      numberOfLines={1}
    >
      {author.name}
    </Text>
  );

  return (
    <View className="mb-0.5 flex-row flex-wrap items-center gap-x-2 gap-y-0.5">
      {onOpenProfile ? (
        <Pressable
          onPress={onOpenProfile}
          accessibilityRole="button"
          accessibilityLabel={`Ver perfil de ${author.name}`}
          hitSlop={6}
        >
          {name}
        </Pressable>
      ) : (
        name
      )}

      <Text className="text-[11px] text-content-subtle">
        {formatMessageTimestamp(createdAt)}
      </Text>
    </View>
  );
}
