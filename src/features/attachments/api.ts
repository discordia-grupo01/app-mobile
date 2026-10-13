import * as FileSystem from "expo-file-system/legacy";

import {
  ATTACHMENT_UPLOAD_FAILED,
  attachmentUploadQuery,
  type AttachmentTarget,
  type MessageAttachment,
  NETWORK_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  toApiResult,
  toUploadAttachmentResult,
  type UploadAttachmentResult,
} from "@discordia/client-shared";

import { refreshAccessToken } from "../../lib/api-client";
import { env } from "../../lib/env";
import { getToken } from "../../lib/storage";

export interface FileToUpload {
  uri: string;
  name: string;
}

async function post(
  file: FileToUpload,
  target: AttachmentTarget,
  token: string | null,
) {
  return FileSystem.uploadAsync(
    `${env.apiUrl}/v1/attachments?${attachmentUploadQuery(target, file.name)}`,
    file.uri,
    {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        "Content-Type": "application/octet-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
}

/** Sube los bytes del archivo al back: `POST /v1/attachments` (cuerpo binario). */
export async function uploadAttachment(
  file: FileToUpload,
  target: AttachmentTarget,
): Promise<UploadAttachmentResult> {
  let response: FileSystem.FileSystemUploadResult;
  try {
    response = await post(file, target, await getToken());
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) response = await post(file, target, newToken);
    }
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }

  if (response.status === 401) {
    return { ok: false, message: SESSION_EXPIRED_MESSAGE };
  }

  let body: unknown = null;
  try {
    body = response.body ? JSON.parse(response.body) : null;
  } catch {}

  const result = toUploadAttachmentResult(
    toApiResult<MessageAttachment>(response.status, body),
  );
  return result.ok || result.message
    ? result
    : { ok: false, message: ATTACHMENT_UPLOAD_FAILED };
}
