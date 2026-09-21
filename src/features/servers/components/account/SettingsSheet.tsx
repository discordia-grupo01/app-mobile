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

interface SettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  onOpenAppearance: () => void;
  onOpenPinSetup: () => void;
}

export function SettingsSheet({
  visible,
  onClose,
  onOpenAppearance,
  onOpenPinSetup,
}: SettingsSheetProps) {
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
            Configuración
          </Text>

          <TouchableOpacity
            activeOpacity={0.75}
            className="flex-row items-center gap-3.5 rounded-[14px] py-3 px-2"
            onPress={onOpenAppearance}
          >
            <View className="w-10.5 h-10.5 rounded-xl items-center justify-center bg-[rgba(107,149,189,0.15)]">
              <Feather name="moon" size={18} color={colors.info} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-content mb-0.5">
                Apariencia
              </Text>
              <Text className="text-[12px] leading-[17px] text-content-muted">
                Modo claro u oscuro.
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSubtle} />
          </TouchableOpacity>

          <Text className="mt-3 mb-1.5 px-2 text-[11px] font-bold tracking-[1.2px] text-content-subtle uppercase">
            Seguridad y acceso
          </Text>

          <TouchableOpacity
            activeOpacity={0.75}
            className="flex-row items-center gap-3.5 rounded-[14px] py-3 px-2"
            onPress={onOpenPinSetup}
          >
            <View className="w-10.5 h-10.5 rounded-xl items-center justify-center bg-[rgba(36,92,107,0.3)]">
              <Feather name="lock" size={18} color={colors.sky} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-content mb-0.5">
                Activar PIN de acceso rápido
              </Text>
              <Text className="text-[12px] leading-[17px] text-content-muted">
                Entrá más rápido en este dispositivo.
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
              Cerrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
