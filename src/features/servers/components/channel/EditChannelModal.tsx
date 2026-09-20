import {
  type Channel,
  MAX_NAME,
  validateChannelName,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
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

import { updateChannel } from "../../api";
import { colors } from "../../../../theme/colors";
import { Button } from "../../../../components/ui/Button";

interface EditChannelModalProps {
  channel: Channel;
  onClose: () => void;
  onUpdated: (channel: Channel) => void;
}

export function EditChannelModal({
  channel,
  onClose,
  onUpdated,
}: EditChannelModalProps) {
  const [name, setName] = useState(channel.name);
  const [nameError, setNameError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmed = name.trim();

  async function handleSubmit() {
    setNameError("");
    setGlobalError("");

    const nameError = validateChannelName(trimmed);
    if (nameError) {
      setNameError(nameError);
      return;
    }

    setIsSubmitting(true);
    const result = await updateChannel(channel.id, { name: trimmed });
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors?.name) setNameError(result.fieldErrors.name);
      if (!result.fieldErrors) setGlobalError(result.message);
      return;
    }

    onUpdated(result.channel);
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
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
            <View style={styles.header}>
              <Feather
                name={channel.kind === "text" ? "hash" : "volume-2"}
                size={18}
                color={colors.textSubtle}
              />
              <View style={styles.headerTextWrap}>
                <Text style={styles.headerTitle}>Editar Canal</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  #{channel.name}
                </Text>
              </View>
            </View>

            {globalError ? (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorBannerText}>{globalError}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NOMBRE DEL CANAL</Text>
              <View
                style={[styles.input, nameError ? styles.inputError : null]}
              >
                <Text style={styles.inputHash}>#</Text>
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setNameError("");
                    setGlobalError("");
                  }}
                  maxLength={MAX_NAME + 10}
                  autoFocus
                  autoCapitalize="none"
                  style={styles.inputText}
                />
              </View>
              {nameError ? (
                <View style={styles.fieldErrorRow}>
                  <Feather
                    name="alert-circle"
                    size={13}
                    color={colors.danger}
                  />
                  <Text style={styles.fieldErrorText}>{nameError}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.footer}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
                style={{ flex: 1, width: undefined }}
              />
              <Button
                title="Guardar cambios"
                onPress={handleSubmit}
                disabled={!trimmed}
                isLoading={isSubmitting}
                style={{ flex: 1, width: undefined }}
              />
            </View>
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
    gap: 10,
    marginBottom: 20,
    paddingRight: 24,
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
    marginBottom: 8,
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
  inputHash: {
    color: colors.textSubtle,
    fontSize: 14,
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
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
