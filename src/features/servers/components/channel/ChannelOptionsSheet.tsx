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

import { colors } from "../../../../theme/colors";

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

          {channel ? (
            <View style={styles.titleRow}>
              <Feather
                name={channel.kind === "text" ? "hash" : "volume-2"}
                size={14}
                color={colors.textSubtle}
              />
              <Text style={styles.title} numberOfLines={1}>
                {channel.name}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.option}
            onPress={onEdit}
          >
            <View style={styles.optionIcon}>
              <Feather name="edit-2" size={16} color={colors.info} />
            </View>
            <Text style={styles.optionTitle}>Editar Canal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.option}
            onPress={onDelete}
          >
            <View style={[styles.optionIcon, styles.optionIconDanger]}>
              <Feather name="trash-2" size={16} color={colors.danger} />
            </View>
            <Text style={[styles.optionTitle, styles.optionTitleDanger]}>
              Eliminar Canal
            </Text>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSubtle,
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
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(107,149,189,0.15)",
  },
  optionIconDanger: {
    backgroundColor: "rgba(224,82,82,0.12)",
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  optionTitleDanger: {
    color: colors.danger,
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
