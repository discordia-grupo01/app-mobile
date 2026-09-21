import { type Channel } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useThemeColors } from "../../../../theme/theme-context";

interface ChannelOptionsSheetProps {
  visible: boolean;
  channel: Channel | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Menú de "..." de un canal (equivalente al popover de web-client). */
export function ChannelOptionsSheet({
  visible,
  channel,
  onClose,
  onEdit,
  onDelete,
}: ChannelOptionsSheetProps) {
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

          {channel ? (
            <View className="flex-row items-center gap-2 mb-2.5 px-2">
              <Feather
                name={channel.kind === "text" ? "hash" : "volume-2"}
                size={14}
                color={colors.textSubtle}
              />
              <Text
                className="flex-1 text-[14px] font-bold text-content-subtle"
                numberOfLines={1}
              >
                {channel.name}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.75}
            className="flex-row items-center gap-3.5 rounded-[14px] py-3 px-2"
            onPress={onEdit}
          >
            <View className="w-9.5 h-9.5 rounded-[11px] items-center justify-center bg-[rgba(107,149,189,0.15)]">
              <Feather name="edit-2" size={16} color={colors.info} />
            </View>
            <Text className="text-[15px] font-bold text-content">
              Editar Canal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            className="flex-row items-center gap-3.5 rounded-[14px] py-3 px-2"
            onPress={onDelete}
          >
            <View className="w-9.5 h-9.5 rounded-[11px] items-center justify-center bg-[rgba(224,82,82,0.12)]">
              <Feather name="trash-2" size={16} color={colors.danger} />
            </View>
            <Text className="text-[15px] font-bold text-danger">
              Eliminar Canal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            className="mt-2 items-center py-3.5 rounded-xl bg-surface-input"
            onPress={onClose}
          >
            <Text className="text-[14px] font-bold text-content-muted">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
