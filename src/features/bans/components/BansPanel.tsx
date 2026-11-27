import {
  BAN_ACTION_LABEL,
  BAN_REVOKE_LABEL,
  BANS_MEMBERS_HINT,
  BANS_REVOKE_HINT,
  displayNameOf,
  unbanSuccessNotice,
  banSuccessNotice,
  type UserListItem,
} from "@discordia/client-shared";

import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { PaginationFooter } from "../../../components/ui/PaginationFooter";
import { Toast } from "../../../components/ui/Toast";
import { useToast } from "../../../hooks/useToast";
import { avatarUriOf } from "../../../lib/userProfile";
import { useThemeColors } from "../../../theme/theme-context";
import { PublicProfileModal } from "../../profile/components/PublicProfileModal";
import { type BansTab, type BanTarget } from "../types";
import { useBansListView } from "../useBansListView";
import { BanIcon } from "./BanIcon";
import { BanMemberModal } from "./BanMemberModal";
import { BansToolbar } from "./BansToolbar";
import { type UserRowAction } from "./RowActionButton";
import { UserList } from "./UserList";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";

export interface BansPanelProps {
  serverId: string;
  ownerId: string;
  currentUserId: string | null;
  canManageRoles: boolean;
}

/**
 * Moderacion del servidor en dos pestañas: los baneados (con su revocacion) y
 * los miembros que se pueden banear. El perfil y la confirmacion de baneo se
 * abren anidados, dentro de quien lo monta, porque iOS no deja presentar dos
 * modales hermanos a la vez.
 */
export function BansPanel({
  serverId,
  ownerId,
  currentUserId,
  canManageRoles,
}: BansPanelProps) {
  const colors = useThemeColors();
  const { toast, showToast } = useToast();
  const [revokeError, setRevokeError] = useState("");
  const [revokingUserId, setRevokingUserId] = useState<string | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [banTarget, setBanTarget] = useState<BanTarget | null>(null);

  const view = useBansListView({ serverId, ownerId, currentUserId });
  const { pagination } = view;

  function handleTabChange(next: BansTab) {
    view.changeTab(next);
    setRevokeError("");
  }

  async function handleRevoke({ userId, profile }: UserListItem) {
    setRevokeError("");
    setRevokingUserId(userId);
    const result = await view.unban(userId);
    setRevokingUserId(null);
    if (!result.ok) {
      setRevokeError(result.message);
      return;
    }
    showToast(unbanSuccessNotice(displayNameOf(profile)));
  }

  function handleBanned(name: string) {
    view.reload();
    showToast(banSuccessNotice(name));
  }

  function handleSelect({ userId }: UserListItem) {
    setViewingUserId(userId);
  }

  function actionsFor(item: UserListItem): UserRowAction[] {
    const { userId, profile } = item;
    if (view.isBans) {
      return [
        {
          label: BAN_REVOKE_LABEL,
          isLoading: revokingUserId === userId,
          onPress: () => handleRevoke(item),
        },
      ];
    }
    return [
      {
        label: BAN_ACTION_LABEL,
        tone: "danger",
        icon: <BanIcon size={17} color={colors.danger} />,
        onPress: () =>
          setBanTarget({
            userId,
            name: displayNameOf(profile),
            avatarUri: avatarUriOf(profile),
          }),
      },
    ];
  }

  return (
    <View className="min-h-0 flex-1">
      <BansToolbar
        tab={view.tab}
        onTabChange={handleTabChange}
        bansCount={view.bansCount}
        search={view.search}
        onSearchChange={view.changeSearch}
        results={
          view.isBans && view.isSearching
            ? {
                matches: pagination.total,
                total: view.bansCount,
                noun: view.noun,
              }
            : null
        }
      />

      <ScrollView
        className="min-h-0 flex-1"
        contentContainerClassName="gap-3 px-5 py-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-sm text-content-muted">
          {view.isBans ? BANS_REVOKE_HINT : BANS_MEMBERS_HINT}
        </Text>

        <FormErrorBanner message={view.errorMessage || revokeError} />

        {view.items === null ? (
          <LoadingSpinner />
        ) : (
          <UserList
            items={view.items}
            emptyMessage={view.emptyMessage}
            actionsFor={actionsFor}
            onSelect={view.isBans ? undefined : handleSelect}
            disableActions={revokingUserId !== null}
          />
        )}
        {pagination.pageCount > 1 ? (
          <PaginationFooter
            className="mt-1"
            page={pagination.page}
            pageCount={pagination.pageCount}
            range={pagination.range}
            total={pagination.total}
            noun={view.isSearching ? "resultados" : view.noun}
            onPageChange={pagination.setPage}
          />
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
          onClose={() => setBanTarget(null)}
          onBanned={() => handleBanned(banTarget.name)}
        />
      ) : null}
    </View>
  );
}
