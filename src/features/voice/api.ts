import {
  type AcceptPrivateCallResult,
  callStartsByChannel,
  type LeaveVoiceResult,
  parseAcceptedPrivateCall,
  parsePrivateCall,
  PRIVATE_CALL_ACCEPT_FAILED,
  PRIVATE_CALL_END_FAILED,
  PRIVATE_CALL_START_FAILED,
  type PrivateCallActionResult,
  presenceByChannel,
  VOICE_CONNECT_FAILED,
  VOICE_LEAVE_FAILED,
  VOICE_PARTICIPANTS_FAILED,
  VOICE_SCREEN_SHARE_FAILED,
  voiceErrorCodeOf,
  voiceErrorMessage,
  type VoiceParticipantsResponse,
  type VoiceParticipantsResult,
  type StartPrivateCallResult,
  type VoiceScreenShareToken,
  type VoiceScreenShareTokenResult,
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

export async function requestScreenShareToken(
  channelId: string,
): Promise<VoiceScreenShareTokenResult> {
  const result = await voiceRequest<VoiceScreenShareToken>(
    "/api/voice/screen-token",
    { method: "POST", body: JSON.stringify({ channel_id: channelId }) },
    VOICE_SCREEN_SHARE_FAILED,
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
    ? {
        ok: true,
        byChannel: presenceByChannel(result.data),
        startsByChannel: callStartsByChannel(result.data),
      }
    : result;
}

export async function fetchVoiceSocketTicket(): Promise<
  { ok: true; ticket: string } | { ok: false; sessionExpired: boolean }
> {
  const { result } = await apiFetchWithBody<{
    ticket?: string;
  }>("/api/voice/socket-ticket", { method: "POST" });

  if (result.ok && typeof result.data?.ticket === "string") {
    return { ok: true, ticket: result.data.ticket };
  }

  return {
    ok: false,
    sessionExpired: result.status === 401,
  };
}

export async function startPrivateCall(
  recipientId: string,
  conversationId: string,
): Promise<StartPrivateCallResult> {
  const result = await voiceRequest<unknown>(
    "/api/voice/calls",
    {
      method: "POST",
      body: JSON.stringify({
        recipient_id: recipientId,
        conversation_id: conversationId,
      }),
    },
    PRIVATE_CALL_START_FAILED,
  );
  if (!result.ok) return result;
  const call = parsePrivateCall(result.data);
  return call
    ? { ok: true, call }
    : { ok: false, message: PRIVATE_CALL_START_FAILED };
}

export async function acceptPrivateCall(
  callId: string,
): Promise<AcceptPrivateCallResult> {
  const result = await voiceRequest<unknown>(
    privateCallPath(callId, "accept"),
    { method: "POST" },
    PRIVATE_CALL_ACCEPT_FAILED,
  );
  if (!result.ok) return result;
  const call = parseAcceptedPrivateCall(result.data);
  return call
    ? { ok: true, call }
    : { ok: false, message: PRIVATE_CALL_ACCEPT_FAILED };
}

export function rejectPrivateCall(
  callId: string,
): Promise<PrivateCallActionResult> {
  return endPrivateCall(callId, "reject");
}

export function finishPrivateCall(
  callId: string,
): Promise<PrivateCallActionResult> {
  return endPrivateCall(callId, "finish");
}

function privateCallPath(callId: string, action: string): string {
  return `/api/voice/calls/${encodeURIComponent(callId)}/${action}`;
}

async function endPrivateCall(
  callId: string,
  action: "reject" | "finish",
): Promise<PrivateCallActionResult> {
  const result = await voiceRequest<unknown>(
    privateCallPath(callId, action),
    { method: "POST" },
    PRIVATE_CALL_END_FAILED,
  );
  return result.ok ? { ok: true } : result;
}
