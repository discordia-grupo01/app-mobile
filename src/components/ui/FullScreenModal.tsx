import { Feather } from "@expo/vector-icons";
import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useModalInsets } from "../../hooks/useModalInsets";
import { useThemeColors } from "../../theme/theme-context";

interface FullScreenModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  /** Muestra la flecha; si no se pasa, solo se cierra con la X. */
  onBack?: () => void;
  /** Queda fijo abajo, fuera del scroll (por ejemplo, el boton de crear). */
  footer?: ReactNode;
  /** El contenido maneja su propio scroll. */
  children: ReactNode;
}

/** Pantalla completa con el mismo encabezado que Configuracion: flecha, titulo y X. */
export function FullScreenModal({
  visible,
  title,
  onClose,
  onBack,
  footer,
  children,
}: FullScreenModalProps) {
  const colors = useThemeColors();
  const insets = useModalInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onBack ?? onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-surface-modal"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-row items-center gap-2 border-b border-line px-4 py-3">
          {onBack ? (
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-xl bg-surface-input"
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Volver"
            >
              <Feather name="arrow-left" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
          <Text
            className="flex-1 text-[17px] font-bold text-content"
            numberOfLines={1}
          >
            {title}
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

        <View className="flex-1">{children}</View>

        {footer ? (
          <View className="border-t border-line px-4.5 py-4">{footer}</View>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}
