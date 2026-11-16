import {
  MARK_SERVER_READ_LABEL,
  markServerReadLabel,
  SERVER_OPTIONS_CANCEL,
  type ServerSummary,
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

import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";

interface ServerOptionsSheetProps {
  server: ServerSummary | null;
  canMarkRead: boolean;
  onMarkRead: () => void;
  onClose: () => void;
}

export function ServerOptionsSheet({
  server,
  canMarkRead,
  onMarkRead,
  onClose,
}: ServerOptionsSheetProps) {
  const colors = useThemeColors();
  return (
    <Modal
      transparent
      visible={server !== null}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="bg-surface-modal rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong px-4.5 pt-2.5 pb-7">
          <View className="self-center w-9 h-1 rounded-xs bg-line-strong mb-4" />

          {server ? (
            <Text
              className="mb-2.5 px-2 text-[14px] font-bold text-content-subtle"
              numberOfLines={1}
            >
              {server.name}
            </Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.75}
            className="flex-row items-center gap-3.5 rounded-[14px] py-3 px-2"
            onPress={onMarkRead}
            disabled={!canMarkRead}
            accessibilityRole="button"
            accessibilityLabel={
              server ? markServerReadLabel(server.name) : MARK_SERVER_READ_LABEL
            }
            accessibilityState={{ disabled: !canMarkRead }}
            style={canMarkRead ? undefined : { opacity: 0.4 }}
          >
            <View
              className="w-9.5 h-9.5 rounded-[11px] items-center justify-center"
              style={{ backgroundColor: withAlpha(colors.info, 0.15) }}
            >
              <Feather name="check-circle" size={16} color={colors.info} />
            </View>
            <Text className="text-[15px] font-bold text-content">
              {MARK_SERVER_READ_LABEL}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            className="mt-2 items-center py-3.5 rounded-xl bg-surface-input"
            onPress={onClose}
          >
            <Text className="text-[14px] font-bold text-content-muted">
              {SERVER_OPTIONS_CANCEL}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
