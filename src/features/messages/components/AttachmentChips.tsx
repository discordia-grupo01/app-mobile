import { Feather } from "@expo/vector-icons";
import type { DocumentPickerAsset } from "expo-document-picker";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

const UNITS = ["B", "KB", "MB", "GB"];

function formatSize(bytes: number | undefined): string {
  if (bytes === undefined) return "";
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${unit === 0 ? value : value.toFixed(1)} ${UNITS[unit]}`;
}

interface AttachmentChipsProps {
  attachments: DocumentPickerAsset[];
  onRemove: (uri: string) => void;
}

/** Archivos elegidos y todavia sin enviar (maqueta: aun no hay back de adjuntos). */
export function AttachmentChips({
  attachments,
  onRemove,
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
          <Feather name="file" size={16} color={colors.textSubtle} />
          <View className="shrink">
            <Text
              numberOfLines={1}
              className="text-[12px] font-medium text-content"
            >
              {file.name}
            </Text>
            <Text className="text-[11px] text-content-subtle">
              {formatSize(file.size)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onRemove(file.uri)}
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
