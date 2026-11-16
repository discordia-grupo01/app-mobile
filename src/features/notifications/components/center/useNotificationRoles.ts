import type { NotificationHistoryItem } from "@discordia/client-shared";

import { useEffect, useRef, useState } from "react";

import { listRoles } from "../../../roles/api";

export function useNotificationRoles(
  items: readonly NotificationHistoryItem[],
): Record<string, string> {
  const [roleNames, setRoleNames] = useState<Record<string, string>>({});
  const requested = useRef(new Set<string>());
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const serverIds = items.flatMap((item) =>
      item.kind === "mention" && item.server_id ? [item.server_id] : [],
    );
    const missing = [...new Set(serverIds)].filter(
      (id) => !requested.current.has(id),
    );
    missing.forEach((id) => requested.current.add(id));

    missing.forEach((serverId) => {
      void listRoles(serverId).then((result) => {
        if (!isMounted.current || !result.ok) return;
        setRoleNames((previous) => ({
          ...previous,
          ...Object.fromEntries(
            result.roles.map((role) => [role.id, role.name]),
          ),
        }));
      });
    });
  }, [items]);

  return roleNames;
}
