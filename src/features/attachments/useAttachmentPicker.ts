import type { BoostLevel } from "@discordia/client-shared";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useState } from "react";

import {
  type AttachmentLimitOffer,
  attachmentPickerTypes,
  selectAttachments,
} from "./selectAttachments";

// TODO: mover a client-shared (messages/chat) en la proxima release.
const ATTACHMENT_PICKER_FAILED =
  "No se pudo abrir el selector de archivos. Intentá de nuevo.";

export type PickedAttachment = DocumentPicker.DocumentPickerAsset;

type UseAttachmentPickerOptions = {
  premium: boolean;
  /** Nivel de boosts del servidor; sin él es un mensaje directo. */
  serverLevel?: BoostLevel;
  onError: (
    message: string | undefined,
    offer?: AttachmentLimitOffer | null,
  ) => void;
};

export function useAttachmentPicker({
  premium,
  serverLevel,
  onError,
}: UseAttachmentPickerOptions) {
  const [attachments, setAttachments] = useState<PickedAttachment[]>([]);

  const pick = useCallback(async () => {
    let result: DocumentPicker.DocumentPickerResult;
    try {
      result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: attachmentPickerTypes({ premium }),
        copyToCacheDirectory: true,
        base64: false,
      });
    } catch (err) {
      console.warn("pickAttachments: getDocumentAsync failed", err);
      onError(ATTACHMENT_PICKER_FAILED);
      return;
    }
    if (result.canceled) return;

    const { accepted, error, offer } = selectAttachments(
      attachments,
      result.assets,
      { premium, serverLevel },
    );
    onError(error, offer);
    if (accepted.length > 0) setAttachments((prev) => [...prev, ...accepted]);
  }, [attachments, premium, serverLevel, onError]);

  const remove = useCallback((uri: string) => {
    setAttachments((prev) => prev.filter((file) => file.uri !== uri));
  }, []);

  const clear = useCallback(() => setAttachments([]), []);

  return { attachments, pick, remove, clear };
}
