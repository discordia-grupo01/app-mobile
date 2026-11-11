import {
  type ClosedReportStatus,
  pageCountOf,
  type Report,
  REPORTS_PAGE_SIZE,
  type ReportResolutionAction,
  type ReportStatus,
} from "@discordia/client-shared";

import { useCallback, useEffect, useState } from "react";

import { useRefreshOnChange } from "../../../../hooks/useRefreshOnChange";
import { closeReport, listReports } from "../../api";

export type ReportsTab = "pending" | "closed";

export type CloseOutcome =
  | { ok: true; alreadyClosed: false }
  | { ok: true; alreadyClosed: true; message: string }
  | { ok: false; message: string };

function statusFor(tab: ReportsTab, closedFilter: ClosedReportStatus) {
  return tab === "pending" ? "pending" : closedFilter;
}

export function useReportsList(serverId: string, onPendingClosed: () => void) {
  const [tab, setTabState] = useState<ReportsTab>("pending");
  const [closedFilter, setClosedFilterState] =
    useState<ClosedReportStatus>("resolved");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [loaded, setLoaded] = useState<{
    key: string;
    reports: Report[];
    loadError: string;
  } | null>(null);

  const status: ReportStatus = statusFor(tab, closedFilter);
  const requestKey = `${serverId}:${status}:${page}:${reloadKey}`;
  const current = loaded?.key === requestKey ? loaded : null;
  const reports = current?.reports ?? null;

  useEffect(() => {
    let cancelled = false;
    listReports(serverId, {
      status,
      limit: REPORTS_PAGE_SIZE,
      offset: (page - 1) * REPORTS_PAGE_SIZE,
    }).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setLoaded({ key: requestKey, reports: [], loadError: result.message });
        return;
      }
      setLoaded({ key: requestKey, reports: result.reports, loadError: "" });
      setTotal(result.total);
    });
    return () => {
      cancelled = true;
    };
  }, [serverId, status, page, requestKey]);

  const refreshReports = useCallback(async () => {
    const key = requestKey;
    const result = await listReports(serverId, {
      status,
      limit: REPORTS_PAGE_SIZE,
      offset: (page - 1) * REPORTS_PAGE_SIZE,
    });
    if (!result.ok) return;
    setLoaded((previous) =>
      previous && previous.key !== key
        ? previous
        : { key, reports: result.reports, loadError: "" },
    );
    setTotal(result.total);
  }, [requestKey, serverId, status, page]);

  useRefreshOnChange({ resources: ["reports"], serverId }, refreshReports);

  const removeLocally = useCallback(
    (reportId: string) => {
      setLoaded((previous) =>
        previous
          ? {
              ...previous,
              reports: previous.reports.filter(
                (report) => report.id !== reportId,
              ),
            }
          : previous,
      );
      setTotal((previous) => Math.max(previous - 1, 0));
      onPendingClosed();
      const isLastOnPage = reports?.length === 1 && reports[0]?.id === reportId;
      if (isLastOnPage && total > 1) {
        setPage((previous) => Math.max(previous - 1, 1));
        setReloadKey((key) => key + 1);
      }
    },
    [reports, total, onPendingClosed],
  );

  const close = useCallback(
    async (
      reportId: string,
      closing: ClosedReportStatus,
      action: ReportResolutionAction | null = null,
    ): Promise<CloseOutcome> => {
      const result = await closeReport(serverId, reportId, closing, action);
      if (result.ok) {
        removeLocally(reportId);
        return { ok: true, alreadyClosed: false };
      }
      if (result.isGone) {
        removeLocally(reportId);
        return { ok: true, alreadyClosed: true, message: result.message };
      }
      return { ok: false, message: result.message };
    },
    [serverId, removeLocally],
  );

  function setTab(next: ReportsTab) {
    setTabState(next);
    setPage(1);
  }

  function setClosedFilter(next: ClosedReportStatus) {
    setClosedFilterState(next);
    setPage(1);
  }

  return {
    tab,
    setTab,
    closedFilter,
    setClosedFilter,
    status,
    page,
    pageCount: pageCountOf(total, REPORTS_PAGE_SIZE),
    setPage,
    reports,
    total,
    loadError: current?.loadError ?? "",
    reload: () => setReloadKey((key) => key + 1),
    close,
  };
}

export type ReportsList = ReturnType<typeof useReportsList>;
