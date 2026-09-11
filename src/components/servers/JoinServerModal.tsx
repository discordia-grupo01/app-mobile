import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "../../theme/colors";
import {
  joinServerByCode,
  normalizeInviteCode,
} from "../../features/servers/service";
import type { ServerSummary } from "../../features/servers/types";
import { Button } from "../ui/Button";
import { ServerAvatar } from "./ServerAvatar";

interface JoinServerModalProps {
  visible: boolean;
  onClose: () => void;
  onJoined: (server: ServerSummary) => void;
}

/**
 * A diferencia del prototipo de Figma (verificar -> preview -> confirmar),
 * esto es un solo paso: el backend no tiene un endpoint de preview de una
 * invitacion, solo `POST /v1/invites/:code/join`, que ya une directamente.
 */
export function JoinServerModal({
  visible,
  onClose,
  onJoined,
}: JoinServerModalProps) {
  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joined, setJoined] = useState<{
    server: ServerSummary;
    alreadyMember: boolean;
  } | null>(null);

  useEffect(() => {
    if (visible) {
      setCode("");
      setFieldError("");
      setGlobalError("");
      setIsSubmitting(false);
      setJoined(null);
    }
  }, [visible]);

  async function handleSubmit() {
    setFieldError("");
    setGlobalError("");

    const trimmed = code.trim();
    if (!trimmed) {
      setFieldError("Pegá un enlace o código de invitación.");
      return;
    }

    setIsSubmitting(true);
    const result = await joinServerByCode(normalizeInviteCode(trimmed));
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors?.code) setFieldError(result.fieldErrors.code);
      else setGlobalError(result.message);
      return;
    }

    setJoined({ server: result.server, alreadyMember: result.alreadyMember });
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.card}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Feather name="x" size={13} color={colors.textSubtle} />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {joined ? (
              <View style={styles.successWrap}>
                <ServerAvatar
                  name={joined.server.name}
                  size={64}
                  borderRadius={20}
                />

                <View style={styles.successCopy}>
                  <View style={styles.successCheck}>
                    <Feather name="check" size={26} color={colors.success} />
                  </View>
                  <Text style={styles.successTitle}>
                    {joined.alreadyMember
                      ? "Ya sos miembro"
                      : "¡Listo, te uniste!"}
                  </Text>
                  <Text style={styles.successDescription}>
                    <Text style={styles.successDescriptionStrong}>
                      {joined.server.name}
                    </Text>
                    {joined.alreadyMember
                      ? " ya te tenía como miembro."
                      : " te está esperando en la barra lateral."}
                  </Text>
                </View>

                <Button
                  title="Ir al servidor"
                  onPress={() => onJoined(joined.server)}
                />
              </View>
            ) : (
              <View>
                <View style={styles.header}>
                  <View style={styles.headerIcon}>
                    <Feather name="link-2" size={17} color={colors.info} />
                  </View>
                  <View style={styles.headerTextWrap}>
                    <Text style={styles.headerTitle}>Unirme con enlace</Text>
                    <Text style={styles.headerSubtitle}>
                      Pegá el enlace o código de invitación
                    </Text>
                  </View>
                </View>

                {globalError ? (
                  <View style={styles.errorBanner}>
                    <Feather
                      name="alert-circle"
                      size={16}
                      color={colors.danger}
                    />
                    <Text style={styles.errorBannerText}>{globalError}</Text>
                  </View>
                ) : null}

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    ENLACE O CÓDIGO DE INVITACIÓN
                  </Text>
                  <View
                    style={[
                      styles.input,
                      fieldError ? styles.inputError : null,
                    ]}
                  >
                    <Feather
                      name="link-2"
                      size={15}
                      color={colors.textSubtle}
                    />
                    <TextInput
                      value={code}
                      onChangeText={(text) => {
                        setCode(text);
                        setFieldError("");
                        setGlobalError("");
                      }}
                      placeholder="discordia.gg/xY7z2Q"
                      placeholderTextColor={colors.textSubtle}
                      autoFocus
                      autoCapitalize="none"
                      style={styles.inputText}
                    />
                  </View>
                  {fieldError ? (
                    <View style={styles.fieldErrorRow}>
                      <Feather
                        name="alert-circle"
                        size={13}
                        color={colors.danger}
                      />
                      <Text style={styles.fieldErrorText}>{fieldError}</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.helperText}>
                  Los enlaces de invitación tienen este formato:{" "}
                  <Text style={styles.helperTextMono}>discordia.gg/xY7z2Q</Text>
                </Text>

                <View style={styles.footer}>
                  <Button
                    title="Cancelar"
                    variant="secondary"
                    onPress={onClose}
                    style={{ flex: 1, width: undefined }}
                  />
                  <Button
                    title="Unirme"
                    onPress={handleSubmit}
                    disabled={!code.trim()}
                    isLoading={isSubmitting}
                    iconRight="arrow-right"
                    style={{ flex: 1, width: undefined }}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    maxWidth: 440,
    maxHeight: "90%",
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
  scrollContent: {
    padding: 28,
    paddingTop: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingRight: 24,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(107,149,189,0.15)",
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(224,82,82,0.3)",
    backgroundColor: "rgba(224,82,82,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    color: colors.danger,
    fontSize: 13,
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: colors.textSubtle,
    marginBottom: 6,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  fieldErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  fieldErrorText: {
    color: colors.danger,
    fontSize: 12,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSubtle,
    lineHeight: 17,
  },
  helperTextMono: {
    color: colors.textMuted,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  successWrap: {
    alignItems: "center",
    gap: 20,
  },
  successCopy: {
    alignItems: "center",
    gap: 6,
  },
  successCheck: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,161,105,0.15)",
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  successDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 260,
  },
  successDescriptionStrong: {
    color: colors.text,
    fontWeight: "700",
  },
});
