import {
  type Channel,
  type ClosedReportStatus,
  type Message,
  type Report,
  type ReportSanction,
  reportSanctionTarget,
  REPORTS_CLOSED_TAB,
  REPORTS_DESCRIPTION,
  REPORTS_DISMISSED_EMPTY,
  REPORTS_DISMISSED_FILTER,
  REPORTS_PENDING_EMPTY,
  REPORTS_PENDING_TAB,
  REPORTS_RESOLVED_EMPTY,
  REPORTS_RESOLVED_FILTER,
  REPORTS_TITLE,
  UNKNOWN_USER_NAME,
  unknownAuthor,
} from "@discordia/client-shared";

import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { Pagination } from "../../../../components/ui/Pagination";
import {
  type SegmentedTab,
  SegmentedTabs,
} from "../../../../components/ui/SegmentedTabs";
import { SuccessNotice } from "../../../../components/ui/SuccessNotice";
import { cn } from "../../../../lib/cn";
import { avatarUriOf } from "../../../../lib/userProfile";
import { useThemeColors } from "../../../../theme/theme-context";
import { BanMemberModal } from "../../../bans/components/BanMemberModal";
import { DeleteMessageModal } from "../../../messages/components/DeleteMessageModal";
import { useMessageAuthors } from "../../../messages/useMessageAuthors";
import { KickMemberModal } from "../../../moderation/components/KickMemberModal";
import { MuteMemberModal } from "../../../moderation/components/MuteMemberModal";
import { PublicProfileModal } from "../../../profile/components/PublicProfileModal";
import { useServerMembers } from "../../../servers/useServerMembers";
import { useReportAction } from "../sanction/useReportAction";
import { useReportedMessages } from "./useReportedMessages";
import { type ReportsTab, useReportsList } from "./useReportsList";
import { type ReportedMessageState, ReportRow } from "./ReportRow";
import { ReportSanctionSheet } from "../sanction/ReportSanctionSheet";

const TABS: SegmentedTab<ReportsTab>[] = [
  { value: "pending", label: REPORTS_PENDING_TAB },
  { value: "closed", label: REPORTS_CLOSED_TAB },
];

const CLOSED_FILTERS: { value: ClosedReportStatus; label: string }[] = [
  { value: "resolved", label: REPORTS_RESOLVED_FILTER },
  { value: "dismissed", label: REPORTS_DISMISSED_FILTER },
];

const EMPTY_TEXT = {
  pending: REPORTS_PENDING_EMPTY,
  resolved: REPORTS_RESOLVED_EMPTY,
  dismissed: REPORTS_DISMISSED_EMPTY,
};

interface ReportsStepProps {
  serverId: string;
  ownerId: string;
  currentUserId: string | null;
  channels: Channel[];
  onGoToMessage: (channelId: string, messageId: string) => void;
  /** Se cerro un pendiente: el total de la bandera cambia. */
  onPendingChanged: () => void;
}

