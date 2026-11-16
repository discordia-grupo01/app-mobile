import {
  DEFAULT_PAGE_SIZE,
  type ModerationAuditEntry,
  pageCountOf,
  pageRange,
} from "@discordia/client-shared";
import { useEffect, useState } from "react";

import { listModerationAudit } from "../api";

/** Una pagina del registro de auditoria. `entries` es `null` mientras carga. */
export function useModerationAudit(serverId: string) {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState<{
    key: string;
    entries: ModerationAuditEntry[];
    loadError: string;
  } | null>(null);

  const requestKey = `${serverId}:${page}`;
  const current = loaded?.key === requestKey ? loaded : null;

  useEffect(() => {
    let cancelled = false;
    listModerationAudit(serverId, {
      limit: DEFAULT_PAGE_SIZE,
      offset: (page - 1) * DEFAULT_PAGE_SIZE,
    }).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setLoaded({ key: requestKey, entries: [], loadError: result.message });
        return;
      }
      setLoaded({ key: requestKey, entries: result.entries, loadError: "" });
      setTotal(result.total);
    });
    return () => {
      cancelled = true;
    };
  }, [serverId, page, requestKey]);

  return {
    page,
    pageCount: pageCountOf(total, DEFAULT_PAGE_SIZE),
    range: pageRange(page, DEFAULT_PAGE_SIZE, total),
    total,
    setPage,
    entries: current?.entries ?? null,
    loadError: current?.loadError ?? "",
  };
}
