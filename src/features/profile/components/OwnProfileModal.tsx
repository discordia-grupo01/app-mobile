import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
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

import { Button } from "../../../components/ui/Button";
import { colors } from "../../../theme/colors";
import { env } from "../../../lib/env";
import { useAuth } from "../../auth/auth-context";
import { ServerAvatar } from "../../servers/components/ServerAvatar";
import {
  ACTIVITY_STATUS_COLOR,
  ActivityStatusPicker,
  type ActivityStatusMode,
} from "./ActivityStatusPicker";
import { CustomStatusEditor } from "./CustomStatusEditor";
import { MemberSince } from "./MemberSince";
import { ProfileBanner } from "./ProfileBanner";
import { clearStatus, updateOwnProfile, updateStatus } from "../service";
import type { PickedProfileImage } from "../types";

const MAX_NAME = 100;
const MAX_DESCRIPTION = 500;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif"];
const MAX_FILE_MB = 5;

type EditingField = "name" | "description" | null;

interface OwnProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function OwnProfileModal({ visible, onClose }: OwnProfileModalProps) {
  const { user, updateUser } = useAuth();

  const [wasVisible, setWasVisible] = useState(visible);
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");
  const [descriptionDraft, setDescriptionDraft] = useState(
    user?.description ?? "",
  );
  const [nameError, setNameError] = useState("");
  const [imageError, setImageError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [activityMode, setActivityMode] = useState<ActivityStatusMode>("auto");

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible && user) {
      setEditingField(null);
      setNameDraft(user.name);
      setDescriptionDraft(user.description);
      setNameError("");
      setImageError("");
      setGlobalError("");
      setIsSubmitting(false);
      setIsUploadingAvatar(false);
      setImagePreview(null);
      setActivityMode("auto");
    }
  }

  if (!user) return null;

  const avatarSrc =
    imagePreview ??
    (user.avatar_url ? `${env.apiUrl}${user.avatar_url}` : null);

  async function submitProfile(overrides: {
    name?: string;
    description?: string;
    image?: PickedProfileImage;
  }): Promise<boolean> {
    if (!user) return false;
    setGlobalError("");
    const result = await updateOwnProfile({
      name: overrides.name ?? user.name,
      description: overrides.description ?? user.description,
      image: overrides.image,
    });

    if (!result.ok) {
      setGlobalError(result.message);
      return false;
    }

    updateUser(result.user);
    return true;
  }

  async function saveCustomStatus(text: string): Promise<boolean> {
    setGlobalError("");
    const result = await updateStatus(text);
    if (!result.ok) {
      setGlobalError(result.message);
      return false;
    }
    updateUser(result.user);
    return true;
  }

  async function clearCustomStatus(): Promise<boolean> {
    if (!user) return false;
    setGlobalError("");
    const result = await clearStatus(user);
    if (!result.ok) {
      setGlobalError(result.message);
      return false;
    }
    updateUser(result.user);
    return true;
  }

  function startEditingName() {
    setNameDraft(user!.name);
    setNameError("");
    setGlobalError("");
    setEditingField("name");
  }

  function startEditingDescription() {
    setDescriptionDraft(user!.description);
    setGlobalError("");
    setEditingField("description");
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      50,
    );
  }

  function cancelEditing() {
    setEditingField(null);
    setNameError("");
    setGlobalError("");
  }

  async function saveName() {
    setNameError("");
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameError("Ingresá tu nombre.");
      return;
    }
    setIsSubmitting(true);
    const ok = await submitProfile({ name: trimmed });
    setIsSubmitting(false);
    if (ok) setEditingField(null);
  }

  async function saveDescription() {
    setIsSubmitting(true);
    const ok = await submitProfile({ description: descriptionDraft });
    setIsSubmitting(false);
    if (ok) setEditingField(null);
  }

  async function pickAvatar() {
    setImageError("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tus imágenes para cambiar tu foto de perfil.",
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
      setImageError("La imagen debe ser JPEG, PNG o GIF.");
      return;
    }
    if (asset.fileSize && asset.fileSize > MAX_FILE_MB * 1024 * 1024) {
      setImageError(`El archivo no puede pesar más de ${MAX_FILE_MB} MB.`);
      return;
    }

    setImagePreview(asset.uri);
    setIsUploadingAvatar(true);
    await submitProfile({
      image: {
        uri: asset.uri,
        type,
        name: asset.fileName ?? asset.uri.split("/").pop() ?? "avatar.jpg",
      },
    });
    setIsUploadingAvatar(false);
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
          <ProfileBanner onClose={onClose} />

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.avatarWrap}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={pickAvatar}
                style={styles.avatarBox}
                accessibilityLabel="Cambiar foto de perfil"
              >
                <View style={styles.avatarRingBg} />
                <View style={styles.avatarInner}>
                  <ServerAvatar
                    name={user.name}
                    uri={avatarSrc}
                    size={72}
                    borderRadius={36}
                  />
                  {isUploadingAvatar ? (
                    <View style={styles.avatarUploadOverlay}>
                      <ActivityIndicator size="small" color="#ffffff" />
                    </View>
                  ) : null}
                </View>
                <View
                  style={[
                    styles.avatarBadge,
                    { backgroundColor: ACTIVITY_STATUS_COLOR[activityMode] },
                  ]}
                />
              </TouchableOpacity>
              {imageError ? (
                <Text style={styles.imageErrorText}>{imageError}</Text>
              ) : null}
            </View>

            {globalError ? (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorBannerText}>{globalError}</Text>
              </View>
            ) : null}

            <View style={styles.section}>
              {editingField === "name" ? (
                <View style={styles.inlineEditRow}>
                  <TextInput
                    value={nameDraft}
                    onChangeText={(text) => {
                      setNameDraft(text);
                      setNameError("");
                    }}
                    onSubmitEditing={saveName}
                    maxLength={MAX_NAME}
                    autoFocus
                    style={styles.nameInput}
                  />
                  <TouchableOpacity
                    onPress={saveName}
                    disabled={isSubmitting}
                    accessibilityLabel="Guardar nombre"
                    style={[styles.inlineIconButton, styles.inlineIconSuccess]}
                  >
                    <Feather name="check" size={14} color={colors.success} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={cancelEditing}
                    disabled={isSubmitting}
                    accessibilityLabel="Cancelar edición del nombre"
                    style={[styles.inlineIconButton, styles.inlineIconDanger]}
                  >
                    <Feather name="x" size={14} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <TouchableOpacity
                    onPress={startEditingName}
                    accessibilityLabel="Editar nombre"
                    style={styles.pencilButton}
                  >
                    <Feather
                      name="edit-2"
                      size={12}
                      color={colors.textSubtle}
                    />
                  </TouchableOpacity>
                </View>
              )}
              {editingField === "name" && nameError ? (
                <Text style={styles.fieldErrorText}>{nameError}</Text>
              ) : null}
              <Text style={styles.email}>{user.email}</Text>
            </View>

            <View style={styles.section}>
              <ActivityStatusPicker
                mode={activityMode}
                onChange={setActivityMode}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <CustomStatusEditor
                statusText={user.status_text}
                onSave={saveCustomStatus}
                onClear={clearCustomStatus}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Text style={styles.label}>DESCRIPCIÓN</Text>
                {editingField !== "description" ? (
                  <TouchableOpacity
                    onPress={startEditingDescription}
                    accessibilityLabel="Editar descripción"
                    style={styles.editDescriptionButton}
                  >
                    <Feather
                      name="edit-2"
                      size={10}
                      color={colors.textSubtle}
                    />
                    <Text style={styles.editDescriptionButtonText}>Editar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {editingField === "description" ? (
                <View style={styles.editWrap}>
                  <View style={styles.counterRow}>
                    <Text style={styles.counter}>
                      {descriptionDraft.length}/{MAX_DESCRIPTION}
                    </Text>
                  </View>
                  <TextInput
                    value={descriptionDraft}
                    onChangeText={(text) =>
                      setDescriptionDraft(text.slice(0, MAX_DESCRIPTION))
                    }
                    multiline
                    numberOfLines={3}
                    autoFocus
                    placeholder="Contá algo sobre vos..."
                    placeholderTextColor={colors.textSubtle}
                    style={styles.textarea}
                  />
                  <View style={styles.editActions}>
                    <Button
                      title="Cancelar"
                      variant="secondary"
                      onPress={cancelEditing}
                      disabled={isSubmitting}
                      fullWidth={false}
                      style={styles.actionButton}
                    />
                    <Button
                      title="Guardar"
                      onPress={saveDescription}
                      isLoading={isSubmitting}
                      fullWidth={false}
                      style={styles.actionButton}
                    />
                  </View>
                </View>
              ) : (
                <Text style={styles.description}>
                  {user.description || "Todavía no agregaste una descripción."}
                </Text>
              )}
            </View>

            <MemberSince isoDate={user.created_at} />
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
    maxWidth: 400,
    maxHeight: "90%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgModal,
    overflow: "hidden",
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 26,
  },
  avatarWrap: {
    marginTop: -28,
    marginBottom: 14,
    alignSelf: "flex-start",
  },
  avatarBox: {
    width: 80,
    height: 80,
  },
  avatarRingBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgModal,
  },
  avatarInner: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 72,
    height: 72,
  },
  avatarBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: colors.bgModal,
  },
  avatarUploadOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  imageErrorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
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
  section: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    flexShrink: 1,
  },
  pencilButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  editDescriptionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  editDescriptionButtonText: {
    fontSize: 10,
    color: colors.textSubtle,
  },
  inlineEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  inlineIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineIconSuccess: {
    backgroundColor: "rgba(56,161,105,0.15)",
  },
  inlineIconDanger: {
    backgroundColor: "rgba(224,82,82,0.15)",
  },
  fieldErrorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  email: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textSubtle,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  editWrap: {
    gap: 8,
  },
  counterRow: {
    alignItems: "flex-end",
  },
  counter: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  textarea: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 14,
    paddingVertical: 10,
    height: 90,
    color: colors.text,
    fontSize: 13,
    textAlignVertical: "top",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
});
