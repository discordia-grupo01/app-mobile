import {
  EMOJI_NAME_MAX,
  EMOJI_UPLOAD_COPY,
  emojiFileDetail,
  emojiLabel,
  formatFileSize,
  isAnimatedEmojiType,
  suggestEmojiName,
  type ServerEmoji,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
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

import { Button } from "../../../components/ui/Button";
import { FieldError } from "../../../components/ui/FieldError";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { cn } from "../../../lib/cn";
import {
  pickImageFromLibrary,
  type PickedLibraryImage,
} from "../../../lib/pickImageFromLibrary";
import { useThemeColors } from "../../../theme/theme-context";
import { useUploadEmoji } from "../useUploadEmoji";

interface UploadEmojiSheetProps {
  visible: boolean;
  serverId: string;
  onClose: () => void;
  onUploaded: (emoji: ServerEmoji) => void;
}

export function UploadEmojiSheet({
  visible,
  serverId,
  onClose,
  onUploaded,
}: UploadEmojiSheetProps) {
  const colors = useThemeColors();
  const [image, setImage] = useState<PickedLibraryImage | null>(null);
  const [name, setName] = useState("");
  const { upload, isUploading, errors, clearErrors } = useUploadEmoji(serverId);

  async function handlePickImage() {
    clearErrors();
    const picked = await pickImageFromLibrary("subir un emoji");
    if (!picked) return;
    setImage(picked);
    if (!name && picked.asset.fileName) {
      setName(suggestEmojiName(picked.asset.fileName));
    }
  }

  async function handleSubmit() {
    const emoji = await upload(name, image);
    if (emoji) {
      handleClose();
      onUploaded(emoji);
    }
  }

  function handleClose() {
    if (isUploading) return;
    setImage(null);
    setName("");
    clearErrors();
    onClose();
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <View className="max-h-[85%] rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong bg-surface-modal px-4.5 pt-2.5 pb-7">
          <View className="mb-4 h-1 w-9 self-center rounded-xs bg-line-strong" />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-4.5">
              <View>
                <Text className="font-display text-[19px] font-bold text-content">
                  {EMOJI_UPLOAD_COPY.title}
                </Text>
                <Text className="mt-1 text-[13px] leading-5 text-content-muted">
                  {EMOJI_UPLOAD_COPY.description}
                </Text>
              </View>

              {errors.form ? <FormErrorBanner message={errors.form} /> : null}

              {/* Imagen */}
              <View>
                <Text className="mb-1.5 text-[12px] font-bold uppercase tracking-wider text-content-subtle">
                  {EMOJI_UPLOAD_COPY.imageLabel}
                </Text>

                {image === null ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handlePickImage}
                    className={cn(
                      "items-center justify-center gap-2 rounded-xl border border-dashed bg-surface-input px-4 py-5",
                      errors.image ? "border-danger" : "border-line",
                    )}
                  >
                    <Feather name="image" size={24} color={colors.textMuted} />
                    <Text className="text-[14px] font-medium text-content-muted">
                      {EMOJI_UPLOAD_COPY.pickImage}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    className={cn(
                      "flex-row items-center gap-3 rounded-xl border bg-surface-input p-3",
                      errors.image ? "border-danger" : "border-line",
                    )}
                  >
                    <Image
                      source={{ uri: image.asset.uri }}
                      style={{ width: 44, height: 44 }}
                      contentFit="contain"
                    />
                    <View className="min-w-0 flex-1">
                      <Text
                        className="text-[14px] font-semibold text-content"
                        numberOfLines={1}
                      >
                        {image.asset.fileName || "emoji"}
                      </Text>
                      <Text
                        className="text-[12px] text-content-subtle"
                        numberOfLines={1}
                      >
                        {emojiFileDetail(
                          formatFileSize(image.asset.fileSize ?? 0),
                          image.mimeType,
                          isAnimatedEmojiType(image.mimeType),
                        )}
                      </Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handlePickImage}
                      className="rounded-lg border border-line bg-surface-raised px-3 py-1.5"
                    >
                      <Text className="text-[12px] font-medium text-content">
                        {EMOJI_UPLOAD_COPY.changeImage}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {errors.image ? <FieldError message={errors.image} /> : null}
              </View>

              {/* Nombre */}
              <View>
                <Text className="mb-1.5 text-[12px] font-bold uppercase tracking-wider text-content-subtle">
                  {EMOJI_UPLOAD_COPY.nameLabel}
                </Text>
                <View
                  className={cn(
                    "flex-row items-center rounded-xl border bg-surface-input px-3.5 py-2.5",
                    errors.name ? "border-danger" : "border-line",
                  )}
                >
                  <Text className="text-[15px] font-semibold text-content-subtle">
                    :
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="nombre_del_emoji"
                    placeholderTextColor={colors.textSubtle}
                    maxLength={EMOJI_NAME_MAX}
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 px-1 text-[15px] font-semibold text-content"
                  />
                  <Text className="text-[15px] font-semibold text-content-subtle">
                    :
                  </Text>
                </View>
                <Text className="mt-1 text-[11px] text-content-subtle">
                  {EMOJI_UPLOAD_COPY.nameHelp}
                </Text>
                {errors.name ? <FieldError message={errors.name} /> : null}
              </View>

              {/* Vista previa */}
              {image && name ? (
                <View>
                  <Text className="mb-1.5 text-[12px] font-bold uppercase tracking-wider text-content-subtle">
                    {EMOJI_UPLOAD_COPY.previewLabel}
                  </Text>
                  <View className="flex-row items-center gap-2 rounded-xl border border-line bg-surface-input px-3.5 py-2.5">
                    <Image
                      source={{ uri: image.asset.uri }}
                      style={{ width: 22, height: 22 }}
                      contentFit="contain"
                    />
                    <Text className="text-[13px] font-medium text-content">
                      {emojiLabel(name)}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Botones */}
              <View className="mt-2 gap-2.5">
                <Button
                  title={EMOJI_UPLOAD_COPY.submit}
                  onPress={handleSubmit}
                  isLoading={isUploading}
                  fullWidth
                />
                <Button
                  title={EMOJI_UPLOAD_COPY.cancel}
                  variant="secondary"
                  onPress={handleClose}
                  disabled={isUploading}
                  fullWidth
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
