import type {
  AttachmentTarget,
  MessageAttachment,
} from "@discordia/client-shared";
import { useCallback, useRef } from "react";

import { type FileToUpload, uploadAttachment } from "./api";

export type UploadAllResult =
  { ok: true; ids: string[] } | { ok: false; message: string };

/**
 * Sube los archivos pendientes de un mensaje, de a uno. Recuerda los que ya
 * subio (por `uri`): si el envio falla despues de subir, el reintento reusa esos
 * ids en vez de subirlos otra vez (cada subida cuenta contra el tope de
 * pendientes del back).
 */
export function useAttachmentUploads() {
  const uploaded = useRef(new Map<string, MessageAttachment>());

  const uploadAll = useCallback(
    async (
      files: readonly FileToUpload[],
      target: AttachmentTarget,
    ): Promise<UploadAllResult> => {
      const ids: string[] = [];
      for (const file of files) {
        let attachment = uploaded.current.get(file.uri);
        if (!attachment) {
          const result = await uploadAttachment(file, target);
          if (!result.ok) return result;
          attachment = result.attachment;
          uploaded.current.set(file.uri, attachment);
        }
        ids.push(attachment.id);
      }
      return { ok: true, ids };
    },
    [],
  );

  const forget = useCallback(() => uploaded.current.clear(), []);

  return { uploadAll, forget };
}
