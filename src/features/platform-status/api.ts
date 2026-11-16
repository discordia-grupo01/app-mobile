import {
  PLATFORM_STATUS_LOAD_FAILED,
  type PlatformStatusResponse,
  type PlatformStatusResult,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

export async function getPlatformStatus(): Promise<PlatformStatusResult> {
  const result = await apiFetch<PlatformStatusResponse>("/v1/status", {
    method: "GET",
  });
  if (!result.ok || !Array.isArray(result.data?.incidents)) {
    return { ok: false, message: PLATFORM_STATUS_LOAD_FAILED };
  }
  return {
    ok: true,
    status: result.data.status,
    incidents: result.data.incidents,
  };
}
