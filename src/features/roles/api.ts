import {
  type AssignRoleResult,
  type CreateRoleResult,
  DEFAULT_ROLE_SET_FAILED,
  type DeleteRoleResult,
  fieldOf,
  invalidPermissionMessage,
  type ListMemberRolesResult,
  type ListRolesResult,
  MEMBER_OR_ROLE_NOT_FOUND,
  MEMBER_ROLE_ASSIGN_FAILED,
  MEMBER_ROLE_NOT_ASSIGNED,
  MEMBER_ROLE_REMOVE_FAILED,
  MEMBER_ROLES_LOAD_FAILED,
  messageFor,
  OWNER_ONLY_ASSIGN_ROLE,
  OWNER_ONLY_CREATE_ROLE,
  OWNER_ONLY_DELETE_ROLE,
  OWNER_ONLY_REMOVE_ROLE,
  OWNER_ONLY_SET_DEFAULT_ROLE,
  OWNER_ONLY_UPDATE_ROLE,
  reasonOf,
  type RemoveRoleResult,
  type ReorderRolesResult,
  type Role,
  ROLE_CREATE_FAILED,
  ROLE_DELETE_FAILED,
  ROLE_IS_DEFAULT,
  ROLE_NOT_FOUND,
  ROLE_REASONS,
  ROLE_REORDER_FAILED,
  ROLE_UPDATE_FAILED,
  type RolePermission,
  ROLES_LOAD_FAILED,
  SESSION_EXPIRED_MESSAGE,
  type SetDefaultRoleResult,
  type UpdateRoleResult,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

export async function listRoles(serverId: string): Promise<ListRolesResult> {
  const result = await apiFetch<Role[]>(`/v1/servers/${serverId}/roles`, {
    method: "GET",
  });

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    return {
      ok: false,
      message: messageFor(result, {}, ROLES_LOAD_FAILED),
    };
  }

  return { ok: true, roles: result.data };
}

export async function createRole(
  serverId: string,
  input: { name: string; color: string },
): Promise<CreateRoleResult> {
  const result = await apiFetch<Role>(`/v1/servers/${serverId}/roles`, {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    const reason = reasonOf(result.details);
    const field = fieldOf(result.details);
    const friendly = reason ? ROLE_REASONS[reason] : undefined;

    if (friendly && (field === "name" || field === "color")) {
      return {
        ok: false,
        message: friendly,
        fieldErrors: { [field]: friendly },
      };
    }
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return { ok: false, message: OWNER_ONLY_CREATE_ROLE };
    }
    return {
      ok: false,
      message: messageFor(result, ROLE_REASONS, ROLE_CREATE_FAILED),
    };
  }

  return { ok: true, role: result.data };
}

export async function updateRole(
  roleId: string,
  input: { name?: string; color?: string; permissions?: RolePermission[] },
): Promise<UpdateRoleResult> {
  const result = await apiFetch<Role>(`/v1/roles/${roleId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    const reason = reasonOf(result.details);
    const field = fieldOf(result.details);
    const friendly = reason ? ROLE_REASONS[reason] : undefined;

    if (friendly && (field === "name" || field === "color")) {
      return {
        ok: false,
        message: friendly,
        fieldErrors: { [field]: friendly },
      };
    }
    if (field === "permissions") {
      const message = invalidPermissionMessage(result.details?.invalid_value);
      return { ok: false, message, fieldErrors: { permissions: message } };
    }
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return { ok: false, message: OWNER_ONLY_UPDATE_ROLE };
    }
    if (result.status === 404) {
      return { ok: false, message: ROLE_NOT_FOUND };
    }
    return {
      ok: false,
      message: messageFor(result, ROLE_REASONS, ROLE_UPDATE_FAILED),
    };
  }

  return { ok: true, role: result.data };
}

export async function deleteRole(roleId: string): Promise<DeleteRoleResult> {
  const result = await apiFetch<void>(`/v1/roles/${roleId}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    if (result.status === 409) {
      return {
        ok: false,
        isDefaultRole: true,
        message: ROLE_IS_DEFAULT,
      };
    }
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return {
        ok: false,
        message: OWNER_ONLY_DELETE_ROLE,
      };
    }
    if (result.status === 404) {
      return { ok: false, message: ROLE_NOT_FOUND };
    }
    return {
      ok: false,
      message: messageFor(result, {}, ROLE_DELETE_FAILED),
    };
  }

  return { ok: true };
}

export async function setDefaultRole(
  serverId: string,
  roleId: string,
): Promise<SetDefaultRoleResult> {
  const result = await apiFetch<void>(`/v1/servers/${serverId}/default-role`, {
    method: "PUT",
    body: JSON.stringify({ role_id: roleId }),
  });

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return {
        ok: false,
        message: OWNER_ONLY_SET_DEFAULT_ROLE,
      };
    }
    if (result.status === 404) {
      return { ok: false, message: ROLE_NOT_FOUND };
    }
    return {
      ok: false,
      message: messageFor(result, {}, DEFAULT_ROLE_SET_FAILED),
    };
  }

  return { ok: true };
}

export async function reorderRoles(
  serverId: string,
  roleIds: string[],
): Promise<ReorderRolesResult> {
  const result = await apiFetch<Role[]>(
    `/v1/servers/${serverId}/roles/reorder`,
    { method: "PATCH", body: JSON.stringify({ role_ids: roleIds }) },
  );

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    return {
      ok: false,
      message: messageFor(result, ROLE_REASONS, ROLE_REORDER_FAILED),
    };
  }

  return { ok: true, roles: result.data };
}

export async function listMemberRoles(
  serverId: string,
  userId: string,
): Promise<ListMemberRolesResult> {
  const result = await apiFetch<Role[]>(
    `/v1/servers/${serverId}/members/${userId}/roles`,
    { method: "GET" },
  );

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    return {
      ok: false,
      message: messageFor(result, {}, MEMBER_ROLES_LOAD_FAILED),
    };
  }

  return { ok: true, roles: result.data };
}

export async function assignRole(
  serverId: string,
  userId: string,
  roleId: string,
): Promise<AssignRoleResult> {
  const result = await apiFetch<Role>(
    `/v1/servers/${serverId}/members/${userId}/roles`,
    { method: "POST", body: JSON.stringify({ role_id: roleId }) },
  );

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return { ok: false, message: OWNER_ONLY_ASSIGN_ROLE };
    }
    if (result.status === 404) {
      return { ok: false, message: MEMBER_OR_ROLE_NOT_FOUND };
    }
    return {
      ok: false,
      message: messageFor(result, {}, MEMBER_ROLE_ASSIGN_FAILED),
    };
  }

  return { ok: true, role: result.data };
}

export async function removeRole(
  serverId: string,
  userId: string,
  roleId: string,
): Promise<RemoveRoleResult> {
  const result = await apiFetch<void>(
    `/v1/servers/${serverId}/members/${userId}/roles/${roleId}`,
    { method: "DELETE" },
  );

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return { ok: false, message: OWNER_ONLY_REMOVE_ROLE };
    }
    if (result.status === 404) {
      return { ok: false, message: MEMBER_ROLE_NOT_ASSIGNED };
    }
    return {
      ok: false,
      message: messageFor(result, {}, MEMBER_ROLE_REMOVE_FAILED),
    };
  }

  return { ok: true };
}
