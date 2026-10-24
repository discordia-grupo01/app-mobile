import {
  formatMessageTimestamp,
  type MessageAuthor,
} from "@discordia/client-shared";

import { Text, View } from "react-native";

interface MessageHeaderProps {
  author: MessageAuthor;
  createdAt: string;
}

export function MessageHeader({ author, createdAt }: MessageHeaderProps) {
  const roleColor = author.roleColor;

  return (
    <View className="mb-0.5 flex-row flex-wrap items-center gap-x-2 gap-y-0.5">
      <Text
        className="text-[15px] font-bold text-content"
        style={roleColor ? { color: roleColor } : undefined}
        numberOfLines={1}
      >
        {author.name}
      </Text>

      <Text className="text-[11px] text-content-subtle">
        {formatMessageTimestamp(createdAt)}
      </Text>
    </View>
  );
}
