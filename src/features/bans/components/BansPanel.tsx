import { banSuccessNotice } from "@discordia/client-shared";

import { type ReactNode, useState } from "react";
import { View } from "react-native";

import { Toast } from "../../../components/ui/Toast";
import { useToast } from "../../../hooks/useToast";
import { PublicProfileModal } from "../../profile/components/PublicProfileModal";
import { useBanRowActions } from "../useBanRowActions";
import { useBansListView } from "../useBansListView";
import { BanMemberModal } from "./BanMemberModal";
import { BansList } from "./BansList";
import { BansListFooter, BansListHeader } from "./BansListChrome";
import { BansToolbar } from "./BansToolbar";

export interface BansHeaderInfo {
  isPicking: boolean;
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

export function BansPanel({
  serverId,
  ownerId,
  currentUserId,
  canManageRoles,
  renderHeader,
  onExit,
}: BansPanelProps) {
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

      <BansList
        items={view.items}
        emptyMessage={view.emptyMessage}
        actionsFor={rows.actionsFor}
        onSelect={
          view.isBans ? undefined : ({ userId }) => setViewingUserId(userId)
        }
        disableActions={rows.isRevoking}
        header={
          <BansListHeader
            isBans={view.isBans}
            count={view.count}
            errorMessage={view.errorMessage || rows.revokeError}
            onBanMember={openPicker}
          />
        }
        footer={
          <BansListFooter
            isBans={view.isBans}
            page={view.page}
            pageCount={view.pageCount}
            range={view.range}
            total={view.matches}
            noun={view.noun}
            onPageChange={view.setPage}
          />
        }
      />

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
