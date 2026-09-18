import { ApiError, NetworkError, apiFetch } from "../../lib/api-client";
import {
  NETWORK_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
  fieldOf,
  reasonOf,
} from "../servers/api/shared";
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

const REASON_MESSAGES: Record<string, string> = {
  name_required: "Ingresá un nombre para el rol.",
  name_too_long: "El nombre es demasiado largo.",
  color_invalid_format: "Elegí un color válido para el rol.",
};

export async function listRoles(
  serverId: string,
): Promise<ListRolesActionResult> {
  try {
    const roles = await apiFetch<Role[]>(`/v1/servers/${serverId}/roles`, {
      method: "GET",
    });
    return { ok: true, roles };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError && err.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    return {
      ok: false,
      message: "No pudimos cargar los roles. Intenta de nuevo.",
    };
  }
}

export async function createRole(
  serverId: string,
  input: { name: string; color: string },
): Promise<CreateRoleActionResult> {
  try {
    const role = await apiFetch<Role>(`/v1/servers/${serverId}/roles`, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return { ok: true, role };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      const field = fieldOf(err);
      const reason = reasonOf(err);
      const friendly = reason ? REASON_MESSAGES[reason] : undefined;
      if ((field === "name" || field === "color") && friendly) {
        return {
          ok: false,
          message: friendly,
          fieldErrors: { [field]: friendly },
        };
      }
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 403) {
        return {
          ok: false,
          message: "Solo el propietario puede crear roles.",
        };
      }
      if (friendly) return { ok: false, message: friendly };
    }
    return {
      ok: false,
      message: "No pudimos crear el rol. Intenta de nuevo.",
    };
  }
}

export async function updateRole(
  roleId: string,
  input: { name?: string; color?: string; permissions?: RolePermission[] },
): Promise<UpdateRoleActionResult> {
  try {
    const role = await apiFetch<Role>(`/v1/roles/${roleId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return { ok: true, role };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      const field = fieldOf(err);
      const reason = reasonOf(err);
      const friendly = reason ? REASON_MESSAGES[reason] : undefined;
      if ((field === "name" || field === "color") && friendly) {
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
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 403) {
        return {
          ok: false,
          message: "Solo el propietario puede editar roles.",
        };
      }
      if (err.status === 404) {
        return { ok: false, message: "No encontramos ese rol." };
      }
      if (friendly) return { ok: false, message: friendly };
    }
    return {
      ok: false,
      message: "No pudimos editar el rol. Intenta de nuevo.",
    };
  }
}

export async function deleteRole(
  roleId: string,
): Promise<DeleteRoleActionResult> {
  try {
    await apiFetch<void>(`/v1/roles/${roleId}`, { method: "DELETE" });
    return { ok: true };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      if (err.status === 409) {
        return {
          ok: false,
          isDefaultRole: true,
          message:
            "Este es el rol por defecto. Primero asigná otro rol como predeterminado.",
        };
      }
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 403) {
        return {
          ok: false,
          message: "Solo el propietario puede eliminar roles.",
        };
      }
      if (err.status === 404) {
        return { ok: false, message: "No encontramos ese rol." };
      }
    }
    return {
      ok: false,
      message: "No pudimos eliminar el rol. Intenta de nuevo.",
    };
  }
}

export async function setDefaultRole(
  serverId: string,
  roleId: string,
): Promise<SetDefaultRoleActionResult> {
  try {
    await apiFetch<void>(`/v1/servers/${serverId}/default-role`, {
      method: "PUT",
      body: JSON.stringify({ role_id: roleId }),
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 403) {
        return {
          ok: false,
          message: "Solo el propietario puede definir el rol por defecto.",
        };
      }
      if (err.status === 404) {
        return { ok: false, message: "No encontramos ese rol." };
      }
    }
    return {
      ok: false,
      message: "No pudimos definir el rol por defecto. Intenta de nuevo.",
    };
  }
}

export async function listMemberRoles(
  serverId: string,
  userId: string,
): Promise<ListMemberRolesActionResult> {
  try {
    const roles = await apiFetch<Role[]>(
      `/v1/servers/${serverId}/members/${userId}/roles`,
      { method: "GET" },
    );
    return { ok: true, roles };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError && err.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    return {
      ok: false,
      message: "No pudimos cargar los roles del miembro.",
    };
  }
}

export async function assignRole(
  serverId: string,
  userId: string,
  roleId: string,
): Promise<AssignRoleActionResult> {
  try {
    const role = await apiFetch<Role>(
      `/v1/servers/${serverId}/members/${userId}/roles`,
      { method: "POST", body: JSON.stringify({ role_id: roleId }) },
    );
    return { ok: true, role };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 403) {
        return {
          ok: false,
          message: "Solo el propietario puede asignar roles.",
        };
      }
      if (err.status === 404) {
        return { ok: false, message: "Ese miembro o ese rol ya no existen." };
      }
    }
    return {
      ok: false,
      message: "No pudimos asignar el rol. Intenta de nuevo.",
    };
  }
}

export async function removeRole(
  serverId: string,
  userId: string,
  roleId: string,
): Promise<RemoveRoleActionResult> {
  try {
    await apiFetch<void>(
      `/v1/servers/${serverId}/members/${userId}/roles/${roleId}`,
      { method: "DELETE" },
    );
    return { ok: true };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError) {
      if (err.status === 401) {
        return { ok: false, message: SESSION_EXPIRED_MESSAGE };
      }
      if (err.status === 403) {
        return {
          ok: false,
          message: "Solo el propietario puede quitar roles.",
        };
      }
      if (err.status === 404) {
        return { ok: false, message: "Ese miembro no tenía este rol." };
      }
    }
    return {
      ok: false,
      message: "No pudimos quitar el rol. Intenta de nuevo.",
    };
  }
}
