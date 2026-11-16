import {
  type MessageAuthor,
  NOTIFICATIONS_DIRECT_MESSAGE_LABEL,
  NOTIFICATIONS_SHOW_LESS_LABEL,
  NOTIFICATIONS_UNKNOWN_CHANNEL,
  type NotificationGroup,
  type NotificationHistoryItem,
  notificationPlace,
  notificationsShowMoreLabel,
  type ServerSummary,
  UNKNOWN_USER_NAME,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../../components/ui/Avatar";
import { CountBadge } from "../../../../components/ui/CountBadge";
import { useThemeColors } from "../../../../theme/theme-context";
import { resolveServerIconUrl } from "../../../servers/api";
import { NotificationItem } from "./NotificationItem";

const PREVIEW_SIZE = 3;

interface NotificationGroupCardProps {
  group: NotificationGroup;
  servers: readonly ServerSummary[];
  authors: Record<string, MessageAuthor>;
  previews: Record<string, string | null>;
  isUnread: (item: NotificationHistoryItem) => boolean;
  onOpen: (item: NotificationHistoryItem) => void;
}

export function NotificationGroupCard({
  group,
  servers,
  authors,
  previews,
  isUnread,
  onOpen,
}: NotificationGroupCardProps) {
  const colors = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);
  const [first] = group.items;
  const hidden = group.items.length - PREVIEW_SIZE;
  const visibleItems = isExpanded
    ? group.items
    : group.items.slice(0, PREVIEW_SIZE);

  const unreadCount = group.items.filter(isUnread).length;
  const isDirect = group.kind === "direct_message";
  const partner = group.partnerId ? authors[group.partnerId] : undefined;
  const place = notificationPlace(first, servers);
  const server = servers.find((candidate) => candidate.id === group.serverId);

  const title = isDirect
    ? (partner?.name ?? UNKNOWN_USER_NAME)
    : (place.channelName ?? NOTIFICATIONS_UNKNOWN_CHANNEL);
  const subtitle = isDirect
    ? NOTIFICATIONS_DIRECT_MESSAGE_LABEL
    : place.serverName;
  const avatarUri = isDirect
    ? partner?.avatarUrl
    : resolveServerIconUrl(server?.icon_url ?? null);

  return (
    <View className="overflow-hidden rounded-[14px] border border-line bg-surface-input">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onOpen(first)}
        accessibilityRole="button"
        className="flex-row items-center gap-3 border-b border-b-line px-4 py-3"
      >
        <Avatar
          name={isDirect ? title : (place.serverName ?? title)}
          uri={avatarUri}
          size={36}
          borderRadius={isDirect ? undefined : 12}
        />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-1">
            {isDirect ? null : (
              <Feather name="hash" size={14} color={colors.textSubtle} />
            )}
            <Text
              className="shrink text-[15px] font-bold text-content"
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
          {subtitle ? (
            <Text className="text-[12px] text-content-subtle" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {unreadCount > 0 ? (
          <CountBadge count={unreadCount} label={`${unreadCount} sin leer`} />
        ) : null}
      </TouchableOpacity>

      {visibleItems.map((item) => (
        <NotificationItem
          key={item.message_id}
          item={item}
          author={authors[item.author_id]}
          preview={previews[item.message_id]}
          isUnread={isUnread(item)}
          onOpen={onOpen}
        />
      ))}

      {hidden > 0 ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsExpanded((expanded) => !expanded)}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          className="items-center border-t border-t-line py-2.5"
        >
          <Text className="text-[12px] font-semibold text-content-muted">
            {isExpanded
              ? NOTIFICATIONS_SHOW_LESS_LABEL
              : notificationsShowMoreLabel(hidden)}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
