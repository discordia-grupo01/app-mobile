import { QUICK_REACTIONS } from "@discordia/client-shared";

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface EmojiPickerSheetProps {
  visible: boolean;
  title: string;
  onPick: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPickerSheet({
  visible,
  title,
  onPick,
  onClose,
}: EmojiPickerSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.55)]">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Cerrar"
        />

        <View
          className="rounded-t-[20px] border-t border-line-strong bg-surface-modal px-4 pt-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Text className="mb-3 text-[11px] font-bold uppercase tracking-[1.2px] text-content-subtle">
            {title}
          </Text>
          <View className="flex-row justify-between">
            {QUICK_REACTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => {
                  onPick(emoji);
                  onClose();
                }}
                className="h-12 w-12 items-center justify-center rounded-xl bg-surface-input"
                accessibilityRole="button"
                accessibilityLabel={emoji}
              >
                <Text className="text-[24px]">{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
