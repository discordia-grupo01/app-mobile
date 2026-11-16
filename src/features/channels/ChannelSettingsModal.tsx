import {
  canViewChannelWithDraft,
  type Channel,
  CHANNEL_PERMISSIONS_TITLE,
  CHANNEL_SETTINGS_OVERVIEW_SECTION,
  channelPermissionsSubtitle,
  DELETE_CHANNEL_LABEL,
  LOSE_CHANNEL_ACCESS_BODY,
  LOSE_CHANNEL_ACCESS_CONFIRM,
  LOSE_CHANNEL_ACCESS_TITLE,
  type Role,
  SAVE_CHANGES_LABEL,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { type ComponentProps, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { Button } from "../../components/ui/Button";
import { FormErrorBanner } from "../../components/ui/FormErrorBanner";
import { ModalShell } from "../../components/ui/ModalShell";
import { cn } from "../../lib/cn";
import { withAlpha } from "../../lib/color";
import { useThemeColors } from "../../theme/theme-context";
import { useChannelOverrides } from "./useChannelOverrides";
import { ChannelOverviewStep } from "./components/overview/ChannelOverviewStep";
import { ChannelPermissionsStep } from "./components/permissions/ChannelPermissionsStep";
import { useChannelOverviewForm } from "./components/overview/useChannelOverviewForm";
import { useModalInsets } from "../platform-status/hooks/useModalInsets";

export type ChannelSettingsSection = "overview" | "permissions";
type SettingsStep = "list" | ChannelSettingsSection;
type FeatherIconName = ComponentProps<typeof Feather>["name"];

const SETTINGS_TITLE = "Configuración del canal";

function SettingsRow({
  icon,
  title,
  subtitle,
  danger,
  onPress,
}: {
  icon: FeatherIconName;
  title: string;
  subtitle?: string;
  danger?: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center gap-3 px-7 py-3.5"
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        className={cn(
          "w-9 h-9 rounded-xl items-center justify-center",
          !danger && "bg-surface-raised",
        )}
        style={
          danger ? { backgroundColor: withAlpha(colors.danger, 0.14) } : null
        }
      >
        <Feather
          name={icon}
          size={16}
          color={danger ? colors.danger : colors.text}
        />
      </View>
      <View className="flex-1">
        <Text
          className={cn(
            "text-[14px] font-semibold",
            danger ? "text-danger" : "text-content",
          )}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-[12px] text-content-subtle mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={16} color={colors.textSubtle} />
    </TouchableOpacity>
  );
}

interface ChannelSettingsModalProps {
  channel: Channel;
  categoryName: string | null;
  initialSection: ChannelSettingsSection;
  /** MANAGE_CHANNELS: nombre, tema y eliminar. */
  canManageChannel: boolean;
  /** MANAGE_ROLES: excepciones de permisos del canal. */
  canManagePermissions: boolean;
  isOwner: boolean;
  /** Roles del usuario actual, @everyone incluido. */
  myRoles: readonly Role[];
  serverRoles: readonly Role[];
  onClose: () => void;
  onChannelUpdated: (channel: Channel) => void;
  /** Se guardaron excepciones: la lista de canales visibles puede cambiar. */
  onPermissionsSaved: () => void;
  onDelete: () => void;
}

export function ChannelSettingsModal({
  channel,
  categoryName,
  initialSection,
  canManageChannel,
  canManagePermissions,
  isOwner,
  myRoles,
  serverRoles,
  onClose,
  onChannelUpdated,
  onPermissionsSaved,
  onDelete,
}: ChannelSettingsModalProps) {
  const colors = useThemeColors();
  const insets = useModalInsets();
  const { height: windowHeight } = useWindowDimensions();

  const canOpen = (section: ChannelSettingsSection) =>
    section === "overview" ? canManageChannel : canManagePermissions;
  const [step, setStep] = useState<SettingsStep>(
    canOpen(initialSection) ? initialSection : "list",
  );
  /** Dentro de "permissions": el rol cuyo panel esta abierto. */
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  const everyoneRoleId =
    serverRoles.find((role) => role.is_everyone)?.id ?? null;
  const overview = useChannelOverviewForm(channel);
  const overrides = useChannelOverrides(
    channel.id,
    everyoneRoleId,
    canManagePermissions,
  );
  const editingRole =
    step === "permissions" && editingRoleId && overrides.draft?.[editingRoleId]
      ? (serverRoles.find((role) => role.id === editingRoleId) ?? null)
      : null;

  const actor = useMemo(
    () => ({
      isOwner,
      roles: [...myRoles],
      serverPermissions: myRoles.flatMap((role) => role.permissions),
    }),
    [isOwner, myRoles],
  );

  const hasOverviewChanges = canManageChannel && overview.hasChanges;
  const hasChanges = hasOverviewChanges || overrides.hasChanges;
  const isSaving = overrides.isSaving || overview.isSaving;
  const channelName = overview.name.trim() || channel.name;
  const [saveError, setSaveError] = useState("");

  function losesAccess(): boolean {
    if (!overrides.hasChanges || !overrides.draft || !everyoneRoleId) {
      return false;
    }
    return !canViewChannelWithDraft(
      overrides.draft,
      {
        isOwner,
        serverPermissions: actor.serverPermissions,
        roleIds: myRoles.map((role) => role.id),
      },
      everyoneRoleId,
    );
  }

  function requestSave() {
    setSaveError("");
    if (hasOverviewChanges && !overview.validate()) {
      setStep("overview");
      return;
    }
    if (losesAccess()) {
      Alert.alert(LOSE_CHANNEL_ACCESS_TITLE, LOSE_CHANNEL_ACCESS_BODY, [
        { text: "Cancelar", style: "cancel" },
        {
          text: LOSE_CHANNEL_ACCESS_CONFIRM,
          style: "destructive",
          onPress: () => void save(),
        },
      ]);
      return;
    }
    void save();
  }

  async function save() {
    if (hasOverviewChanges) {
      const result = await overview.save();
      if (!result.ok) {
        setStep("overview");
        if (result.message) setSaveError(result.message);
        return;
      }
      onChannelUpdated(result.channel);
    }

    if (overrides.hasChanges) {
      const failures = await overrides.save();
      if (failures.length > 0) {
        setStep("permissions");
        setEditingRoleId(failures[0].roleId);
        setSaveError(failures[0].message);
        return;
      }
      onPermissionsSaved();
    }

    onClose();
  }

  const title =
    step === "list"
      ? SETTINGS_TITLE
      : step === "overview"
        ? CHANNEL_SETTINGS_OVERVIEW_SECTION
        : (editingRole?.name ?? CHANNEL_PERMISSIONS_TITLE);

  function goBack() {
    setSaveError("");
    if (editingRole) {
      setEditingRoleId(null);
      return;
    }
    setStep("list");
  }

  return (
    <ModalShell
      visible
      onClose={onClose}
      dismissOnBackdrop={!isSaving}
      className="max-w-115"
      style={{ maxHeight: windowHeight - insets.top - insets.bottom - 48 }}
    >
      <View className="flex-row items-center gap-2 px-3 py-3 border-b border-b-line">
        {step !== "list" ? (
          <TouchableOpacity
            onPress={goBack}
            className="w-8 h-8 rounded-2xl items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Feather name="chevron-left" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <View className="w-8 h-8 rounded-2xl items-center justify-center">
            <Feather name="settings" size={16} color={colors.text} />
          </View>
        )}
        <Text
          className="flex-1 text-center text-[15px] font-bold text-content"
          numberOfLines={1}
        >
          {title}
        </Text>
        <TouchableOpacity
          onPress={onClose}
          disabled={isSaving}
          className="w-8 h-8 rounded-2xl items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        >
          <Feather name="x" size={16} color={colors.textSubtle} />
        </TouchableOpacity>
      </View>

      {step === "list" ? (
        <View className="pb-2">
          <View className="items-center pt-6 pb-4 px-7">
            <View className="w-14 h-14 rounded-2xl items-center justify-center bg-surface-raised">
              <Feather
                name={channel.kind === "text" ? "hash" : "volume-2"}
                size={24}
                color={colors.text}
              />
            </View>
            <Text
              className="text-[14px] font-bold text-content mt-2.5"
              numberOfLines={1}
            >
              {channelName}
            </Text>
            {categoryName ? (
              <Text
                className="text-[12px] text-content-subtle mt-0.5"
                numberOfLines={1}
              >
                {categoryName}
              </Text>
            ) : null}
          </View>
          <View className="h-px bg-line mx-7 mb-2" />

          {canManageChannel ? (
            <SettingsRow
              icon="edit-2"
              title={CHANNEL_SETTINGS_OVERVIEW_SECTION}
              subtitle="Nombre y tema del canal"
              onPress={() => setStep("overview")}
            />
          ) : null}
          {canManagePermissions ? (
            <SettingsRow
              icon="shield"
              title={CHANNEL_PERMISSIONS_TITLE}
              subtitle="Qué puede hacer cada rol en este canal"
              onPress={() => setStep("permissions")}
            />
          ) : null}
          {canManageChannel ? (
            <>
              <View className="h-px bg-line mx-7 my-2" />
              <SettingsRow
                icon="trash-2"
                title={DELETE_CHANNEL_LABEL}
                subtitle="Esta acción no se puede deshacer"
                danger
                onPress={onDelete}
              />
            </>
          ) : null}
        </View>
      ) : (
        <>
          <ScrollView
            // Al entrar o salir del panel de un rol, que arranque desde arriba.
            key={editingRole?.id ?? step}
            contentContainerClassName="px-7 pt-5 pb-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {editingRole ? null : (
              <Text className="text-[13px] leading-[19px] text-content-muted mb-5">
                {step === "overview"
                  ? `#${channelName}`
                  : channelPermissionsSubtitle(channelName)}
              </Text>
            )}

            <FormErrorBanner message={saveError} />

            {step === "overview" ? (
              <ChannelOverviewStep kind={channel.kind} form={overview} />
            ) : (
              <ChannelPermissionsStep
                channelKind={channel.kind}
                overrides={overrides}
                serverRoles={serverRoles}
                actor={actor}
                editingRoleId={editingRoleId}
                onEditingRoleChange={(roleId) => {
                  setSaveError("");
                  setEditingRoleId(roleId);
                }}
              />
            )}
          </ScrollView>

          <View className="flex-row gap-3 px-7 py-5 border-t border-t-line">
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={onClose}
              disabled={isSaving}
              style={{ flex: 1, width: undefined }}
            />
            <Button
              title={SAVE_CHANGES_LABEL}
              onPress={requestSave}
              disabled={!hasChanges}
              isLoading={isSaving}
              style={{ flex: 1, width: undefined }}
            />
          </View>
        </>
      )}
    </ModalShell>
  );
}
