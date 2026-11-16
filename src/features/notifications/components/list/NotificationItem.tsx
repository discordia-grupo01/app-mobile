import {
  describeNotification,
  formatMessageTimestamp,
  type MessageAuthor,
  NOTIFICATIONS_UNREAD_LABEL,
  type NotificationHistoryItem,
  UNKNOWN_USER_NAME,
} from "@discordia/client-shared";

import { Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../../components/ui/Avatar";
import { cn } from "../../../../lib/cn";

interface NotificationItemProps {
  item: NotificationHistoryItem;
  author: MessageAuthor | undefined;
  preview: string | null | undefined;
  isUnread: boolean;
  onOpen: (item: NotificationHistoryItem) => void;
}

export function NotificationItem({
  item,
  author,
  preview,
  isUnread,
  onOpen,
}: NotificationItemProps) {
  const name = author?.name ?? UNKNOWN_USER_NAME;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onOpen(item)}
      accessibilityRole="button"
      className={cn(
        "flex-row items-center gap-3 px-4 py-2.5",
        !isUnread && "opacity-60",
      )}
    >
      <Avatar name={name} uri={author?.avatarUrl} size={32} />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-baseline gap-2">
          <Text
            className="shrink text-[14px] font-bold text-content"
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text className="text-[11px] text-content-subtle">
            {formatMessageTimestamp(item.occurred_at)}
          </Text>
        </View>
        <Text
          className={cn(
            "text-[14px]",
            preview ? "text-content-muted" : "text-content-subtle",
          )}
          numberOfLines={2}
        >
          {preview ?? describeNotification(item)}
        </Text>
      </View>
      {isUnread ? (
        <View
          accessible
          accessibilityLabel={NOTIFICATIONS_UNREAD_LABEL}
          className="h-2 w-2 rounded-full bg-accent"
        />
      ) : null}
    </TouchableOpacity>
  );
}