/** Configuracion → Reportes (#62). Solo la ven los moderadores. */
export function ReportsStep({
  serverId,
  ownerId,
  currentUserId,
  channels,
  onGoToMessage,
  onPendingChanged,
}: ReportsStepProps) {
  const colors = useThemeColors();
  const list = useReportsList(serverId, onPendingChanged);
  const action = useReportAction(list.close);
  const reported = useReportedMessages(list.reports);
  const members = useServerMembers(serverId);
  const loadedMessages = useMemo(
    () =>
      reported.status === "ready"
        ? Object.values(reported.byId).filter(
            (message): message is Message => message !== null,
          )
        : null,
    [reported],
  );
  const authors = useMessageAuthors(members, loadedMessages, null, []);
  const channelNames = useMemo(
    () => new Map(channels.map((channel) => [channel.id, channel.name])),
    [channels],
  );
  const [sanctionsFor, setSanctionsFor] = useState<{
    report: Report;
    messageState: ReportedMessageState | null;
    available: ReportSanction[];
  } | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  function messageStateOf(report: Report): ReportedMessageState | null {
    if (report.kind !== "message" || !report.message_id) return null;
    if (reported.status !== "ready") return reported;
    const message = reported.byId[report.message_id];
    if (!message) return { status: "gone" };
    return {
      status: "ready",
      message,
      author: authors[message.user_id] ?? unknownAuthor(message.user_id),
    };
  }

  function availableSanctions(
    report: Report,
    messageState: ReportedMessageState | null,
  ): ReportSanction[] {
    const message =
      messageState?.status === "ready" ? messageState.message : null;
    const target = reportSanctionTarget(report, message?.user_id ?? null, {
      currentUserId,
      ownerId,
    });
    const sanctions: ReportSanction[] = message ? ["delete"] : [];
    return target ? [...sanctions, "mute", "kick", "ban"] : sanctions;
  }

  function startSanction(
    report: Report,
    messageState: ReportedMessageState | null,
    sanction: ReportSanction,
  ) {
    if (messageState?.status === "ready") {
      const { message, author } = messageState;
      if (sanction === "delete") {
        action.start({ sanction, report, message, author });
        return;
      }
      action.start({
        sanction,
        report,
        target: {
          userId: message.user_id,
          name: author.name,
          avatarUri: author.avatarUrl,
        },
      });
      return;
    }
    if (sanction === "delete" || !report.reported_user_id) return;
    action.start({
      sanction,
      report,
      target: {
        userId: report.reported_user_id,
        name: report.reported_profile?.name ?? UNKNOWN_USER_NAME,
        avatarUri: avatarUriOf(report.reported_profile),
      },
    });
  }

  const active = action.active;

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4.5 pt-5 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-[14px] leading-5 text-content-muted">
          {REPORTS_DESCRIPTION}
        </Text>

        <SegmentedTabs
          tabs={TABS}
          value={list.tab}
          onChange={list.setTab}
          label={REPORTS_TITLE}
        />

        {list.tab === "pending" ? null : (
          <View className="flex-row gap-2">
            {CLOSED_FILTERS.map((filter) => {
              const isSelected = list.closedFilter === filter.value;
              return (
                <TouchableOpacity
                  key={filter.value}
                  activeOpacity={0.7}
                  onPress={() => list.setClosedFilter(filter.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  className={cn(
                    "rounded-full border px-3 py-1.5",
                    isSelected ? "border-accent bg-accent/15" : "border-line",
                  )}
                >
                  <Text
                    className={cn(
                      "text-[13px] font-semibold",
                      isSelected ? "text-content" : "text-content-muted",
                    )}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {action.notice?.tone === "success" ? (
          <SuccessNotice message={action.notice.text} />
        ) : (
          <FormErrorBanner message={action.notice?.text} />
        )}
        <FormErrorBanner message={list.loadError} />

        {list.reports === null ? (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color={colors.accentBright} />
          </View>
        ) : list.reports.length === 0 && !list.loadError ? (
          <Text className="py-6 text-center text-[14px] text-content-subtle">
            {EMPTY_TEXT[list.status]}
          </Text>
        ) : (
          <View className="gap-3">
            {list.reports.map((report) => {
              const messageState = messageStateOf(report);
              const { channel_id: channelId, message_id: messageId } = report;
              const reportedUserId = report.reported_user_id;
              const isPending = report.status === "pending";
              const available = availableSanctions(report, messageState);
              return (
                <ReportRow
                  key={report.id}
                  report={report}
                  reportedMessage={messageState}
                  channelName={
                    channelId ? (channelNames.get(channelId) ?? null) : null
                  }
                  canSanction={available.length > 0}
                  isClosing={action.closingId === report.id}
                  onGoToMessage={
                    isPending &&
                    messageState?.status === "ready" &&
                    channelId &&
                    messageId
                      ? () => onGoToMessage(channelId, messageId)
                      : undefined
                  }
                  onViewProfile={
                    isPending && reportedUserId
                      ? () => setProfileUserId(reportedUserId)
                      : undefined
                  }
                  onOpenSanctions={() =>
                    setSanctionsFor({ report, messageState, available })
                  }
                  onResolve={() =>
                    void action.closeManually(report, "resolved")
                  }
                  onDismiss={() =>
                    void action.closeManually(report, "dismissed")
                  }
                />
              );
            })}
          </View>
        )}

        {list.pageCount > 1 ? (
          <Pagination
            page={list.page}
            pageCount={list.pageCount}
            onPageChange={list.setPage}
          />
        ) : null}
      </ScrollView>

      <ReportSanctionSheet
        available={sanctionsFor?.available ?? null}
        onChoose={(sanction) => {
          if (sanctionsFor) {
            startSanction(
              sanctionsFor.report,
              sanctionsFor.messageState,
              sanction,
            );
          }
        }}
        onClose={() => setSanctionsFor(null)}
      />

      <DeleteMessageModal
        visible={active?.sanction === "delete"}
        message={active?.sanction === "delete" ? active.message : null}
        author={active?.sanction === "delete" ? active.author : null}
        onConfirm={() => void action.confirmDelete()}
        onCancel={action.cancel}
      />
      {active?.sanction === "mute" ? (
        <MuteMemberModal
          serverId={serverId}
          target={active.target}
          onClose={action.cancel}
          onMuted={action.sanctionApplied}
        />
      ) : null}
      {active?.sanction === "kick" ? (
        <KickMemberModal
          serverId={serverId}
          target={active.target}
          onClose={action.cancel}
          onKicked={action.sanctionApplied}
        />
      ) : null}
      {active?.sanction === "ban" ? (
        <BanMemberModal
          serverId={serverId}
          target={active.target}
          onClose={action.cancel}
          onBanned={action.sanctionApplied}
        />
      ) : null}

      <PublicProfileModal
        visible={profileUserId !== null}
        userId={profileUserId}
        serverId={serverId}
        onClose={() => setProfileUserId(null)}
      />
    </>
  );
}
