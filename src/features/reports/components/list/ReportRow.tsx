import {
  DISMISS_REPORT_ACTION,
  GO_TO_REPORTED_MESSAGE_ACTION,
  type Message,
  type MessageAuthor,
  parseReportReason,
  type Report,
  REPORT_SANCTION_MENU_LABEL,
  REPORTED_MESSAGE_GONE,
  REPORTED_MESSAGE_UNKNOWN_CHANNEL,
  reportedMessageIn,
  RESOLVE_REPORT_ACTION,
} from "@discordia/client-shared";

import { Text, View } from "react-native";

import { ReportTargetPreview } from "../shared/ReportTargetPreview";
import { LinkAction, RowButton } from "./ReportRowButton";
import { ReportRowHeading } from "./ReportRowHeading";

export type ReportedMessageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "gone" }
  | { status: "ready"; message: Message; author: MessageAuthor };

interface ReportRowProps {
  report: Report;
  /** Solo en reportes de mensaje. */
  reportedMessage: ReportedMessageState | null;
  channelName: string | null;
  canSanction: boolean;
  isClosing: boolean;
  onGoToMessage?: () => void;
  onOpenProfile?: () => void;
  onOpenSanctions: () => void;
  onResolve: () => void;
  onDismiss: () => void;
}

export function ReportRow({
  report,
  reportedMessage,
  channelName,
  canSanction,
  isClosing,
  onGoToMessage,
  onOpenProfile,
  onOpenSanctions,
  onResolve,
  onDismiss,
}: ReportRowProps) {
  const { detail } = parseReportReason(report.reason);
  const isPending = report.status === "pending";

  return (
    <View className="gap-3 rounded-xl border border-line bg-surface p-4">
      <ReportRowHeading report={report} onOpenProfile={onOpenProfile} />

      {detail ? (
        <Text className="border-l-2 border-line pl-3 text-[14px] leading-5 text-content-muted">
          {detail}
        </Text>
      ) : null}

      {report.kind === "message" ? (
        <View className="gap-1.5">
          <View className="flex-row flex-wrap items-center justify-between gap-x-3">
            <Text className="text-[12px] font-semibold text-content-muted">
              {channelName
                ? reportedMessageIn(channelName)
                : REPORTED_MESSAGE_UNKNOWN_CHANNEL}
            </Text>
            {onGoToMessage ? (
              <LinkAction
                icon="arrow-up-right"
                label={GO_TO_REPORTED_MESSAGE_ACTION}
                onPress={onGoToMessage}
              />
            ) : null}
          </View>
          <ReportedMessage
            state={reportedMessage}
            onOpenProfile={onOpenProfile}
          />
        </View>
      ) : null}

      {isPending ? (
        <View className="gap-2">
          {canSanction ? (
            <RowButton
              icon="alert-triangle"
              label={REPORT_SANCTION_MENU_LABEL}
              tone="danger"
              trailingIcon="chevron-down"
              onPress={onOpenSanctions}
            />
          ) : null}
          <View className="flex-row gap-2">
            <RowButton
              label={DISMISS_REPORT_ACTION}
              tone="neutral"
              isDisabled={isClosing}
              isStretched
              onPress={onDismiss}
            />
            <RowButton
              label={RESOLVE_REPORT_ACTION}
              tone="primary"
              isDisabled={isClosing}
              isLoading={isClosing}
              isStretched
              onPress={onResolve}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function ReportedMessage({
  state,
  onOpenProfile,
}: {
  state: ReportedMessageState | null;
  onOpenProfile?: () => void;
}) {
  if (!state || state.status === "loading") {
    return <View className="h-16 rounded-xl bg-surface-input" />;
  }
  if (state.status === "error" || state.status === "gone") {
    return (
      <Text className="rounded-xl border border-dashed border-line px-3 py-2.5 text-[13px] text-content-subtle">
        {state.status === "gone" ? REPORTED_MESSAGE_GONE : state.message}
      </Text>
    );
  }
  return (
    <ReportTargetPreview
      kind="message"
      message={state.message}
      author={state.author}
      onOpenProfile={onOpenProfile}
    />
  );
}
