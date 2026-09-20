import { type ServerSummary } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
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

import { colors } from "../../../../theme/colors";
import { createServer } from "../../api";
import { Button } from "../../../../components/ui/Button";
import { ServerAvatar } from "../ServerAvatar";

const MAX_NAME = 100;
const MAX_FILE_MB = 20;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

interface PickedIcon {
  uri: string;
  name: string;
  type: string;
}

interface CreateServerModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (server: ServerSummary) => void;
}

export function CreateServerModal({
  visible,
  onClose,
  onCreated,
}: CreateServerModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [created, setCreated] = useState<ServerSummary | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<PickedIcon | null>(null);
  const [nameError, setNameError] = useState("");
  const [iconError, setIconError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);

  // Reinicia el formulario cada vez que el modal pasa a visible. Esto va en
  // el cuerpo del render (patron "adjust state when a prop changes" de
  // React) en vez de en un useEffect para cumplir con la regla de lint
  // react-hooks/set-state-in-effect.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setStep("form");
      setCreated(null);
      setName("");
      setIcon(null);
      setNameError("");
      setIconError("");
      setGlobalError("");
      setIsSubmitting(false);
    }
  }

  const nameLength = name.length;
  const canSubmit =
    name.trim().length >= 2 && nameLength <= MAX_NAME && !isSubmitting;

  async function pickIcon() {
    setIconError("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tus imágenes para elegir un ícono.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const type = asset.mimeType ?? "image/jpeg";
    if (!ALLOWED_TYPES.includes(type)) {
      setIconError("El archivo debe ser PNG, JPG o WEBP.");
      return;
    }
    if (asset.fileSize && asset.fileSize > MAX_FILE_MB * 1024 * 1024) {
      setIconError(`El archivo no puede pesar más de ${MAX_FILE_MB} MB.`);
      return;
    }

    setIcon({
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? "icon.jpg",
      type,
    });
  }

  function removeIcon() {
    setIcon(null);
    setIconError("");
  }

  async function handleSubmit() {
    setNameError("");
    setGlobalError("");

    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Ingresá un nombre para el servidor.");
      return;
    }
    if (trimmed.length < 2 || trimmed.length > MAX_NAME) {
      setNameError("El nombre debe tener entre 2 y 100 caracteres.");
      return;
    }

    setIsSubmitting(true);
    const result = await createServer({
      name: trimmed,
      icon: icon ? { uri: icon.uri, name: icon.name, type: icon.type } : null,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors?.name) setNameError(result.fieldErrors.name);
      if (result.fieldErrors?.icon) setIconError(result.fieldErrors.icon);
      if (!result.fieldErrors) setGlobalError(result.message);
      return;
    }

    setCreated(result.server);
    setStep("success");
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
            <Feather name="x" size={14} color={colors.textSubtle} />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {step === "success" && created ? (
              <View style={styles.successWrap}>
                <View style={styles.previewCard}>
                  <View style={styles.previewHeader}>
                    <ServerAvatar
                      name={created.name}
                      uri={icon?.uri}
                      size={36}
                      borderRadius={18}
                    />
                    <Text style={styles.previewName} numberOfLines={1}>
                      {created.name}
                    </Text>
                  </View>
                  <View style={styles.previewChannels}>
                    {created.channels.map((channel) => (
                      <View key={channel.id} style={styles.previewChannelRow}>
                        <Feather
                          name={channel.kind === "text" ? "hash" : "volume-2"}
                          size={15}
                          color={colors.textSubtle}
                        />
                        <Text style={styles.previewChannelName}>
                          {channel.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.successCopy}>
                  <View style={styles.successCheck}>
                    <Feather name="check" size={26} color={colors.success} />
                  </View>
                  <Text style={styles.successTitle}>¡Servidor creado!</Text>
                  <Text style={styles.successDescription}>
                    <Text style={styles.successDescriptionStrong}>
                      {created.name}
                    </Text>{" "}
                    ya está listo. Encontrás tus canales en la barra lateral.
                  </Text>
                </View>

                <Button
                  title="Ir al servidor"
                  onPress={() => onCreated(created)}
                />
              </View>
            ) : (
              <View>
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Crear un servidor</Text>
                  <Text style={styles.headerSubtitle}>
                    Personalizá tu servidor con un nombre e ícono.{"\n"}Siempre
                    podés cambiarlo después.
                  </Text>
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

                <View style={styles.iconPickerWrap}>
                  <TouchableOpacity activeOpacity={0.85} onPress={pickIcon}>
                    <ServerAvatar name={name} uri={icon?.uri} size={96} />
                  </TouchableOpacity>

                  <View style={styles.iconButtonsRow}>
                    <TouchableOpacity
                      style={styles.iconPillButton}
                      onPress={pickIcon}
                    >
                      <Feather
                        name="edit-2"
                        size={11}
                        color={colors.textMuted}
                      />
                      <Text style={styles.iconPillButtonText}>
                        {icon ? "Cambiar imagen" : "Subir imagen"}
                      </Text>
                    </TouchableOpacity>
                    {icon ? (
                      <TouchableOpacity onPress={removeIcon}>
                        <Text style={styles.removeIconText}>Quitar</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {iconError ? (
                    <View style={styles.fieldErrorRow}>
                      <Feather
                        name="alert-circle"
                        size={13}
                        color={colors.danger}
                      />
                      <Text style={styles.fieldErrorText}>{iconError}</Text>
                    </View>
                  ) : null}

                  <Text style={styles.iconHint}>
                    PNG, JPG o WEBP · Máx. 20 MB
                  </Text>
                </View>

                <View style={styles.field}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel}>
                      NOMBRE DEL SERVIDOR{" "}
                      <Text style={{ color: colors.danger }}>*</Text>
                    </Text>
                    <Text
                      style={[
                        styles.fieldCounter,
                        nameLength > MAX_NAME ? { color: colors.danger } : null,
                      ]}
                    >
                      {nameLength}/{MAX_NAME}
                    </Text>
                  </View>
                  <View
                    style={[styles.input, nameError ? styles.inputError : null]}
                  >
                    <TextInput
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        setNameError("");
                        setGlobalError("");
                      }}
                      placeholder="Mi servidor épico"
                      placeholderTextColor={colors.textSubtle}
                      maxLength={110}
                      autoFocus
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
                    title="Crear servidor"
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    isLoading={isSubmitting}
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
    maxWidth: 460,
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
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: "center",
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
    marginBottom: 20,
  },
  errorBannerText: {
    flex: 1,
    color: colors.danger,
    fontSize: 13,
  },
  iconPickerWrap: {
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  iconButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconPillButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  iconPillButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  removeIconText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.danger,
  },
  iconHint: {
    fontSize: 11,
    color: colors.textSubtle,
    textAlign: "center",
  },
  field: {
    marginBottom: 4,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: colors.textSubtle,
  },
  fieldCounter: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 14,
    minHeight: 48,
    justifyContent: "center",
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputText: {
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
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  successWrap: {
    alignItems: "center",
    gap: 24,
  },
  previewCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgCard,
    overflow: "hidden",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  previewName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  previewChannels: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  previewChannelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  previewChannelName: {
    fontSize: 13,
    color: colors.textMuted,
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
