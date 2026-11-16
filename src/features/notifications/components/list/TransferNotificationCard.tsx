import {
  canRespondToTransfer,
  describeTransferNotification,
  formatMessageTimestamp,
  type MessageAuthor,
  NOTIFICATIONS_TRANSFER_ACCEPT_LABEL,
  NOTIFICATIONS_TRANSFER_REJECT_LABEL,
  NOTIFICATIONS_TRANSFER_TITLE,
  NOTIFICATIONS_UNREAD_LABEL,
  type NotificationHistoryItem,
  type ServerSummary,
} from "@discordia/client-shared";

import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../../components/ui/Avatar";
import { Button } from "../../../../components/ui/Button";
import { cn } from "../../../../lib/cn";
import {
  acceptOwnershipTransfer,
  rejectOwnershipTransfer,
  resolveServerIconUrl,
} from "../../../servers/api";

interface TransferNotificationCardProps {
  item: NotificationHistoryItem;
  servers: readonly ServerSummary[];
  authors: Record<string, MessageAuthor>;
  me: MessageAuthor | null;
  isUnread: boolean;
  onRead: (item: NotificationHistoryItem) => void;
  onAnswered: () => void;
}

export function TransferNotificationCard({
  item,
  servers,
  authors,
  me,
  isUnread,
  onRead,
  onAnswered,
}: TransferNotificationCardProps) {
  const [pending, setPending] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState("");
  const server = servers.find((candidate) => candidate.id === item.server_id);
  const nameOf = (userId: string) =>
    (me?.id === userId ? me.name : authors[userId]?.name) ?? null;
  const text = describeTransferNotification(
    item,
    me?.id,
    nameOf,
    server?.name ?? null,
  );
  const canRespond = canRespondToTransfer(item, me?.id);

  async function respond(action: "accept" | "reject") {
    if (!item.server_id) return;
    setPending(action);
    setError("");
    const request =
      action === "accept" ? acceptOwnershipTransfer : rejectOwnershipTransfer;
    const result = await request(item.server_id, item.message_id);
    setPending(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onRead(item);
    onAnswered();
  }

  return (
    <View
      className={cn(
        "overflow-hidden rounded-[14px] border border-line bg-surface-input",
        !isUnread && !canRespond && "opacity-60",
      )}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onRead(item)}
        accessibilityRole="button"
        className="flex-row items-center gap-3 px-4 py-3"
      >
        <Avatar
          name={server?.name ?? NOTIFICATIONS_TRANSFER_TITLE}
          uri={resolveServerIconUrl(server?.icon_url ?? null)}
          size={36}
          borderRadius={12}
        />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-baseline gap-2">
            <Text
              className="shrink text-[15px] font-bold text-content"
              numberOfLines={1}
            >
              {NOTIFICATIONS_TRANSFER_TITLE}
            </Text>
            <Text className="text-[11px] text-content-subtle">
              {formatMessageTimestamp(item.occurred_at)}
            </Text>
          </View>
          <Text className="text-[14px] text-content-muted">{text}</Text>
        </View>
        {isUnread ? (
          <View
            accessible
            accessibilityLabel={NOTIFICATIONS_UNREAD_LABEL}
            className="h-2 w-2 rounded-full bg-accent"
          />
        ) : null}
      </TouchableOpacity>

      {canRespond ? (
        <View className="flex-row gap-2 border-t border-t-line px-4 py-2.5">
          <View className="flex-1">
            <Button
              title={NOTIFICATIONS_TRANSFER_REJECT_LABEL}
              variant="secondary"
              size="sm"
              isLoading={pending === "reject"}
              disabled={pending !== null}
              onPress={() => void respond("reject")}
            />
          </View>
          <View className="flex-1">
            <Button
              title={NOTIFICATIONS_TRANSFER_ACCEPT_LABEL}
              size="sm"
              isLoading={pending === "accept"}
              disabled={pending !== null}
              onPress={() => void respond("accept")}
            />
          </View>
        </View>
      ) : null}

      {error ? (
        <Text
          accessibilityRole="alert"
          className="border-t border-t-line px-4 py-2 text-[13px] text-danger"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
