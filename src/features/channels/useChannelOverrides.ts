import {
  addRoleOverride,
  type ChannelOverridePermission,
  clearRoleOverride,
  diffOverrideDrafts,
  type OverrideChange,
  type OverrideDraft,
  overridesToDraft,
  type OverrideValue,
  setOverrideValue,
} from "@discordia/client-shared";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  deleteChannelOverride,
  listChannelOverrides,
  setChannelOverride,
} from "../servers/api";

export interface OverrideSaveFailure {
  roleId: string;
  message: string;
  permissionDenied: boolean;
}

export type OverridesStatus = "loading" | "ready" | "error";

/** Manda los cambios de a uno y devuelve los que fallaron. */
export async function applyOverrideChanges(
  channelId: string,
  changes: readonly OverrideChange[],
): Promise<OverrideSaveFailure[]> {
  const failures: OverrideSaveFailure[] = [];
  for (const change of changes) {
    const result =
      change.kind === "delete"
        ? await deleteChannelOverride(channelId, change.roleId)
        : await setChannelOverride(channelId, change.roleId, {
            allow: change.allow,
            deny: change.deny,
          });
    if (!result.ok) {
      failures.push({
        roleId: change.roleId,
        message: result.message,
        permissionDenied: result.permissionDenied ?? false,
      });
    }
  }
  return failures;
}

export function mergeFailedRoles(
  fresh: OverrideDraft,
  draft: OverrideDraft,
  failedRoleIds: readonly string[],
): OverrideDraft {
  const merged: Record<string, OverrideDraft[string]> = { ...fresh };
  for (const roleId of failedRoleIds) {
    const pending = draft[roleId];
    if (pending) merged[roleId] = pending;
    else delete merged[roleId];
  }
  return merged;
}

export function useChannelOverrides(
  channelId: string,
  everyoneRoleId: string | null,
  enabled: boolean,
) {
  const [saved, setSaved] = useState<OverrideDraft | null>(null);
  const [draft, setDraft] = useState<OverrideDraft | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!enabled || !everyoneRoleId) return;
    let cancelled = false;
    listChannelOverrides(channelId).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setLoadError(result.message);
        return;
      }
      const loaded = overridesToDraft(result.overrides, everyoneRoleId);
      setLoadError(null);
      setSaved(loaded);
      setDraft(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [channelId, everyoneRoleId, enabled, attempt]);

  const changes = useMemo(
    () =>
      saved && draft && everyoneRoleId
        ? diffOverrideDrafts(saved, draft, everyoneRoleId)
        : [],
    [saved, draft, everyoneRoleId],
  );

  const setValue = useCallback(
    (
      roleId: string,
      permission: ChannelOverridePermission,
      value: OverrideValue,
    ) => {
      setDraft(
        (current) =>
          current && setOverrideValue(current, roleId, permission, value),
      );
    },
    [],
  );

  const addRole = useCallback((roleId: string) => {
    setDraft((current) => current && addRoleOverride(current, roleId));
  }, []);

  const clearRole = useCallback(
    (roleId: string) => {
      if (!everyoneRoleId) return;
      setDraft(
        (current) =>
          current && clearRoleOverride(current, roleId, everyoneRoleId),
      );
    },
    [everyoneRoleId],
  );

  const reset = useCallback(() => setDraft(saved), [saved]);
  const retry = useCallback(() => {
    setLoadError(null);
    setAttempt((value) => value + 1);
  }, []);

  const save = useCallback(async (): Promise<OverrideSaveFailure[]> => {
    if (!draft || !everyoneRoleId || changes.length === 0) return [];
    setIsSaving(true);
    const failures = await applyOverrideChanges(channelId, changes);

    const fresh = await listChannelOverrides(channelId);
    if (fresh.ok) {
      const loaded = overridesToDraft(fresh.overrides, everyoneRoleId);
      setSaved(loaded);
      setDraft(
        mergeFailedRoles(
          loaded,
          draft,
          failures.map((failure) => failure.roleId),
        ),
      );
    }
    setIsSaving(false);
    return failures;
  }, [channelId, changes, draft, everyoneRoleId]);

  const status: OverridesStatus = loadError
    ? "error"
    : draft
      ? "ready"
      : "loading";

  return {
    status,
    loadError,
    draft,
    hasChanges: changes.length > 0,
    isSaving,
    setValue,
    addRole,
    clearRole,
    reset,
    retry,
    save,
  };
}

export type ChannelOverridesState = ReturnType<typeof useChannelOverrides>;
