import {
  type ClosedReportStatus,
  closeReportFailureMessage,
  type CloseReportResult,
  createReportBody,
  createReportFailureMessage,
  type CreateReportInput,
  type CreateReportResult,
  isModerator,
  isReportGone,
  listReportsFailureMessage,
  type ListReportsResult,
  MESSAGE_DELETE_FAILED,
  messageErrorFor,
  PENDING_REPORTS_COUNT_QUERY,
  pendingReportsTotalFrom,
  type Report,
  type ReportListResponse,
  type ReportResolutionAction,
  type ReportStatus,
  reportsQuery,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

export async function createReport(
  serverId: string,
  input: CreateReportInput,
): Promise<CreateReportResult> {
  const result = await apiFetch<Report>(`/v1/servers/${serverId}/reports`, {
    method: "POST",
    body: JSON.stringify(createReportBody(input)),
  });
  if (!result.ok) {
    return { ok: false, message: createReportFailureMessage(result) };
  }
  return { ok: true, report: result.data };
}

export async function listReports(
  serverId: string,
  query: { status: ReportStatus; limit: number; offset: number },
): Promise<ListReportsResult> {
  const result = await apiFetch<ReportListResponse>(
    `/v1/servers/${serverId}/reports?${reportsQuery(query)}`,
    { method: "GET" },
  );
  if (!result.ok) {
    return { ok: false, message: listReportsFailureMessage(result) };
  }
  return { ok: true, reports: result.data.reports, total: result.data.total };
}

export async function closeReport(
  serverId: string,
  reportId: string,
  status: ClosedReportStatus,
  action: ReportResolutionAction | null = null,
): Promise<CloseReportResult> {
  const result = await apiFetch<Report>(
    `/v1/servers/${serverId}/reports/${reportId}`,
    {
      method: "PATCH",
      body: JSON.stringify(action ? { status, action } : { status }),
    },
  );
  if (!result.ok) {
    return {
      ok: false,
      message: closeReportFailureMessage(result),
      isGone: isReportGone(result),
    };
  }
  return { ok: true, report: result.data };
}

export async function fetchPendingReportsCount(
  serverId: string,
  userId: string,
): Promise<number | null> {
  const permissions = await apiFetch<{ permissions: string[] }>(
    `/v1/servers/${serverId}/members/${userId}/permissions`,
    { method: "GET" },
  );
  if (!permissions.ok) return permissions.status === 403 ? 0 : null;
  if (!Array.isArray(permissions.data?.permissions)) return null;
  if (!isModerator(permissions.data.permissions)) return 0;

  const reports = await apiFetch<ReportListResponse>(
    `/v1/servers/${serverId}/reports?${PENDING_REPORTS_COUNT_QUERY}`,
    { method: "GET" },
  );
  return pendingReportsTotalFrom(reports);
}

export async function deleteReportedMessage(
  channelId: string,
  messageId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await apiFetch<void>(
    `/v1/channels/${encodeURIComponent(channelId)}/messages/${encodeURIComponent(messageId)}`,
    { method: "DELETE" },
  );
  if (!result.ok) {
    return {
      ok: false,
      message: messageErrorFor(result.code, MESSAGE_DELETE_FAILED),
    };
  }
  return { ok: true };
}
