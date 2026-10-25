import {
  type ListPresenceResult,
  PRESENCE_LOAD_FAILED,
  type PresenceListResponse,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

/** Estado de actividad de hasta 100 usuarios (`GET /v1/presence`). Los cambios llegan por socket. */
export async function listPresence(
  userIds: readonly string[],
): Promise<ListPresenceResult> {
  const ids = userIds.map(encodeURIComponent).join(",");
  const result = await apiFetch<PresenceListResponse>(
    `/v1/presence?user_ids=${ids}`,
    { method: "GET" },
  );
  if (!result.ok || !Array.isArray(result.data?.presences)) {
    return { ok: false, message: PRESENCE_LOAD_FAILED };
  }
  return { ok: true, presences: result.data.presences };
}
