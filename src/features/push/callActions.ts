export const INCOMING_CALL_CATEGORY = "private_call_incoming";
export const ACCEPT_CALL_ACTION = "accept_call";
export const DECLINE_CALL_ACTION = "decline_call";

const RINGING_WINDOW_MS = 60_000;

export type PushCallAction = {
  type: "accept" | "decline";
  callId: string;
  callerId: string;
};

type PushCallResponse = {
  actionIdentifier: string;
  data: unknown;
  sentAt: number;
  now: number;
};

const ACTION_TYPES: Record<string, PushCallAction["type"]> = {
  [ACCEPT_CALL_ACTION]: "accept",
  [DECLINE_CALL_ACTION]: "decline",
};

const isText = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export function pushCallActionOf({
  actionIdentifier,
  data,
  sentAt,
  now,
}: PushCallResponse): PushCallAction | null {
  const type = ACTION_TYPES[actionIdentifier];
  if (!type) return null;
  if (now - sentAt > RINGING_WINDOW_MS) return null;
  if (typeof data !== "object" || data === null) return null;

  const { call_id, caller_id } = data as Record<string, unknown>;
  if (!isText(call_id) || !isText(caller_id)) return null;
  return { type, callId: call_id, callerId: caller_id };
}
