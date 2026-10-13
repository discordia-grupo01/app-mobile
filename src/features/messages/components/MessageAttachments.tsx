import {
  formatFileSize,
  isImageAttachment,
  type MessageAttachment,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Image, Pressable, Text, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

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
            <Image
              source={{ uri: attachment.url }}
              resizeMode="contain"
              className="h-56 w-full rounded-[10px] border border-line"
              accessibilityLabel={attachment.name}
            />
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
