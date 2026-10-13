import {
  ATTACHMENT_UPLOAD_FAILED,
  attachmentUploadQuery,
  type AttachmentTarget,
  type MessageAttachment,
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

interface RawResponse {
  status: number;
  body: string;
}

async function post(
  file: FileToUpload,
  target: AttachmentTarget,
  token: string | null,
): Promise<RawResponse> {
  const bytes = await (await fetch(file.uri)).blob();
  const response = await fetch(
    `${env.apiUrl}/v1/attachments?${attachmentUploadQuery(target, file.name)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: bytes,
    },
  );
  return { status: response.status, body: await response.text() };
}

/** Sube los bytes del archivo al back: `POST /v1/attachments` (cuerpo binario). */
export async function uploadAttachment(
  file: FileToUpload,
  target: AttachmentTarget,
): Promise<UploadAttachmentResult> {
  let response: RawResponse;
  try {
    response = await post(file, target, await getToken());
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) response = await post(file, target, newToken);
    }
  } catch (err) {
    if (__DEV__) {
      console.error("uploadAttachment: request failed", file.uri, err);
    }
    return { ok: false, message: ATTACHMENT_UPLOAD_FAILED };
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
