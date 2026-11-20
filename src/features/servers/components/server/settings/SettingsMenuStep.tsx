import {
  BANS_SECTION_SUBTITLE,
  BANS_SECTION_TITLE,
  BOOSTS_SECTION_SUBTITLE,
  BOOSTS_SECTION_TITLE,
  EMOJIS_SECTION_SUBTITLE,
  EMOJIS_SECTION_TITLE,
  emojiSlotsBadge,
  MODERATION_AUDIT_DESCRIPTION,
  MODERATION_AUDIT_TITLE,
  pendingReportsLabel,
  REPORTS_DESCRIPTION,
  REPORTS_TITLE,
  ROLES_SECTION_SUBTITLE,
  ROLES_SECTION_TITLE,
  type ServerSummary,
  WORD_FILTER_TITLE,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { type ComponentProps, type ReactElement, type ReactNode } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../../../components/ui/Avatar";
import { cn } from "../../../../../lib/cn";
import { useThemeColors } from "../../../../../theme/theme-context";
import { BoostsSectionIcon } from "../../../../boosts/components/BoostsSectionIcon";
import { useServerEmojis } from "../../../../emojis/useServerEmojis";
import { ReportsBadge } from "../../../../reports/components/shared/ReportsBadge";
import { resolveServerIconUrl } from "../../../api";
import type { SettingsStep } from "./SettingsHeader";
import { MenuGroupLabel } from "../../../../../components/ui/MenuGroupLabel";

type FeatherIconName = ComponentProps<typeof Feather>["name"];

function SettingsRow({
  icon,
  title,
  subtitle,
  danger,
  badge,
  onPress,
}: {
  /** Nombre de un icono de Feather, o un icono propio ya dibujado. */
  icon: FeatherIconName | ReactElement;
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
      className="mb-3 flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4"
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        className={cn(
          "w-11 h-11 rounded-xl items-center justify-center",
          danger ? "bg-danger/15" : "bg-info/15",
        )}
      >
        {typeof icon === "string" ? (
          <Feather
            name={icon}
            size={20}
            color={danger ? colors.danger : colors.sky}
          />
        ) : (
          icon
        )}
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
  canManageRoles: boolean;
  canBanMembers: boolean;
  pendingReports: number;
  onSelect: (step: Exclude<SettingsStep, "menu">) => void;
}

export function SettingsMenuStep({
  server,
  isOwner,
  canManageServer,
  canManageMessages,
  canReviewReports,
  canManageRoles,
  canBanMembers,
  pendingReports,
  onSelect,
}: SettingsMenuStepProps) {
  const { page } = useServerEmojis(server.id);
  const emojiBadgeText = page
    ? emojiSlotsBadge(page.emojis.length, page.max_emojis)
    : undefined;

  return (
    <ScrollView className="flex-1" contentContainerClassName="px-4.5 pb-6">
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

      <MenuGroupLabel>Servidor</MenuGroupLabel>
      {canManageServer ? (
        <SettingsRow
          icon="edit-2"
          title="Perfil del servidor"
          subtitle="Banner, ícono y nombre"
          onPress={() => onSelect("profile")}
        />
      ) : null}
      <SettingsRow
        icon={<BoostsSectionIcon size={22} />}
        title={BOOSTS_SECTION_TITLE}
        subtitle={BOOSTS_SECTION_SUBTITLE}
        onPress={() => onSelect("boosts")}
      />
      <SettingsRow
        icon="smile"
        title={EMOJIS_SECTION_TITLE}
        subtitle={EMOJIS_SECTION_SUBTITLE}
        badge={
          emojiBadgeText ? (
            <Text className="text-[13px] font-semibold text-content-subtle">
              {emojiBadgeText}
            </Text>
          ) : undefined
        }
        onPress={() => onSelect("emojis")}
      />
      {canManageRoles || canBanMembers ? (
        <MenuGroupLabel>Miembros</MenuGroupLabel>
      ) : null}
      {canManageRoles ? (
        <SettingsRow
          icon="shield"
          title={ROLES_SECTION_TITLE}
          subtitle={ROLES_SECTION_SUBTITLE}
          onPress={() => onSelect("roles")}
        />
      ) : null}
      {canBanMembers ? (
        <SettingsRow
          icon="shield-off"
          title={BANS_SECTION_TITLE}
          subtitle={BANS_SECTION_SUBTITLE}
          onPress={() => onSelect("bans")}
        />
      ) : null}
      {canManageMessages || canReviewReports ? (
        <MenuGroupLabel>Moderación</MenuGroupLabel>
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
      {canReviewReports ? (
        <SettingsRow
          icon="file-text"
          title={MODERATION_AUDIT_TITLE}
          subtitle={MODERATION_AUDIT_DESCRIPTION}
          onPress={() => onSelect("audit")}
        />
      ) : null}
      {isOwner ? (
        <>
          <View className="mx-1 mb-3 mt-2 h-px bg-line" />
          <SettingsRow
            icon="trash-2"
            title="Eliminar servidor"
            subtitle="Esta acción no se puede deshacer"
            danger
            onPress={() => onSelect("delete")}
          />
        </>
      ) : null}
    </ScrollView>
  );
}
