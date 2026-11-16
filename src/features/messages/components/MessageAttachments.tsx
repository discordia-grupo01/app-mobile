import {
  formatFileSize,
  isImageAttachment,
  type MessageAttachment,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { Pressable, Text, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

const IMAGE_FILL = { width: "100%", height: "100%" } as const;

interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
}

/** Adjuntos de un mensaje: las imagenes en linea y los PDF como tarjeta. */
export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  const colors = useThemeColors();
  if (attachments.length === 0) return null;

  return (
    <View className="mt-1 gap-2">
      {attachments.map((attachment) => (
        <Pressable
          key={attachment.id}
          onPress={() => void WebBrowser.openBrowserAsync(attachment.url)}
          accessibilityRole="link"
          accessibilityLabel={`Abrir ${attachment.name}`}
        >
          {isImageAttachment(attachment) ? (
            // expo-image y no el Image de React Native: en Android ese no anima
            // los GIF.
            <View className="h-56 w-full overflow-hidden rounded-[10px] border border-line">
              <Image
                source={{ uri: attachment.url }}
                contentFit="contain"
                recyclingKey={attachment.id}
                style={IMAGE_FILL}
                accessibilityLabel={attachment.name}
              />
            </View>
          ) : (
            <View className="max-w-72 flex-row items-center gap-2 self-start rounded-[10px] border border-line bg-surface-input px-3 py-2">
              <Feather name="file" size={20} color={colors.textSubtle} />
              <View className="shrink">
                <Text
                  numberOfLines={1}
                  className="text-[14px] font-medium text-content"
                >
                  {attachment.name}
                </Text>
                <Text className="text-[11px] text-content-subtle">
                  {formatFileSize(attachment.size)}
                </Text>
              </View>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}
