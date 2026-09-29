import type { Message, MessageAuthor } from "@discordia/client-shared";

import { Pressable, View } from "react-native";

import { cn } from "../../../lib/cn";
import { ServerAvatar } from "../../servers/components/ServerAvatar";
import { MessageContent } from "./MessageContent";
import { MessageHeader } from "./MessageHeader";
import { MessageReactions } from "./MessageReactions";

const AVATAR_SIZE = 40;

interface MessageItemProps {
  message: Message;
  author: MessageAuthor;
  isGroupStart: boolean;
  onToggleReaction: (emoji: string) => void;
  onRequestReaction: () => void;
}

export function MessageItem({
  message,
  author,
  isGroupStart,
  onToggleReaction,
  onRequestReaction,
}: MessageItemProps) {
  return (
    <Pressable
      onLongPress={onRequestReaction}
      delayLongPress={300}
      className={cn(
        "flex-row gap-3 px-4 py-0.5 active:bg-surface-hover",
        isGroupStart && "mt-4",
      )}
      accessibilityHint="Mantené presionado para reaccionar"
    >
      {isGroupStart ? (
        <ServerAvatar
          name={author.name}
          uri={author.avatarUrl}
          size={AVATAR_SIZE}
        />
      ) : (
        <View style={{ width: AVATAR_SIZE }} />
      )}

      <View className="min-w-0 flex-1">
        {isGroupStart ? (
          <MessageHeader author={author} createdAt={message.created_at} />
        ) : null}
        <MessageContent content={message.content} />
        <MessageReactions
          reactions={message.reactions}
          onToggle={onToggleReaction}
          onAddPress={onRequestReaction}
        />
      </View>
    </Pressable>
  );
}
