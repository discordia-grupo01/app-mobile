import {
  BAN_MEMBER_TITLE,
  BANS_REVOKE_HINT,
  BANS_SECTION_SUBTITLE,
  banSuccessNotice,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { type ReactNode, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { Toast } from "../../../components/ui/Toast";
import { useToast } from "../../../hooks/useToast";
import { useThemeColors } from "../../../theme/theme-context";
import { PublicProfileModal } from "../../profile/components/PublicProfileModal";
import { useBanRowActions } from "../useBanRowActions";
import { useBansListView } from "../useBansListView";
import { BanMemberModal } from "./BanMemberModal";
import { BansListSection } from "./BansListSection";
import { BansToolbar } from "./BansToolbar";

export interface BansHeaderInfo {
  isPicking: boolean;
  /** En la lista es `onExit`, si quien lo monta tiene adonde volver. */
  onBack: (() => void) | undefined;
}

export interface BansPanelProps {
  serverId: string;
  ownerId: string;
  currentUserId: string | null;
  canManageRoles: boolean;
  renderHeader: (info: BansHeaderInfo) => ReactNode;
  onExit?: () => void;
}

/**
 * Los baneados del servidor y, en otro paso, la eleccion del miembro a banear.
 * El perfil y la confirmacion de baneo se abren anidados, dentro de quien lo
 * monta, porque iOS no deja presentar dos modales hermanos a la vez.
 */
export function BansPanel({
  serverId,
  ownerId,
  currentUserId,
  canManageRoles,
  renderHeader,
  onExit,
}: BansPanelProps) {
  const colors = useThemeColors();
  const { toast, showToast } = useToast();
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  const view = useBansListView({ serverId, ownerId, currentUserId });
  const rows = useBanRowActions({
    isBans: view.isBans,
    unban: view.unban,
    showToast,
  });
  const { banTarget } = rows;

  function openPicker() {
    rows.clearRevokeError();
    view.changeTab("members");
  }

  function handleBanned(name: string) {
    view.reload();
    view.changeTab("bans");
    showToast(banSuccessNotice(name));
  }

  return (
    <View className="min-h-0 flex-1">
      {renderHeader({
        isPicking: !view.isBans,
        onBack: view.isBans ? onExit : () => view.changeTab("bans"),
      })}

      <BansToolbar
        isBans={view.isBans}
        search={view.search}
        onSearchChange={view.changeSearch}
        results={
          view.isBans && view.isSearching
            ? { matches: view.matches, total: view.count ?? 0, noun: view.noun }
            : null
        }
      />

      <ScrollView
        className="min-h-0 flex-1"
        contentContainerClassName="gap-4 px-5 py-4"
        keyboardShouldPersistTaps="handled"
      >
        {view.isBans ? (
          <Button
            title={BAN_MEMBER_TITLE}
            iconLeft={<Feather name="plus" size={18} color={colors.onAccent} />}
            onPress={openPicker}
            fullWidth
          />
        ) : null}

        <BansListSection
          label={view.isBans ? BANS_SECTION_SUBTITLE : "Miembros"}
          count={view.count}
          errorMessage={view.errorMessage || rows.revokeError}
          items={view.items}
          emptyMessage={view.emptyMessage}
          actionsFor={rows.actionsFor}
          onSelect={
            view.isBans ? undefined : ({ userId }) => setViewingUserId(userId)
          }
          disableActions={rows.isRevoking}
          noun={view.noun}
          hasMore={view.hasMore}
          isLoadingMore={view.isLoadingMore}
          onLoadMore={view.loadMore}
        />

        {view.isBans ? (
          <View className="flex-row gap-2">
            <Feather name="info" size={14} color={colors.textMuted} />
            <Text className="flex-1 text-xs leading-[17px] text-content-muted">
              {BANS_REVOKE_HINT}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <PublicProfileModal
        visible={viewingUserId !== null}
        userId={viewingUserId}
        serverId={serverId}
        canManageRoles={canManageRoles}
        canBan
        onBanned={view.reload}
        onClose={() => setViewingUserId(null)}
      />

      <Toast message={toast} />

      {banTarget ? (
        <BanMemberModal
          serverId={serverId}
          target={banTarget}
          onClose={rows.clearBanTarget}
          onBanned={() => handleBanned(banTarget.name)}
        />
      ) : null}
    </View>
  );
}
