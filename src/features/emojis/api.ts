import {
  deleteEmojiFailureMessage,
  detailsOf,
  emojiUploadErrorFor,
  listEmojisFailureMessage,
  NETWORK_ERROR_MESSAGE,
  normalizeEmojiName,
  resolveImageUrl,
  type CustomEmoji,
  type EmojiUploadErrorField,
  type ServerEmoji,
  type ServerEmojiPage,
} from "@discordia/client-shared";
import { fetch as expoFetch } from "expo/fetch";
import { File } from "expo-file-system";

import { apiFetch, refreshAccessToken } from "../../lib/api-client";
import { env } from "../../lib/env";
import { getToken } from "../../lib/storage";

export interface UploadEmojiParams {
  name: string;
  uri: string;
  mimeType: string;
  fileName?: string;
}

export type ListServerEmojisResult =
  { ok: true; page: ServerEmojiPage } | { ok: false; message: string };

export type UploadServerEmojiResult =
  | { ok: true; emoji: ServerEmoji }
  | { ok: false; field?: EmojiUploadErrorField; message: string };

export type DeleteServerEmojiResult =
  { ok: true } | { ok: false; message: string };

export interface CustomEmojisResponse {
  emojis: CustomEmoji[];
}

export function resolveEmojiImageUrl(
  imageUrl: string | null | undefined,
): string {
  if (!imageUrl) return "";
  return resolveImageUrl(imageUrl, env.apiUrl) ?? "";
}

export async function listServerEmojis(
  serverId: string,
): Promise<ListServerEmojisResult> {
  const result = await apiFetch<ServerEmojiPage>(
    `/v1/servers/${serverId}/emojis`,
    { method: "GET" },
  );
  if (!result.ok) {
    return { ok: false, message: listEmojisFailureMessage(result) };
  }
  return { ok: true, page: result.data };
}

async function performUploadEmoji(
  serverId: string,
  params: UploadEmojiParams,
  token: string | null,
): Promise<{ status: number; rawBody: string }> {
  const authHeaders: Record<string, string> | undefined = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  const formData = new FormData();
  formData.append("name", normalizeEmojiName(params.name));
  const file = new File(params.uri);
  const fileName =
    params.fileName ||
    `${normalizeEmojiName(params.name)}.${params.mimeType.split("/")[1] || "png"}`;
  formData.append("image", file, fileName);

  const res = await expoFetch(`${env.apiUrl}/v1/servers/${serverId}/emojis`, {
    method: "POST",
    headers: authHeaders,
    body: formData,
  });
  return { status: res.status, rawBody: await res.text() };
}

export async function uploadServerEmoji(
  serverId: string,
  params: UploadEmojiParams,
): Promise<UploadServerEmojiResult> {
  let status: number;
  let rawBody: string;

  try {
    const token = await getToken();
    const first = await performUploadEmoji(serverId, params, token);
    status = first.status;
    rawBody = first.rawBody;

    if (status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retry = await performUploadEmoji(serverId, params, newToken);
        status = retry.status;
        rawBody = retry.rawBody;
      }
    }
  } catch (err) {
    if (__DEV__) {
      console.error("uploadServerEmoji: request failed", err);
    }
    return { ok: false, field: "form", message: NETWORK_ERROR_MESSAGE };
  }

  let body: unknown = null;
  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {}

  if (status >= 200 && status < 300) {
    return { ok: true, emoji: body as ServerEmoji };
  }

  const details = detailsOf(body);
  const { field, message } = emojiUploadErrorFor(details, status);
  return { ok: false, field, message };
}

export async function deleteServerEmoji(
  serverId: string,
  emojiId: string,
): Promise<DeleteServerEmojiResult> {
  const result = await apiFetch<void>(
    `/v1/servers/${serverId}/emojis/${emojiId}`,
    { method: "DELETE" },
  );
  if (!result.ok) {
    return { ok: false, message: deleteEmojiFailureMessage(result) };
  }
  return { ok: true };
}

export async function fetchCustomEmojis(
  ids: readonly string[],
): Promise<
  { ok: true; emojis: CustomEmoji[] } | { ok: false; message: string }
> {
  if (ids.length === 0) return { ok: true, emojis: [] };
  const query = encodeURIComponent(ids.join(","));
  const result = await apiFetch<CustomEmojisResponse>(
    `/v1/custom-emojis?ids=${query}`,
    { method: "GET" },
  );
  if (!result.ok) {
    return { ok: false, message: result.message };
  }
  return { ok: true, emojis: result.data.emojis };
}
