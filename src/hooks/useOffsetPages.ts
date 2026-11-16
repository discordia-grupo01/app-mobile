import {
  type BillingResult,
  type ChangeFilter,
  pageCountOf,
  pageRange,
} from "@discordia/client-shared";

import { useCallback, useEffect, useState } from "react";

import { useRefreshOnChange } from "./useRefreshOnChange";

interface OffsetPage {
  total: number;
  limit: number;
}

interface UseOffsetPagesOptions<P extends OffsetPage> {
  fetchPage: (page: number) => Promise<BillingResult<P>>;
  countOf: (page: P) => number;
  pageSize: number;
  refreshOn: ChangeFilter;
}

export function useOffsetPages<P extends OffsetPage>({
  fetchPage,
  countOf,
  pageSize,
  refreshOn,
}: UseOffsetPagesOptions<P>) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<P | null>(null);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void fetchPage(page).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setLoadError(result.message);
        return;
      }
      if (countOf(result.data) === 0 && page > 1) {
        setPage(page - 1);
        return;
      }
      setLoadError("");
      setData(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchPage, countOf, page, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  useRefreshOnChange(refreshOn, reload);

  const restart = useCallback(() => {
    setPage(1);
    setAttempt((value) => value + 1);
  }, []);

  const total = data?.total ?? 0;
  return {
    page,
    setPage,
    data,
    loadError,
    total,
    pageCount: pageCountOf(total, pageSize),
    range: pageRange(page, pageSize, total),
    reload,
    restart,
  };
}
