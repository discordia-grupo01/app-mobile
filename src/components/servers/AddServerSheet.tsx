import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "../../theme/colors";

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
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Agregar servidor</Text>

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.option}
            onPress={onCreatePress}
          >
            <View style={[styles.optionIcon, styles.optionIconAccent]}>
              <Feather name="plus" size={19} color={colors.sky} />
            </View>
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Crear servidor</Text>
              <Text style={styles.optionDescription}>
                Elegí un nombre e ícono para tu propio servidor.
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSubtle} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.option}
            onPress={onJoinPress}
          >
            <View style={styles.optionIcon}>
              <Feather name="link-2" size={19} color={colors.info} />
            </View>
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Unirme con enlace</Text>
              <Text style={styles.optionDescription}>
                Pegá un código o link de invitación.
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textSubtle} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: colors.bgModal,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 14,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(107,149,189,0.15)",
  },
  optionIconAccent: {
    backgroundColor: "rgba(36,92,107,0.3)",
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  cancelButton: {
    marginTop: 8,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.bgInput,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
  },
});
