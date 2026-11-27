import {
  formatMessageTimestamp,
  parseReportReason,
  type Report,
  REPORT_DISMISSED_BADGE,
  reportedByLabel,
  reportResolvedLabel,
  UNKNOWN_USER_NAME,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../../components/ui/Avatar";
import { cn } from "../../../../lib/cn";
import { withAlpha } from "../../../../lib/color";
import { avatarUriOf } from "../../../../lib/userProfile";
import { useThemeColors } from "../../../../theme/theme-context";

interface ReportRowHeadingProps {
  report: Report;
  onOpenProfile?: () => void;
}

export function ReportRowHeading({
  report,
  onOpenProfile,
}: ReportRowHeadingProps) {
  const reporterName = report.reporter_profile?.name ?? UNKNOWN_USER_NAME;
  const meta = (
    <Text className="text-[12px] text-content-subtle">
      {reportedByLabel(reporterName)} ·{" "}
      {formatMessageTimestamp(report.resolved_at ?? report.created_at)}
    </Text>
  );

  if (report.kind !== "user") {
    return (
      <View className="gap-2">
        <ReportBadges report={report} />
        {meta}
      </View>
    );
  }

  const name = report.reported_profile?.name ?? UNKNOWN_USER_NAME;

  return (
    <View className="gap-2">
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!onOpenProfile}
        onPress={onOpenProfile}
        accessibilityRole={onOpenProfile ? "button" : undefined}
        accessibilityLabel={onOpenProfile ? `Ver perfil de ${name}` : undefined}
        className="flex-row items-center gap-3"
      >
        <Avatar
          name={name}
          uri={avatarUriOf(report.reported_profile)}
          size={40}
        />
        <View className="min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className="text-[15px] font-bold text-content"
          >
            {name}
          </Text>
          {meta}
        </View>
      </TouchableOpacity>
      <ReportBadges report={report} />
    </View>
  );
}

function ReportBadges({ report }: { report: Report }) {
  const colors = useThemeColors();
  const { category } = parseReportReason(report.reason);
  const isPending = report.status === "pending";
  const isResolved = report.status === "resolved";

  if (!category && isPending) return null;

  return (
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
            !isResolved && "bg-surface-input",
          )}
          style={
            isResolved
              ? { backgroundColor: withAlpha(colors.success, 0.15) }
              : undefined
          }
        >
          <Text
            className={cn(
              "text-[12px] font-bold",
              isResolved ? "text-success" : "text-content-muted",
            )}
          >
            {isResolved
              ? reportResolvedLabel(report.resolution_action)
              : REPORT_DISMISSED_BADGE}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
