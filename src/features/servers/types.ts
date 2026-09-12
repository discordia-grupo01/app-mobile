export interface Channel {
  id: string;
  name: string;
  kind: "text" | "voice";
  position: number;
}

export interface ServerSummary {
  id: string;
  name: string;
  icon_url: string | null;
  owner_id: string;
  created_at: string;
  channels: Channel[];
}

export interface ServersApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ServerListItem = ServerSummary;

export interface CreateServerFieldErrors {
  name?: string;
  icon?: string;
}

export interface CreateServerIconInput {
  uri: string;
  name: string;
  type: string;
}

export interface CreateServerParams {
  name: string;
  icon?: CreateServerIconInput | null;
}

export type CreateServerActionResult =
  | { ok: true; server: ServerSummary }
  | { ok: false; message: string; fieldErrors?: CreateServerFieldErrors };

export interface JoinServerFieldErrors {
  code?: string;
}

export type JoinServerActionResult =
  | { ok: true; server: ServerSummary; alreadyMember: boolean }
  | { ok: false; message: string; fieldErrors?: JoinServerFieldErrors };

export type ListServersActionResult =
  { ok: true; servers: ServerSummary[] } | { ok: false; message: string };

export type GetServerActionResult =
  { ok: true; server: ServerSummary } | { ok: false; message: string };

export type LeaveServerActionResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      reason?: "owner_must_transfer_or_delete";
    };
