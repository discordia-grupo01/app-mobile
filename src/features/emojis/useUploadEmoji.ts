import {
  EMOJI_IMAGE_REQUIRED,
  normalizeEmojiName,
  type ServerEmoji,
  validateEmojiImage,
  validateEmojiName,
} from "@discordia/client-shared";
import { useCallback, useState } from "react";

import type { PickedLibraryImage } from "../../lib/pickImageFromLibrary";
import { uploadServerEmoji } from "./api";

export interface EmojiFieldErrors {
  name?: string;
  image?: string;
  form?: string;
}

export function useUploadEmoji(serverId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<EmojiFieldErrors>({});

  const clearErrors = useCallback(() => setErrors({}), []);

  const upload = useCallback(
    async (
      name: string,
      image: PickedLibraryImage | null,
    ): Promise<ServerEmoji | null> => {
      if (!image) {
        setErrors({ image: EMOJI_IMAGE_REQUIRED });
        return null;
      }

      const imageError = validateEmojiImage({
        mimeType: image.mimeType,
        sizeBytes: image.asset.fileSize ?? 0,
      });
      const nameError = validateEmojiName(name);

      if (imageError || nameError) {
        setErrors({
          ...(imageError ? { image: imageError } : {}),
          ...(nameError ? { name: nameError } : {}),
        });
        return null;
      }

      setErrors({});
      setIsUploading(true);

      const result = await uploadServerEmoji(serverId, {
        name: normalizeEmojiName(name),
        uri: image.asset.uri,
        mimeType: image.mimeType,
        fileName: image.asset.fileName ?? undefined,
      });

      setIsUploading(false);

      if (!result.ok) {
        setErrors({ [result.field ?? "form"]: result.message });
        return null;
      }

      return result.emoji;
    },
    [serverId],
  );

  return { upload, isUploading, errors, clearErrors };
}
