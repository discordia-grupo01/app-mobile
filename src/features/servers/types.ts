export interface Channel {
  id: string;
  name: string;
  kind: "text" | "voice";
  position: number;
  category_id: string | null;
  topic: string | null;
}

export interface Category {
  id: string;
  server_id: string;
  name: string;
  position: number;
}

export interface ServerSummary {
  id: string;
  name: string;
  icon_url: string | null;
  owner_id: string;
  created_at: string;
  channels: Channel[];
  categories: Category[];
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

export interface Invitation {
  code: string;
  url: string;
  server_id: string;
  created_by: string;
  max_uses: number | null;
  uses: number;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
}

export interface GenerateInviteFieldErrors {
  maxUses?: string;
}

export type GenerateInviteActionResult =
  | { ok: true; invitation: Invitation }
  | { ok: false; message: string; fieldErrors?: GenerateInviteFieldErrors };

export type RevokeInviteActionResult =
  { ok: true } | { ok: false; message: string };

/**
 * Resultado de `GET /v1/servers/:id/invites`. Trae TODAS las invitaciones del
 * server (activas, revocadas o vencidas), más nuevas primero -- el back no
 * filtra por estado ni limita a una activa por server.
 */
export type ListInvitationsActionResult =
  { ok: true; invitations: Invitation[] } | { ok: false; message: string };

export type OwnershipTransferStatus = "pending" | "accepted" | "rejected";

export interface OwnershipTransfer {
  id: string;
  server_id: string;
  from_user_id: string;
  to_user_id: string;
  status: OwnershipTransferStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface InitiateTransferFieldErrors {
  toUserId?: string;
}

export type InitiateTransferActionResult =
  | { ok: true; transfer: OwnershipTransfer }
  | {
      ok: false;
      message: string;
      fieldErrors?: InitiateTransferFieldErrors;
      reason?: "transfer_already_pending";
    };

export interface Member {
  user_id: string;
  is_owner: boolean;
  joined_at: string;
}

export interface MemberListResponse {
  members: Member[];
  total: number;
  limit: number;
  offset: number;
}

export type ListMembersActionResult =
  | { ok: true; members: Member[]; total: number }
  | { ok: false; message: string };

export interface CreateChannelFieldErrors {
  name?: string;
  kind?: string;
}

/** Resultado de `POST /v1/servers/:id/channels`. */
export type CreateChannelActionResult =
  | { ok: true; channel: Channel }
  | { ok: false; message: string; fieldErrors?: CreateChannelFieldErrors };

export interface CategoryFieldErrors {
  name?: string;
}

/** Resultado de `POST /v1/servers/:id/categories`. */
export type CreateCategoryActionResult =
  | { ok: true; category: Category }
  | { ok: false; message: string; fieldErrors?: CategoryFieldErrors };

export interface UpdateChannelFieldErrors {
  name?: string;
}

export type UpdateChannelActionResult =
  | { ok: true; channel: Channel }
  | { ok: false; message: string; fieldErrors?: UpdateChannelFieldErrors };

export type DeleteChannelActionResult =
  { ok: true } | { ok: false; message: string };

export type ReorderChannelsActionResult =
  { ok: true } | { ok: false; message: string };
