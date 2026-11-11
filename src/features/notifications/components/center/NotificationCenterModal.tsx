import {
  type MessageAuthor,
  NOTIFICATIONS_CLOSE_LABEL,
  NOTIFICATIONS_EMPTY_BY_TAB,
  NOTIFICATIONS_LOAD_OLDER_LABEL,
  NOTIFICATIONS_MARK_ALL_READ_LABEL,
  NOTIFICATIONS_TITLE,
  type NotificationGroup,
  type NotificationHistoryItem,
  type ServerSummary,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "../../../../components/ui/Button";
import { useThemeColors } from "../../../../theme/theme-context";
import { useModalInsets } from "../../../platform-status/hooks/useModalInsets";
import type { NotificationCenterState } from "../../useNotificationCenter";
import { useNotificationCenterView } from "./useNotificationCenterView";
import {
  NotificationCenterEmpty,
  NotificationCenterError,
  NotificationCenterLoading,
} from "./NotificationCenterStatus";
import { NotificationGroupCard } from "../list/NotificationGroupCard";
import { TransferNotificationCard } from "../list/TransferNotificationCard";
import { NotificationTabs } from "./NotificationTabs";

interface NotificationCenterModalProps {
  center: NotificationCenterState;
  servers: readonly ServerSummary[];
  me: MessageAuthor | null;
  onOpenItem: (item: NotificationHistoryItem) => void;
  onTransferAnswered: () => void;
}

export function NotificationCenterModal({
  center,
  servers,
  me,
  onOpenItem,
  onTransferAnswered,
}: NotificationCenterModalProps) {
  const colors = useThemeColors();
  const insets = useModalInsets();
  const {
    history,
    reads,
    isOpen,
    close,
    markAllRead,
    canMarkAllRead,
    isMarkingAll,
    markAllError,
  } = center;
  const view = useNotificationCenterView(history, reads, me);

  function open(item: NotificationHistoryItem) {
    close();
    onOpenItem(item);
  }

  function renderStatus() {
    if (history.status === "loading") return <NotificationCenterLoading />;
    if (history.status === "error") {
      return (
        <NotificationCenterError
          message={history.error ?? ""}
          onRetry={() => void history.reload()}
        />
      );
    }
    if (view.isEmpty) {
      return (
        <NotificationCenterEmpty
          message={NOTIFICATIONS_EMPTY_BY_TAB[view.tab]}
        />
      );
    }
    return undefined;
  }

  const footer =
    history.status === "ready" && view.canLoadMore ? (
      <View className="items-center gap-2 py-3">
        {history.loadMoreError ? (
          <Text accessibilityRole="alert" className="text-[12px] text-danger">
            {history.loadMoreError}
          </Text>
        ) : null}
        <Button
          title={NOTIFICATIONS_LOAD_OLDER_LABEL}
          variant="secondary"
          size="sm"
          isLoading={history.isLoadingMore}
          onPress={history.loadMore}
        />
      </View>
    ) : undefined;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={close}
    >
      <View
        className="flex-1 bg-surface"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="flex-row items-center gap-2 px-4 py-3">
          <Feather name="bell" size={18} color={colors.textSubtle} />
          <Text
            className="flex-1 text-[17px] font-bold text-content"
            accessibilityRole="header"
          >
            {NOTIFICATIONS_TITLE}
          </Text>
          <TouchableOpacity
            onPress={() => void markAllRead()}
            disabled={!canMarkAllRead}
            accessibilityRole="button"
            accessibilityLabel={NOTIFICATIONS_MARK_ALL_READ_LABEL}
            accessibilityState={{
              disabled: !canMarkAllRead,
              busy: isMarkingAll,
            }}
            className="h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-input"
            style={canMarkAllRead ? undefined : { opacity: 0.4 }}
          >
            {isMarkingAll ? (
              <ActivityIndicator size="small" color={colors.textSubtle} />
            ) : (
              <Feather
                name="check-square"
                size={16}
                color={colors.textSubtle}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={NOTIFICATIONS_CLOSE_LABEL}
            className="h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-input"
          >
            <Feather name="x" size={16} color={colors.textSubtle} />
          </TouchableOpacity>
        </View>

        {markAllError ? (
          <Text
            accessibilityRole="alert"
            className="px-4 pb-2 text-[13px] text-danger"
          >
            {markAllError}
          </Text>
        ) : null}

        <NotificationTabs
          value={view.tab}
          onChange={view.setTab}
          label={NOTIFICATIONS_TITLE}
        />

        <FlatList<NotificationGroup>
          data={history.status === "ready" ? view.groups : []}
          keyExtractor={(group) => group.key}
          contentContainerClassName="gap-3 p-3"
          ListHeaderComponent={renderStatus()}
          ListFooterComponent={footer}
          onEndReached={view.canLoadMore ? history.loadMore : undefined}
          onEndReachedThreshold={0.4}
          renderItem={({ item: group }) =>
            group.kind === "ownership_transfer" ? (
              <TransferNotificationCard
                item={group.items[0]}
                servers={servers}
                authors={view.authors}
                me={me}
                isUnread={reads.isUnread(group.items[0])}
                onRead={(item) => reads.markTransferRead(item.message_id)}
                onAnswered={() => {
                  onTransferAnswered();
                  void history.refresh();
                }}
              />
            ) : (
              <NotificationGroupCard
                group={group}
                servers={servers}
                authors={view.authors}
                previews={view.previews}
                isUnread={reads.isUnread}
                onOpen={open}
              />
            )
          }
        />
      </View>
    </Modal>
  );
}
