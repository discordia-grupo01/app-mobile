import {
  formatMessageTimestamp,
  hexToRgba,
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

      {author.roleName ? (
        <Text
          className="overflow-hidden rounded px-1 py-px text-[10px] font-semibold text-sky"
          style={
            roleColor
              ? {
                  color: roleColor,
                  backgroundColor: hexToRgba(roleColor, 0.15),
                }
              : undefined
          }
        >
          {author.roleName}
        </Text>
      ) : null}

      <Text className="text-[11px] text-content-subtle">
        {formatMessageTimestamp(createdAt)}
      </Text>
    </View>
  );
}
