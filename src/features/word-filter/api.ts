import {
  type BannedWordsResponse,
  type ListBannedWordsResult,
  listBannedWordsFailureMessage,
  type SaveBannedWordsResult,
  saveBannedWordsFailureMessage,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

/**
 * Palabras prohibidas de un servidor (misma API que `web-client`). Los dos
 * endpoints exigen `MANAGE_MESSAGES`. Guardar manda la lista ENTERA y
 * reemplaza la anterior; vacia saca el filtro.
 */
export async function listBannedWords(
  serverId: string,
): Promise<ListBannedWordsResult> {
  const result = await apiFetch<BannedWordsResponse>(
    `/v1/servers/${serverId}/banned-words`,
    { method: "GET" },
  );
  if (!result.ok) {
    return { ok: false, message: listBannedWordsFailureMessage(result) };
  }
  return { ok: true, words: result.data.words };
}

export async function saveBannedWords(
  serverId: string,
  words: string[],
): Promise<SaveBannedWordsResult> {
  const result = await apiFetch<BannedWordsResponse>(
    `/v1/servers/${serverId}/banned-words`,
    { method: "PUT", body: JSON.stringify({ words }) },
  );
  if (!result.ok) {
    return { ok: false, message: saveBannedWordsFailureMessage(result) };
  }
  return { ok: true, words: result.data.words };
}
