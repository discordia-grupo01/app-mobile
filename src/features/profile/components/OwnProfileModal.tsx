import {
  displayedStatus,
  type ActivityStatusChoice,
  CANCEL_NAME_EDIT_LABEL,
  CHANGE_AVATAR_LABEL,
  DESCRIPTION_PLACEHOLDER,
  MAX_DESCRIPTION,
  MAX_NAME,
  NO_DESCRIPTION_YET,
  resolveImageUrl,
  validateAvatar,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState, type ComponentRef } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "../../../components/ui/Button";
import { cn } from "../../../lib/cn";
import { env } from "../../../lib/env";
import { useThemeColors } from "../../../theme/theme-context";
import { useAuth } from "../../auth/auth-context";
import { Avatar } from "../../../components/ui/Avatar";
import { MemberRoleBadges } from "../../roles/components/MemberRoleBadges";
import { activityStatusColor } from "./activityStatusColor";
import { ActivityStatusRow } from "./ActivityStatusRow";
import { CustomStatusEditor } from "./CustomStatusEditor";
import { MemberSince } from "./MemberSince";
import { ProfileBanner } from "./ProfileBanner";
import { clearStatus, updateOwnProfile, updateStatus } from "../service";
import type { PickedProfileImage } from "../types";
import { ModalShell } from "../../../components/ui/ModalShell";

const MAX_AVATAR_DIMENSION = 1024;
const REMOVE_AVATAR_LABEL = "Eliminar foto de perfil";

type EditingField = "name" | "description" | null;

interface OwnProfileModalProps {
  visible: boolean;
  serverId?: string | null;
  onClose: () => void;
}

