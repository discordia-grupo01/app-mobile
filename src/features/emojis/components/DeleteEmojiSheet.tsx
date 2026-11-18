import {
  EMOJI_DELETE_COPY,
  emojiDeleteTitle,
  type ServerEmoji,
} from "@discordia/client-shared";
import { Image } from "expo-image";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { deleteServerEmoji, resolveEmojiImageUrl } from "../api";

interface DeleteEmojiSheetProps {
  emoji: ServerEmoji | null;
  serverId: string;
  onClose: () => void;
  onDeleted: (emojiId: string) => void;
}

export function DeleteEmojiSheet({
  emoji,
  serverId,
  onClose,
  onDeleted,
}: DeleteEmojiSheetProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleDelete() {
    if (!emoji) return;
    setIsDeleting(true);
    setError(undefined);

    const result = await deleteServerEmoji(serverId, emoji.id);
    setIsDeleting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onDeleted(emoji.id);
    onClose();
  }

  function handleClose() {
    if (isDeleting) return;
    setError(undefined);
    onClose();
  }

  return (
    <Modal
      transparent
      visible={emoji !== null}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <View className="rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong bg-surface-modal px-4.5 pt-2.5 pb-7">
          <View className="mb-4 h-1 w-9 self-center rounded-xs bg-line-strong" />

          {emoji ? (
            <View className="gap-4.5">
              <View className="items-center">
                <View className="h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft">
                  <Image
                    source={{ uri: resolveEmojiImageUrl(emoji.image_url) }}
                    style={{ width: 40, height: 40 }}
                    contentFit="contain"
                  />
                </View>
                <Text className="mt-3 text-center font-display text-[19px] font-bold text-content">
                  {emojiDeleteTitle(emoji.name)}
                </Text>
                <Text className="mt-1 text-center text-[13px] leading-5 text-content-muted">
                  {EMOJI_DELETE_COPY.detail}
                </Text>
              </View>

              {error ? <FormErrorBanner message={error} /> : null}

              <View className="mt-1 gap-2.5">
                <Button
                  title={EMOJI_DELETE_COPY.confirm}
                  variant="danger"
                  onPress={handleDelete}
                  isLoading={isDeleting}
                  fullWidth
                />
                <Button
                  title={EMOJI_DELETE_COPY.cancel}
                  variant="secondary"
                  onPress={handleClose}
                  disabled={isDeleting}
                  fullWidth
                />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
