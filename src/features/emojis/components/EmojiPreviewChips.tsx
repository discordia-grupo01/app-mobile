import { Feather } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import type { ActiveDraftEmoji } from "../../messages/useMentionDraft";
import { CustomEmojiImage } from "./CustomEmojiImage";

interface EmojiPreviewChipsProps {
  items: readonly ActiveDraftEmoji[];
  onRemove: (start: number, end: number) => void;
  disabled?: boolean;
}

/**
 * Tira de miniaturas de los emojis elegidos que estan presentes en el borrador,
 * arriba del campo de texto (similar a AttachmentChips).
 */
export function EmojiPreviewChips({
  items,
  onRemove,
  disabled = false,
}: EmojiPreviewChipsProps) {
  const colors = useThemeColors();
  if (items.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-2"
      contentContainerClassName="flex-row items-center gap-1.5"
    >
      {items.map((item) => (
        <View
          key={`${item.emoji.id}-${item.start}`}
          className="flex-row items-center gap-1.5 rounded-full border border-line bg-surface-input py-1 pl-1.5 pr-2"
        >
          <CustomEmojiImage
            id={item.emoji.id}
            name={item.emoji.name}
            size={18}
          />
          <Text className="text-[12px] font-medium text-content">
            :{item.emoji.name}:
          </Text>
          {!disabled ? (
            <TouchableOpacity
              onPress={() => onRemove(item.start, item.end)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Quitar :${item.emoji.name}:`}
              className="ml-0.5"
            >
              <Feather name="x" size={13} color={colors.textSubtle} />
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}
