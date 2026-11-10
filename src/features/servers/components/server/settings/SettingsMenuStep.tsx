import {
  pendingReportsLabel,
  REPORTS_DESCRIPTION,
  REPORTS_TITLE,
  type ServerSummary,
  WORD_FILTER_TITLE,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { type ComponentProps, type ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../../../components/ui/Avatar";
import { cn } from "../../../../../lib/cn";
import { useThemeColors } from "../../../../../theme/theme-context";
import { ReportsBadge } from "../../../../reports/components/shared/ReportsBadge";
import { resolveServerIconUrl } from "../../../api";
import type { SettingsStep } from "./SettingsHeader";

type FeatherIconName = ComponentProps<typeof Feather>["name"];

function SettingsRow({
  icon,
  title,
  subtitle,
  danger,
  badge,
  onPress,
}: {
  icon: FeatherIconName;
  title: string;
  subtitle: string;
  danger?: boolean;
  /** Va antes de la flecha (por ejemplo, los reportes pendientes). */
  badge?: ReactNode;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4"
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        className={cn(
          "w-11 h-11 rounded-xl items-center justify-center",
          danger ? "bg-[rgba(224,82,82,0.14)]" : "bg-[rgba(36,92,107,0.3)]",
        )}
      >
        <Feather
          name={icon}
          size={20}
          color={danger ? colors.danger : colors.sky}
        />
      </View>
      <View className="flex-1">
        <Text
          className={cn(
            "text-[16px] font-bold mb-0.5",
            danger ? "text-danger" : "text-content",
          )}
        >
          {title}
        </Text>
        <Text className="text-[13px] text-content-subtle">{subtitle}</Text>
      </View>
      {badge}
      <Feather name="chevron-right" size={18} color={colors.textSubtle} />
    </TouchableOpacity>
  );
}

interface SettingsMenuStepProps {
  server: ServerSummary;
  isOwner: boolean;
  canManageServer: boolean;
  canManageMessages: boolean;
  /** Moderador (`MANAGE_MESSAGES` + `KICK_MEMBERS` + `BAN_MEMBERS`). */
  canReviewReports: boolean;
  pendingReports: number;
  onSelect: (step: Exclude<SettingsStep, "menu">) => void;
}

export function SettingsMenuStep({
  server,
  isOwner,
  canManageServer,
  canManageMessages,
  canReviewReports,
  pendingReports,
  onSelect,
}: SettingsMenuStepProps) {
  return (
    <View className="px-4.5 gap-3">
      <View className="items-center pt-7 pb-6">
        <Avatar
          name={server.name}
          uri={resolveServerIconUrl(server.icon_url)}
          size={80}
          borderRadius={24}
        />
        <Text
          className="text-[18px] font-bold text-content mt-3"
          numberOfLines={1}
        >
          {server.name}
        </Text>
      </View>

      {canManageServer ? (
        <SettingsRow
          icon="edit-2"
          title="Perfil del servidor"
          subtitle="Banner, ícono y nombre"
          onPress={() => onSelect("profile")}
        />
      ) : null}
      {canManageMessages ? (
        <SettingsRow
          icon="slash"
          title={WORD_FILTER_TITLE}
          subtitle="Mensajes que no se pueden enviar"
          onPress={() => onSelect("words")}
        />
      ) : null}
      {canReviewReports ? (
        <SettingsRow
          icon="flag"
          title={REPORTS_TITLE}
          subtitle={REPORTS_DESCRIPTION}
          badge={
            pendingReports > 0 ? (
              <ReportsBadge
                count={pendingReports}
                label={pendingReportsLabel(pendingReports, server.name)}
              />
            ) : undefined
          }
          onPress={() => onSelect("reports")}
        />
      ) : null}
      {isOwner ? (
        <>
          <View className="h-px bg-line mx-1 my-1" />
          <SettingsRow
            icon="trash-2"
            title="Eliminar servidor"
            subtitle="Esta acción no se puede deshacer"
            danger
            onPress={() => onSelect("delete")}
          />
        </>
      ) : null}
    </View>
  );
}
