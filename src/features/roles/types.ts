export const ROLE_PERMISSIONS = [
  "VIEW_CHANNELS",
  "SEND_MESSAGES",
  "MANAGE_CHANNELS",
  "MANAGE_ROLES",
  "KICK_MEMBERS",
  "BAN_MEMBERS",
  "MANAGE_SERVER",
] as const;

export type RolePermission = (typeof ROLE_PERMISSIONS)[number];

export interface Role {
  id: string;
  server_id: string;
  name: string;
  color: string;
  permissions: RolePermission[];
  created_at: string;
  updated_at: string;
}

export interface RoleFieldErrors {
  name?: string;
  color?: string;
  permissions?: string;
}

export type CreateRoleActionResult =
  | { ok: true; role: Role }
  | { ok: false; message: string; fieldErrors?: RoleFieldErrors };

export type ListRolesActionResult =
  { ok: true; roles: Role[] } | { ok: false; message: string };

export type UpdateRoleActionResult =
  | { ok: true; role: Role }
  | { ok: false; message: string; fieldErrors?: RoleFieldErrors };

export type DeleteRoleActionResult =
  { ok: true } | { ok: false; message: string; isDefaultRole?: boolean };

export type SetDefaultRoleActionResult =
  { ok: true } | { ok: false; message: string };

export type ListMemberRolesActionResult =
  { ok: true; roles: Role[] } | { ok: false; message: string };

export type AssignRoleActionResult =
  { ok: true; role: Role } | { ok: false; message: string };

export type RemoveRoleActionResult =
  { ok: true } | { ok: false; message: string };
