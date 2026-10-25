import {
  ACTIVITY_STATUS_CHOICE_DESCRIPTION,
  ACTIVITY_STATUS_CHOICE_LABEL,
  ACTIVITY_STATUS_CHOICES,
  displayedStatus,
  type ActivityStatusChoice,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { ActivityStatusDot } from "./ActivityStatusDot";

interface ActivityStatusSheetProps {
  visible: boolean;
  status: ActivityStatusChoice | null;
  onClose: () => void;
  onSelect: (status: ActivityStatusChoice) => void;
}

export function ActivityStatusSheet({
  visible,
  status,
  onClose,
  onSelect,
}: ActivityStatusSheetProps) {
  const colors = useThemeColors();
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="bg-surface-modal rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong px-4.5 pt-2.5 pb-7">
          <View className="self-center w-9 h-1 rounded-xs bg-line-strong mb-4" />
          <Text className="text-[17px] font-bold text-content mb-2">
            Estado de actividad
          </Text>

          {ACTIVITY_STATUS_CHOICES.map((choice) => {
            const description = ACTIVITY_STATUS_CHOICE_DESCRIPTION[choice];
            const selected = choice === status;
            return (
              <TouchableOpacity
                key={choice}
                activeOpacity={0.75}
                onPress={() => onSelect(choice)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={`flex-row items-center gap-3.5 rounded-[14px] py-3 px-3 ${
                  selected ? "bg-surface-input" : ""
                }`}
              >
                <ActivityStatusDot
                  status={displayedStatus(choice)}
                  size={10}
                  ringWidth={0}
                />
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-content">
                    {ACTIVITY_STATUS_CHOICE_LABEL[choice]}
                  </Text>
                  {description ? (
                    <Text className="text-[12px] leading-[17px] text-content-muted mt-0.5">
                      {description}
                    </Text>
                  ) : null}
                </View>
                {selected ? (
                  <Feather name="check" size={18} color={colors.success} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
