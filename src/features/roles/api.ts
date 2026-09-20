import {
  fieldOf,
  messageFor,
  reasonOf,
  ROLE_REASONS,
  SESSION_EXPIRED_MESSAGE,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";
import type {
  AssignRoleActionResult,
  CreateRoleActionResult,
  DeleteRoleActionResult,
  ListMemberRolesActionResult,
  ListRolesActionResult,
  RemoveRoleActionResult,
  Role,
  RolePermission,
  SetDefaultRoleActionResult,
  UpdateRoleActionResult,
} from "./types";

export async function listRoles(
  serverId: string,
): Promise<ListRolesActionResult> {
  const result = await apiFetch<Role[]>(`/v1/servers/${serverId}/roles`, {
    method: "GET",
  });

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    return {
      ok: false,
      message: messageFor(
        result,
        {},
        "No pudimos cargar los roles. Intentá de nuevo.",
      ),
    };
  }

  return { ok: true, roles: result.data };
}

export async function createRole(
  serverId: string,
  input: { name: string; color: string },
): Promise<CreateRoleActionResult> {
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
      return { ok: false, message: "Solo el propietario puede crear roles." };
    }
    return {
      ok: false,
      message: messageFor(
        result,
        ROLE_REASONS,
        "No pudimos crear el rol. Intentá de nuevo.",
      ),
    };
  }

  return { ok: true, role: result.data };
}

export async function updateRole(
  roleId: string,
  input: { name?: string; color?: string; permissions?: RolePermission[] },
): Promise<UpdateRoleActionResult> {
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
      const message = "Uno de los permisos enviados no es válido.";
      return { ok: false, message, fieldErrors: { permissions: message } };
    }
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return { ok: false, message: "Solo el propietario puede editar roles." };
    }
    if (result.status === 404) {
      return { ok: false, message: "No encontramos ese rol." };
    }
    return {
      ok: false,
      message: messageFor(
        result,
        ROLE_REASONS,
        "No pudimos editar el rol. Intentá de nuevo.",
      ),
    };
  }

  return { ok: true, role: result.data };
}

export async function deleteRole(
  roleId: string,
): Promise<DeleteRoleActionResult> {
  const result = await apiFetch<void>(`/v1/roles/${roleId}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    if (result.status === 409) {
      return {
        ok: false,
        isDefaultRole: true,
        message:
          "Este es el rol por defecto. Primero asigná otro rol como predeterminado.",
      };
    }
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return {
        ok: false,
        message: "Solo el propietario puede eliminar roles.",
      };
    }
    if (result.status === 404) {
      return { ok: false, message: "No encontramos ese rol." };
    }
    return {
      ok: false,
      message: messageFor(
        result,
        {},
        "No pudimos eliminar el rol. Intentá de nuevo.",
      ),
    };
  }

  return { ok: true };
}

export async function setDefaultRole(
  serverId: string,
  roleId: string,
): Promise<SetDefaultRoleActionResult> {
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
        message: "Solo el propietario puede definir el rol por defecto.",
      };
    }
    if (result.status === 404) {
      return { ok: false, message: "No encontramos ese rol." };
    }
    return {
      ok: false,
      message: messageFor(
        result,
        {},
        "No pudimos definir el rol por defecto. Intentá de nuevo.",
      ),
    };
  }

  return { ok: true };
}

export async function listMemberRoles(
  serverId: string,
  userId: string,
): Promise<ListMemberRolesActionResult> {
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
      message: messageFor(
        result,
        {},
        "No pudimos cargar los roles del miembro.",
      ),
    };
  }

  return { ok: true, roles: result.data };
}

export async function assignRole(
  serverId: string,
  userId: string,
  roleId: string,
): Promise<AssignRoleActionResult> {
  const result = await apiFetch<Role>(
    `/v1/servers/${serverId}/members/${userId}/roles`,
    { method: "POST", body: JSON.stringify({ role_id: roleId }) },
  );

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return { ok: false, message: "Solo el propietario puede asignar roles." };
    }
    if (result.status === 404) {
      return { ok: false, message: "Ese miembro o ese rol ya no existen." };
    }
    return {
      ok: false,
      message: messageFor(
        result,
        {},
        "No pudimos asignar el rol. Intentá de nuevo.",
      ),
    };
  }

  return { ok: true, role: result.data };
}

export async function removeRole(
  serverId: string,
  userId: string,
  roleId: string,
): Promise<RemoveRoleActionResult> {
  const result = await apiFetch<void>(
    `/v1/servers/${serverId}/members/${userId}/roles/${roleId}`,
    { method: "DELETE" },
  );

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    if (result.status === 403) {
      return { ok: false, message: "Solo el propietario puede quitar roles." };
    }
    if (result.status === 404) {
      return { ok: false, message: "Ese miembro no tenía este rol." };
    }
    return {
      ok: false,
      message: messageFor(
        result,
        {},
        "No pudimos quitar el rol. Intentá de nuevo.",
      ),
    };
  }

  return { ok: true };
}
