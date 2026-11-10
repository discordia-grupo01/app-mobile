import {
  DISMISS_REPORT_ACTION,
  formatMessageTimestamp,
  GO_TO_REPORTED_MESSAGE_ACTION,
  type Message,
  type MessageAuthor,
  parseReportReason,
  type Report,
  REPORT_DISMISSED_BADGE,
  REPORT_SANCTION_MENU_LABEL,
  REPORTED_MESSAGE_GONE,
  REPORTED_MESSAGE_UNKNOWN_CHANNEL,
  reportedByLabel,
  reportedMessageIn,
  reportResolvedLabel,
  RESOLVE_REPORT_ACTION,
  UNKNOWN_USER_NAME,
  VIEW_PROFILE_LABEL,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { type ComponentProps } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { withAlpha } from "../../../../lib/color";
import { avatarUriOf } from "../../../../lib/userProfile";
import { useThemeColors } from "../../../../theme/theme-context";
import { ReportTargetPreview } from "../shared/ReportTargetPreview";

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
  onViewProfile?: () => void;
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
  onViewProfile,
  onOpenSanctions,
  onResolve,
  onDismiss,
}: ReportRowProps) {
  const colors = useThemeColors();
  const { category, detail } = parseReportReason(report.reason);
  const isPending = report.status === "pending";
  const hasLinks = onGoToMessage !== undefined || onViewProfile !== undefined;
  const reporterName = report.reporter_profile?.name ?? UNKNOWN_USER_NAME;

  return (
    <View className="gap-3 rounded-xl border border-line bg-surface p-4">
      <View className="flex-row flex-wrap items-center gap-1.5">
        {category ? (
          <View
            className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ backgroundColor: withAlpha(colors.warning, 0.15) }}
          >
            <Feather name="flag" size={14} color={colors.warning} />
            <Text className="text-[12px] font-bold text-warning">
              {category.label}
            </Text>
          </View>
        ) : null}
        {!isPending ? (
          <View
            className={cn(
              "rounded-full px-2.5 py-1",
              report.status !== "resolved" && "bg-surface-input",
            )}
            style={
              report.status === "resolved"
                ? { backgroundColor: withAlpha(colors.success, 0.15) }
                : undefined
            }
          >
            <Text
              className={cn(
                "text-[12px] font-bold",
                report.status === "resolved"
                  ? "text-success"
                  : "text-content-muted",
              )}
            >
              {report.status === "resolved"
                ? reportResolvedLabel(report.resolution_action)
                : REPORT_DISMISSED_BADGE}
            </Text>
          </View>
        ) : null}
      </View>
      <Text className="-mt-1.5 text-[12px] text-content-subtle">
        {reportedByLabel(reporterName)} ·{" "}
        {formatMessageTimestamp(report.resolved_at ?? report.created_at)}
      </Text>

      {detail ? (
        <Text className="text-[14px] leading-5 text-content">{detail}</Text>
      ) : null}

      {report.kind === "message" ? (
        <View className="gap-1.5">
          <Text className="text-[12px] font-semibold text-content-muted">
            {channelName
              ? reportedMessageIn(channelName)
              : REPORTED_MESSAGE_UNKNOWN_CHANNEL}
          </Text>
          <ReportedMessage state={reportedMessage} />
        </View>
      ) : (
        <ReportTargetPreview
          kind="user"
          name={report.reported_profile?.name ?? UNKNOWN_USER_NAME}
          avatarUri={avatarUriOf(report.reported_profile)}
        />
      )}

      {hasLinks ? (
        <View className="-mt-1 flex-row flex-wrap gap-x-5 gap-y-1">
          {onGoToMessage ? (
            <LinkAction
              icon="arrow-up-right"
              label={GO_TO_REPORTED_MESSAGE_ACTION}
              onPress={onGoToMessage}
            />
          ) : null}
          {onViewProfile ? (
            <LinkAction
              icon="user"
              label={VIEW_PROFILE_LABEL}
              onPress={onViewProfile}
            />
          ) : null}
        </View>
      ) : null}

      {isPending ? (
        <View className="gap-3 border-t border-line pt-4">
          {canSanction ? (
            <RowButton
              icon="alert-triangle"
              label={REPORT_SANCTION_MENU_LABEL}
              tone="danger"
              trailingIcon="chevron-down"
              onPress={onOpenSanctions}
            />
          ) : null}
          <View className="flex-row gap-3">
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

type FeatherIconName = ComponentProps<typeof Feather>["name"];

/** Ir al mensaje / Ver perfil: llevan a otro lado, no cierran el reporte. */
function LinkAction({
  icon,
  label,
  onPress,
}: {
  icon: FeatherIconName;
  label: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="link"
      className="min-h-8 flex-row items-center gap-1.5"
    >
      <Feather name={icon} size={15} color={colors.accentBright} />
      <Text className="text-[13px] font-semibold text-accent-strong">
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const BUTTON_TONE = {
  danger: "border",
  neutral: "border border-line",
  primary: "bg-accent",
} as const;

const BUTTON_TEXT_TONE = {
  danger: "text-danger",
  neutral: "text-content-muted",
  primary: "text-on-accent",
} as const;

function RowButton({
  icon,
  trailingIcon,
  label,
  tone,
  isDisabled = false,
  isLoading = false,
  isStretched = false,
  onPress,
}: {
  icon?: FeatherIconName;
  trailingIcon?: FeatherIconName;
  label: string;
  tone: keyof typeof BUTTON_TONE;
  isDisabled?: boolean;
  isLoading?: boolean;
  isStretched?: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const iconColor =
    tone === "danger"
      ? colors.danger
      : tone === "primary"
        ? colors.onAccent
        : colors.textMuted;

  const tintStyle =
    tone === "danger"
      ? {
          borderColor: withAlpha(colors.danger, 0.4),
          backgroundColor: withAlpha(colors.danger, 0.08),
        }
      : undefined;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={tintStyle}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      className={cn(
        "min-h-11 flex-row items-center justify-center gap-1.5 rounded-lg px-3",
        BUTTON_TONE[tone],
        isStretched && "flex-1",
        isDisabled && "opacity-50",
      )}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : icon ? (
        <Feather name={icon} size={14} color={iconColor} />
      ) : null}
      <Text
        numberOfLines={1}
        className={cn("text-[13px] font-semibold", BUTTON_TEXT_TONE[tone])}
      >
        {label}
      </Text>
      {trailingIcon ? (
        <Feather name={trailingIcon} size={14} color={iconColor} />
      ) : null}
    </TouchableOpacity>
  );
}

function ReportedMessage({ state }: { state: ReportedMessageState | null }) {
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
    />
  );
}
