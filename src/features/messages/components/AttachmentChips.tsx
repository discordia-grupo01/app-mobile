import { formatFileSize } from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import type { DocumentPickerAsset } from "expo-document-picker";
import { Image } from "expo-image";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

const IMAGE_FILL = { width: "100%", height: "100%" } as const;

interface AttachmentChipsProps {
  attachments: DocumentPickerAsset[];
  onRemove: (uri: string) => void;
  disabled?: boolean;
}

/** Archivos elegidos y todavia sin enviar. */
export function AttachmentChips({
  attachments,
  onRemove,
  disabled = false,
}: AttachmentChipsProps) {
  const colors = useThemeColors();
  if (attachments.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-2"
      contentContainerClassName="gap-2"
    >
      {attachments.map((file) => (
        <View
          key={file.uri}
          className="max-w-56 flex-row items-center gap-2 rounded-[10px] border border-line bg-surface-input px-2.5 py-1.5"
        >
          {file.mimeType?.startsWith("image/") ? (
            <View className="size-8 overflow-hidden rounded">
              <Image
                source={{ uri: file.uri }}
                contentFit="cover"
                style={IMAGE_FILL}
                accessibilityIgnoresInvertColors
              />
            </View>
          ) : (
            <Feather name="file" size={16} color={colors.textSubtle} />
          )}
          <View className="shrink">
            <Text
              numberOfLines={1}
              className="text-[12px] font-medium text-content"
            >
              {file.name}
            </Text>
            <Text className="text-[11px] text-content-subtle">
              {file.size === undefined ? "" : formatFileSize(file.size)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onRemove(file.uri)}
            disabled={disabled}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Quitar ${file.name}`}
          >
            <Feather name="x" size={14} color={colors.textSubtle} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
