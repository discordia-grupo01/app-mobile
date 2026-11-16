import {
  PLATFORM_STATUS_TITLE,
  type PlatformStatusResponse,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "../../../theme/theme-context";
import { PlatformStatusDetails } from "./PlatformStatusDetails";

interface PlatformStatusModalProps {
  visible: boolean;
  data: PlatformStatusResponse;
  onClose: () => void;
}

export function PlatformStatusModal({
  visible,
  data,
  onClose,
}: PlatformStatusModalProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        className="flex-1 bg-surface-modal"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center gap-2 border-b border-line px-4 py-3">
          <Text className="flex-1 text-[17px] font-bold text-content">
            {PLATFORM_STATUS_TITLE}
          </Text>
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-xl"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Feather name="x" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={{
            padding: 18,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <PlatformStatusDetails {...data} />
        </ScrollView>
      </View>
    </Modal>
  );
}