export function OwnProfileModal({
  visible,
  serverId,
  onClose,
}: OwnProfileModalProps) {
  const colors = useThemeColors();
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
  const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const [activityStatus, setActivityStatus] =
    useState<ActivityStatusChoice>("online");

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
      setActivityStatus("online");
    }
  }

  if (!user) return null;

  const avatarSrc =
    imagePreview ?? resolveImageUrl(user.avatar_url, env.apiUrl);

  async function submitProfile(overrides: {
    name?: string;
    description?: string;
    image?: PickedProfileImage;
    removeImage?: boolean;
  }): Promise<boolean> {
    if (!user) return false;
    setGlobalError("");
    const result = await updateOwnProfile({
      name: overrides.name ?? user.name,
      description: overrides.description ?? user.description,
      image: overrides.image,
      removeImage: overrides.removeImage,
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

  function removeAvatar() {
    const currentUser = user;
    if (!currentUser || (!currentUser.avatar_url && !imagePreview)) return;
    Alert.alert(
      REMOVE_AVATAR_LABEL,
      "La foto se eliminará y se mostrará tu avatar con inicial.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setImageError("");
            setIsUploadingAvatar(true);
            const ok = await submitProfile({ removeImage: true });
            setIsUploadingAvatar(false);
            if (ok) setImagePreview(null);
          },
        },
      ],
    );
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
    const avatarError = validateAvatar({
      mimeType: type,
      sizeBytes: asset.fileSize ?? 0,
    });
    if (avatarError) {
      setImageError(avatarError);
      return;
    }

    let uri = asset.uri;
    let uploadType = type;

    if (
      type !== "image/gif" &&
      Math.max(asset.width, asset.height) > MAX_AVATAR_DIMENSION
    ) {
      try {
        const resized = await ImageManipulator.manipulateAsync(
          asset.uri,
          [
            {
              resize:
                asset.width >= asset.height
                  ? { width: MAX_AVATAR_DIMENSION }
                  : { height: MAX_AVATAR_DIMENSION },
            },
          ],
          {
            compress: 0.8,
            format:
              type === "image/png"
                ? ImageManipulator.SaveFormat.PNG
                : ImageManipulator.SaveFormat.JPEG,
          },
        );
        uri = resized.uri;
        uploadType = type === "image/png" ? "image/png" : "image/jpeg";
      } catch {
        setImageError(
          "No pudimos procesar la imagen. Probá con otra o recortala primero.",
        );
        return;
      }
    }

    setImagePreview(uri);
    setIsUploadingAvatar(true);
    await submitProfile({
      image: {
        uri,
        type: uploadType,
        name: `avatar.${uploadType === "image/png" ? "png" : uploadType === "image/gif" ? "gif" : "jpg"}`,
      },
    });
    setIsUploadingAvatar(false);
  }

  return (
    <ModalShell visible={visible} onClose={onClose} className="max-w-100">
      <ProfileBanner onClose={onClose} />

      <ScrollView
        ref={scrollViewRef}
        contentContainerClassName="px-5.5 pt-17 pb-6.5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {globalError ? (
          <View className="flex-row items-start gap-2.5 rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3.5 py-3 mb-4">
            <Feather name="alert-circle" size={16} color={colors.danger} />
            <Text className="flex-1 text-danger text-[13px]">
              {globalError}
            </Text>
          </View>
        ) : null}

        {imageError ? (
          <Text className="text-danger text-[12px] mb-3">{imageError}</Text>
        ) : null}

        <View className="mb-4">
          {editingField === "name" ? (
            <View className="flex-row items-center gap-2">
              <TextInput
                value={nameDraft}
                onChangeText={(text) => {
                  setNameDraft(text);
                  setNameError("");
                }}
                onSubmitEditing={saveName}
                maxLength={MAX_NAME}
                autoFocus
                className="flex-1 rounded-[10px] border border-accent bg-surface-input px-3 py-2 text-[16px] font-bold text-content"
              />
              <TouchableOpacity
                onPress={saveName}
                disabled={isSubmitting}
                accessibilityLabel="Guardar nombre"
                className={cn(
                  "w-7.5 h-7.5 rounded-[15px] items-center justify-center",
                  "bg-[rgba(56,161,105,0.15)]",
                )}
              >
                <Feather name="check" size={14} color={colors.success} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={cancelEditing}
                disabled={isSubmitting}
                accessibilityLabel={CANCEL_NAME_EDIT_LABEL}
                className={cn(
                  "w-7.5 h-7.5 rounded-[15px] items-center justify-center",
                  "bg-[rgba(224,82,82,0.15)]",
                )}
              >
                <Feather name="x" size={14} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center gap-1.5">
              <Text
                className="text-[18px] font-bold text-content shrink"
                numberOfLines={1}
              >
                {user.name}
              </Text>
              <TouchableOpacity
                onPress={startEditingName}
                accessibilityLabel="Editar nombre"
                className="w-6 h-6 items-center justify-center"
              >
                <Feather name="edit-2" size={12} color={colors.textSubtle} />
              </TouchableOpacity>
            </View>
          )}
          {editingField === "name" && nameError ? (
            <Text className="text-danger text-[12px] mt-1">{nameError}</Text>
          ) : null}
          <Text className="text-[12px] text-content-subtle mt-1">
            {user.email}
          </Text>
        </View>

        <View className="mb-4">
          <ActivityStatusRow
            status={activityStatus}
            onChange={setActivityStatus}
          />
        </View>

        <View className="mb-4">
          <CustomStatusEditor
            statusText={user.status_text}
            onSave={saveCustomStatus}
            onClear={clearCustomStatus}
          />
        </View>

        <View className="h-px bg-line mb-4" />

        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-[11px] font-bold tracking-[1.2px] text-content-subtle">
              SOBRE MÍ
            </Text>
            {editingField !== "description" ? (
              <TouchableOpacity
                onPress={startEditingDescription}
                accessibilityLabel="Editar descripción"
                className="flex-row items-center gap-1 rounded-md border border-line bg-surface-input px-[7px] py-[3px]"
              >
                <Feather name="edit-2" size={10} color={colors.textSubtle} />
                <Text className="text-[10px] text-content-subtle">Editar</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {editingField === "description" ? (
            <View className="gap-2">
              <View className="items-end">
                <Text className="text-[11px] text-content-subtle">
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
                placeholder={DESCRIPTION_PLACEHOLDER}
                placeholderTextColor={colors.textSubtle}
                className="rounded-xl border border-accent bg-surface-input px-3.5 py-2.5 h-22.5 text-content text-[13px]"
                style={styles.textarea}
              />
              <View className="flex-row gap-3">
                <Button
                  title="Cancelar"
                  variant="secondary"
                  onPress={cancelEditing}
                  disabled={isSubmitting}
                  fullWidth={false}
                  className="flex-1 min-h-9 py-2 px-3.5"
                />
                <Button
                  title="Guardar"
                  onPress={saveDescription}
                  isLoading={isSubmitting}
                  fullWidth={false}
                  className="flex-1 min-h-9 py-2 px-3.5"
                />
              </View>
            </View>
          ) : (
            <Text className="text-[13px] leading-[19px] text-content-muted">
              {user.description || NO_DESCRIPTION_YET}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <MemberSince isoDate={user.created_at} />
        </View>

        {serverId ? (
          <View className="mb-4">
            <MemberRoleBadges
              serverId={serverId}
              userId={user.id}
              canManage={false}
            />
          </View>
        ) : null}
      </ScrollView>

      <View className="absolute top-18 left-5.5 z-10">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={pickAvatar}
          className="w-20 h-20"
          accessibilityLabel={CHANGE_AVATAR_LABEL}
        >
          <View className="absolute top-0 left-0 w-20 h-20 rounded-[40px] bg-surface-modal" />
          <View className="absolute top-1 left-1 w-18 h-18">
            <Avatar
              name={user.name}
              uri={avatarSrc}
              size={72}
              borderRadius={36}
            />
            {isUploadingAvatar ? (
              <View
                className="rounded-[36px] items-center justify-center bg-[rgba(0,0,0,0.45)]"
                style={styles.avatarUploadOverlay}
              >
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            ) : null}
          </View>
          <View
            className="absolute right-0.5 bottom-0.5 w-4.5 h-4.5 rounded-[9px] border-[3px] border-surface-modal"
            style={{
              backgroundColor: activityStatusColor(
                colors,
                displayedStatus(activityStatus),
              ),
            }}
          />
        </TouchableOpacity>
      </View>

      {user.avatar_url || imagePreview ? (
        <View className="absolute top-28 right-5.5 z-10">
          <TouchableOpacity
            onPress={removeAvatar}
            disabled={isUploadingAvatar}
            activeOpacity={0.7}
            accessibilityLabel={REMOVE_AVATAR_LABEL}
            className="flex-row items-center gap-1.5 rounded-lg border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-2.5 py-1.5"
          >
            <Feather name="trash-2" size={14} color={colors.danger} />
            <Text className="text-danger text-[12px] font-semibold">
              Eliminar foto
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  avatarUploadOverlay: {
    ...StyleSheet.absoluteFill,
  },
  textarea: {
    textAlignVertical: "top",
  },
});
