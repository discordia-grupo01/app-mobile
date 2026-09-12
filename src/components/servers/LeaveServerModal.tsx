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

import type { LeaveServerActionResult } from "../../features/servers/types";
import { colors } from "../../theme/colors";
import { Button } from "../ui/Button";

interface LeaveServerModalProps {
  visible: boolean;
  serverName: string;
  onClose: () => void;
  onConfirm: () => Promise<LeaveServerActionResult>;
}

export function LeaveServerModal({
  visible,
  serverName,
  onClose,
  onConfirm,
}: LeaveServerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setError("");
      setIsSubmitting(false);
    }
  }

  async function handleConfirm() {
    setError("");
    setIsSubmitting(true);
    const result = await onConfirm();
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onClose();
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardCloseButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Feather name="x" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.cardIcon}>
            <Feather name="log-out" size={26} color={colors.danger} />
          </View>
          <Text style={styles.cardTitle}>¿Abandonar {serverName}?</Text>
          <Text style={styles.cardSubtitle}>
            Vas a perder acceso a todos sus canales de texto y voz. Para volver
            a entrar vas a necesitar una nueva invitación.
          </Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={15} color={colors.danger} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.footer}>
            <Button title="Cancelar" variant="secondary" onPress={onClose} />
            <Button
              title="Abandonar servidor"
              variant="danger"
              onPress={handleConfirm}
              isLoading={isSubmitting}
            />
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
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgModal,
    padding: 28,
    paddingTop: 24,
    alignItems: "center",
  },
  cardCloseButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(224,82,82,0.14)",
    marginTop: 8,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(224,82,82,0.3)",
    backgroundColor: "rgba(224,82,82,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  errorBannerText: {
    flex: 1,
    color: colors.danger,
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    flexDirection: "column",
    gap: 10,
    width: "100%",
    marginTop: 20,
  },
});
