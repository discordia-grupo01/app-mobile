import {
  type LeaveVoiceResult,
  presenceByChannel,
  VOICE_CONNECT_FAILED,
  VOICE_LEAVE_FAILED,
  VOICE_PARTICIPANTS_FAILED,
  voiceErrorCodeOf,
  voiceErrorMessage,
  type VoiceParticipantsResponse,
  type VoiceParticipantsResult,
  type VoiceToken,
  type VoiceTokenResult,
} from "@discordia/client-shared";

import { apiFetchWithBody } from "../../lib/api-client";

async function voiceRequest<T>(
  path: string,
  options: RequestInit,
  fallback: string,
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const { result, body } = await apiFetchWithBody<T>(path, options);
  if (result.ok) return { ok: true, data: result.data };
  return {
    ok: false,
    message: voiceErrorMessage(voiceErrorCodeOf(body), fallback),
  };
}

export async function requestVoiceToken(
  channelId: string,
): Promise<VoiceTokenResult> {
  const result = await voiceRequest<VoiceToken>(
    "/api/voice/token",
    { method: "POST", body: JSON.stringify({ channel_id: channelId }) },
    VOICE_CONNECT_FAILED,
  );
  return result.ok ? { ok: true, token: result.data } : result;
}

export async function leaveVoiceSession(
  channelId: string,
): Promise<LeaveVoiceResult> {
  const result = await voiceRequest<unknown>(
    "/api/voice/session",
    { method: "DELETE", body: JSON.stringify({ channel_id: channelId }) },
    VOICE_LEAVE_FAILED,
  );
  return result.ok ? { ok: true } : result;
}

export async function listVoiceParticipants(
  serverId: string,
): Promise<VoiceParticipantsResult> {
  const result = await voiceRequest<VoiceParticipantsResponse>(
    `/api/voice/participants?server_id=${encodeURIComponent(serverId)}`,
    { method: "GET" },
    VOICE_PARTICIPANTS_FAILED,
  );
  return result.ok
    ? { ok: true, byChannel: presenceByChannel(result.data) }
    : result;
}
