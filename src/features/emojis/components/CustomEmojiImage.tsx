import { emojiLabel } from "@discordia/client-shared";
import { Image } from "expo-image";
import { useMemo } from "react";
import { Text, View } from "react-native";

import { resolveEmojiImageUrl } from "../api";
import { useCustomEmoji } from "../CustomEmojisContext";
import { useServerEmojiCatalog } from "../ServerEmojisContext";

interface CustomEmojiImageProps {
  id: string;
  name: string;
  size?: number;
}

export function CustomEmojiImage({
  id,
  name,
  size = 22,
}: CustomEmojiImageProps) {
  const customEmoji = useCustomEmoji(id);
  const { byServer } = useServerEmojiCatalog();

  const serverEmoji = useMemo(() => {
    if (customEmoji) return null;
    for (const emojis of Object.values(byServer)) {
      const match = emojis.find((item) => item.id === id);
      if (match) return match;
    }
    return null;
  }, [customEmoji, byServer, id]);

  const emoji = customEmoji ?? serverEmoji;
  const label = emojiLabel(name);

  if (!emoji) {
    return <Text className="text-content">{label}</Text>;
  }

  const uri = resolveEmojiImageUrl(emoji.image_url);

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        contentFit="contain"
        accessibilityLabel={label}
      />
    </View>
  );
}
