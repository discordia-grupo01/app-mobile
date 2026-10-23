import {
  BAN_ACTION_LABEL,
  BAN_REVOKE_LABEL,
  BANS_MEMBERS_HINT,
  BANS_REVOKE_HINT,
  BANS_SUBTITLE,
  BANS_TITLE,
  displayNameOf,
  unbanSuccessNotice,
  type UserListItem,
} from "@discordia/client-shared";

import { useState } from "react";
import { ActivityIndicator, ScrollView, Text } from "react-native";

import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { ModalShell } from "../../../components/ui/ModalShell";
import { PaginationFooter } from "../../../components/ui/PaginationFooter";
import { SuccessNotice } from "../../../components/ui/SuccessNotice";
import { avatarUriOf } from "../../../lib/userProfile";
import { useThemeColors } from "../../../theme/theme-context";
import { PublicProfileModal } from "../../profile/components/PublicProfileModal";
import { type BansTab, type BanTarget } from "../types";
import { useBansListView } from "../useBansListView";
import { BanIcon } from "./BanIcon";
import { BanMemberModal } from "./BanMemberModal";
import { BanModalHeader } from "./BanModalHeader";
import { BansToolbar } from "./BansToolbar";
import { ModalCloseButton } from "../../../components/ui/ModalCloseButton";
import { type UserRowAction } from "./RowActionButton";
import { UserList } from "./UserList";

interface BansModalProps {
  serverId: string;
  ownerId: string;
  currentUserId: string | null;
  canManageRoles: boolean;
  onClose: () => void;
}

/**
 * Moderacion del servidor en dos pestañas: los baneados (con su revocacion) y
 * los miembros que se pueden banear. Se monta solo mientras esta abierto. El
 * perfil y la confirmacion de baneo se abren anidados, encima de este modal,
 * porque iOS no deja presentar dos modales hermanos a la vez.
 */
export function BansModal({
  serverId,
  ownerId,
  currentUserId,
  canManageRoles,
  onClose,
}: BansModalProps) {
  const colors = useThemeColors();
  const [notice, setNotice] = useState("");
  const [revokeError, setRevokeError] = useState("");
  const [revokingUserId, setRevokingUserId] = useState<string | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [banTarget, setBanTarget] = useState<BanTarget | null>(null);

  const view = useBansListView({ serverId, ownerId, currentUserId });
  const { pagination } = view;

  function handleTabChange(next: BansTab) {
    view.changeTab(next);
    setNotice("");
    setRevokeError("");
  }

  async function handleRevoke({ userId, profile }: UserListItem) {
    setNotice("");
    setRevokeError("");
    setRevokingUserId(userId);
    const result = await view.unban(userId);
    setRevokingUserId(null);
    if (!result.ok) {
      setRevokeError(result.message);
      return;
    }
    setNotice(unbanSuccessNotice(displayNameOf(profile)));
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
    <ModalShell visible onClose={onClose} className="h-[90%] max-w-[680px]">
      <ModalCloseButton variant="subtle" onPress={onClose} />
      <BanModalHeader title={BANS_TITLE} subtitle={BANS_SUBTITLE} />

      <BansToolbar
        tab={view.tab}
        onTabChange={handleTabChange}
        bansCount={view.bansCount}
        search={view.search}
        onSearchChange={view.changeSearch}
        results={
          view.isSearching && view.matchCount !== null
            ? {
                matches: view.matchCount,
                total: view.items?.length ?? 0,
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

        {notice ? <SuccessNotice message={notice} /> : null}
        <FormErrorBanner message={view.errorMessage || revokeError} />

        {view.items === null ? (
          <ActivityIndicator
            accessibilityLabel="Cargando"
            color={colors.accentBright}
            className="py-10"
          />
        ) : (
          <UserList
            items={pagination.pageItems}
            emptyMessage={view.emptyMessage}
            actionsFor={actionsFor}
            onSelect={view.isBans ? undefined : handleSelect}
            disableActions={revokingUserId !== null}
          />
        )}
      </ScrollView>

      {pagination.total > 0 ? (
        <PaginationFooter
          page={pagination.page}
          pageCount={pagination.pageCount}
          range={pagination.range}
          total={pagination.total}
          noun={view.isSearching ? "resultados" : view.noun}
          onPageChange={pagination.setPage}
        />
      ) : null}

      <PublicProfileModal
        visible={viewingUserId !== null}
        userId={viewingUserId}
        serverId={serverId}
        canManageRoles={canManageRoles}
        canBan
        onBanned={view.reload}
        onClose={() => setViewingUserId(null)}
      />

      {banTarget ? (
        <BanMemberModal
          serverId={serverId}
          target={banTarget}
          onClose={() => setBanTarget(null)}
          onBanned={view.reload}
        />
      ) : null}
    </ModalShell>
  );
}
