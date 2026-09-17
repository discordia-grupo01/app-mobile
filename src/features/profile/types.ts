import type { PublicUser, User } from "../auth/types";

export type GetOwnProfileActionResult =
  { ok: true; user: User } | { ok: false; message: string };

export type GetPublicProfileActionResult =
  { ok: true; user: PublicUser } | { ok: false; message: string };

export interface PickedProfileImage {
  uri: string;
  name: string;
  type: string;
}

export type UpdateOwnProfileActionResult =
  { ok: true; user: User } | { ok: false; message: string };

export type UpdateStatusActionResult =
  { ok: true; user: User } | { ok: false; message: string };
