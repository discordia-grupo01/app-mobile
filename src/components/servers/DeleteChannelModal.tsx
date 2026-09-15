import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { deleteChannel } from "../../features/servers/service";
import type { Channel } from "../../features/servers/types";
import { colors } from "../../theme/colors";
import { Button } from "../ui/Button";

interface DeleteChannelModalProps {
  channel: Channel;
  onClose: () => void;
  onDeleted: () => void;
}

/** Requiere una acción explícita antes de borrar (no hay deshacer). */
export function DeleteChannelModal({
  channel,
  onClose,
  onDeleted,
}: DeleteChannelModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    setIsLoading(true);
    setErrorMessage("");
    const result = await deleteChannel(channel.id);
    setIsLoading(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    onDeleted();
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {!isLoading ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        ) : null}

        <View style={styles.card}>
          {!isLoading ? (
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <Feather name="x" size={13} color={colors.textSubtle} />
            </TouchableOpacity>
          ) : null}

          <View style={styles.content}>
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={15} color={colors.danger} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.iconCircle}>
              <Feather name="trash-2" size={28} color={colors.danger} />
            </View>

            <Text style={styles.title}>¿Eliminar #{channel.name}?</Text>
            <Text style={styles.description}>
              Esta acción no se puede deshacer. Se va a eliminar el canal y su
              historial de mensajes de forma permanente.
            </Text>

            <View style={styles.buttonsRow}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
                disabled={isLoading}
                style={{ flex: 1, width: undefined }}
              />
              <Button
                title="Eliminar canal"
                variant="danger"
                onPress={handleDelete}
                isLoading={isLoading}
                style={{ flex: 1, width: undefined }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgModal,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(224,82,82,0.3)",
    backgroundColor: "rgba(224,82,82,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorBannerText: {
    flex: 1,
    color: colors.danger,
    fontSize: 13,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(224,82,82,0.15)",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: -8,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 4,
  },
});
