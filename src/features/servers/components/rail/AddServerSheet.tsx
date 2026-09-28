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

interface AddServerSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreatePress: () => void;
  onJoinPress: () => void;
}

export function AddServerSheet({
  visible,
  onClose,
  onCreatePress,
  onJoinPress,
}: AddServerSheetProps) {
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
          <Text className="text-[17px] font-bold text-content mb-3.5">
            Agregar servidor
          </Text>

          <TouchableOpacity
            activeOpacity={0.75}
            className="flex-row items-center gap-3.5 rounded-[14px] py-3 px-2"
            onPress={onCreatePress}
          >
            <View className="w-10.5 h-10.5 rounded-xl items-center justify-center bg-[rgba(36,92,107,0.3)]">
              <Feather name="plus" size={19} color={colors.sky} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-content mb-0.5">
                Crear servidor
              </Text>
              <Text className="text-[12px] leading-[17px] text-content-muted">
                Elegí un nombre e ícono para tu propio servidor.
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSubtle} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            className="flex-row items-center gap-3.5 rounded-[14px] py-3 px-2"
            onPress={onJoinPress}
          >
            <View className="w-10.5 h-10.5 rounded-xl items-center justify-center bg-[rgba(107,149,189,0.15)]">
              <Feather name="link-2" size={19} color={colors.info} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-content mb-0.5">
                Unirme con enlace
              </Text>
              <Text className="text-[12px] leading-[17px] text-content-muted">
                Pegá un código o link de invitación.
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSubtle} />
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
