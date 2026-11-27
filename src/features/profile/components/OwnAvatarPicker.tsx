import {
  CHANGE_AVATAR_LABEL,
  REMOVE_AVATAR_LABEL,
  resolveImageUrl,
  type User,
  validateAvatar,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Avatar } from "../../../components/ui/Avatar";
import { env } from "../../../lib/env";
import { pickImageFromLibrary } from "../../../lib/pickImageFromLibrary";
import { useThemeColors } from "../../../theme/theme-context";
import { usePresenceOf } from "../../presence/PresenceContext";
import type { PickedProfileImage } from "../types";
import { ActivityStatusDot } from "./ActivityStatusDot";

const MAX_AVATAR_DIMENSION = 1024;

interface OwnAvatarPickerProps {
  user: User;
  onUpload: (image: PickedProfileImage) => Promise<string | null>;
  onRemove: () => Promise<string | null>;
}

export function OwnAvatarPicker({
  user,
  onUpload,
  onRemove,
}: OwnAvatarPickerProps) {
  const colors = useThemeColors();
  const [imageError, setImageError] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const displayedOwnStatus = usePresenceOf(user.id);

  const avatarSrc =
    imagePreview ?? resolveImageUrl(user.avatar_url, env.apiUrl);
  const hasAvatar = Boolean(avatarSrc);

  function handleAvatarPress() {
    if (hasAvatar) setIsAvatarMenuOpen((open) => !open);
    else pickAvatar();
  }

  function pickNewAvatar() {
    setIsAvatarMenuOpen(false);
    pickAvatar();
  }

  function removeAvatar() {
    setIsAvatarMenuOpen(false);
    if (!hasAvatar) return;
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
            const error = await onRemove();
            setIsUploadingAvatar(false);
            if (error) setImageError(error);
            else setImagePreview(null);
          },
        },
      ],
    );
  }

  async function pickAvatar() {
    setImageError("");
    const picked = await pickImageFromLibrary("cambiar tu foto de perfil");
    if (!picked) return;

    const { asset, mimeType: type } = picked;
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
    const error = await onUpload({
      uri,
      type: uploadType,
      name: `avatar.${uploadType === "image/png" ? "png" : uploadType === "image/gif" ? "gif" : "jpg"}`,
    });
    setIsUploadingAvatar(false);
    if (error) setImageError(error);
  }

  return (
    <>
      {isAvatarMenuOpen ? (
        <Pressable
          accessibilityLabel="Cerrar menú"
          onPress={() => setIsAvatarMenuOpen(false)}
          className="absolute inset-0 z-10"
        />
      ) : null}

      <View className="absolute top-18 left-5.5 z-10">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleAvatarPress}
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
              <View className="absolute inset-0 rounded-[36px] items-center justify-center bg-[rgba(0,0,0,0.45)]">
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            ) : null}
          </View>
          <ActivityStatusDot
            status={displayedOwnStatus}
            size={18}
            ringWidth={3}
            className="absolute right-0.5 bottom-0.5 border-surface-modal"
          />
        </TouchableOpacity>
        {imageError ? (
          <Text className="text-danger text-[12px] mt-1.5">{imageError}</Text>
        ) : null}
        {isAvatarMenuOpen ? (
          <View className="absolute left-0 top-21 z-20 w-56 rounded-xl border border-line bg-surface-modal p-1.5 shadow-xl">
            <TouchableOpacity
              onPress={pickNewAvatar}
              accessibilityRole="menuitem"
              className="flex-row items-center gap-2.5 rounded-lg px-2.5 py-2.5"
            >
              <Feather name="camera" size={16} color={colors.text} />
              <Text className="text-[14px] font-medium text-content">
                {CHANGE_AVATAR_LABEL}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={removeAvatar}
              disabled={isUploadingAvatar}
              accessibilityRole="menuitem"
              className="flex-row items-center gap-2.5 rounded-lg px-2.5 py-2.5"
            >
              <Feather name="trash-2" size={16} color={colors.danger} />
              <Text className="text-[14px] font-medium text-danger">
                {REMOVE_AVATAR_LABEL}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </>
  );
}
