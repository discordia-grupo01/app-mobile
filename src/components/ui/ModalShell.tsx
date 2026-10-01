import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { cn } from "../../lib/cn";

interface ModalShellProps {
  visible: boolean;
  onClose: () => void;
  /** Clases del card (ancho maximo, alto, etc.). */
  className?: string;
  /** Para valores que dependen del runtime, como un alto maximo segun la pantalla. */
  style?: ViewStyle;
  /** `false` ignora el toque en el fondo (por ejemplo mientras se guarda). */
  dismissOnBackdrop?: boolean;
  /** Flota sobre el fondo, fuera del card (por ejemplo un aviso temporal). */
  floating?: ReactNode;
  children: ReactNode;
}

/** Overlay oscuro + card centrado: lo que repiten todos los modales de la app. */
export function ModalShell({
  visible,
  onClose,
  className,
  style,
  dismissOnBackdrop = true,
  floating,
  children,
}: ModalShellProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-[rgba(0,0,0,0.65)] items-center justify-center p-4"
      >
        {dismissOnBackdrop ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        ) : null}
        <View
          className={cn(
            "w-full max-h-[90%] rounded-[20px] border border-line-strong bg-surface-modal overflow-hidden",
            className,
          )}
          style={style}
        >
          {children}
        </View>
        {floating}
      </KeyboardAvoidingView>
    </Modal>
  );
}
