import {
  LOAD_OLDER_MESSAGES_LABEL,
  LOADING_MESSAGES_LABEL,
  type Message,
  type MessageAuthor,
  startsMessageGroup,
} from "@discordia/client-shared";

import { useMemo } from "react";
import { FlatList, Text, TouchableOpacity } from "react-native";

import { ChannelWelcome } from "./ChannelWelcome";
import { MessageItem } from "./MessageItem";
import type { MentionResolver } from "./MessageContent";

interface MessageListProps {
  channelName: string;
  messages: Message[];
  authors: Record<string, MessageAuthor>;
  editingMessageId: string | null;
  hasMore: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  resolveMention?: MentionResolver;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onRequestReaction: (messageId: string) => void;
  onRequestActions: (messageId: string) => void;
  onSaveEdit: (messageId: string, content: string) => void;
  onCancelEdit: () => void;
}

function unknownAuthor(id: string): MessageAuthor {
  return {
    id,
    name: "Usuario desconocido",
    avatarUrl: null,
    roleName: null,
    roleColor: null,
  };
}

export function MessageList({
  channelName,
  messages,
  authors,
  editingMessageId,
  hasMore,
  isLoadingOlder,
  onLoadOlder,
  resolveMention,
  onToggleReaction,
  onRequestReaction,
  onRequestActions,
  onSaveEdit,
  onCancelEdit,
}: MessageListProps) {
  const newestFirst = useMemo(() => [...messages].reverse(), [messages]);

  return (
    <FlatList
      inverted
      data={newestFirst}
      keyExtractor={(message) => message.id}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="pt-3"
      onEndReached={hasMore ? onLoadOlder : undefined}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        hasMore ? (
          <TouchableOpacity
            onPress={onLoadOlder}
            disabled={isLoadingOlder}
            accessibilityRole="button"
            className="items-center py-3"
          >
            <Text className="text-[12px] text-content-muted">
              {isLoadingOlder
                ? LOADING_MESSAGES_LABEL
                : LOAD_OLDER_MESSAGES_LABEL}
            </Text>
          </TouchableOpacity>
        ) : (
          <ChannelWelcome channelName={channelName} />
        )
      }
      renderItem={({ item, index }) => {
        const previous = newestFirst[index + 1];
        return (
          <MessageItem
            message={item}
            author={authors[item.user_id] ?? unknownAuthor(item.user_id)}
            isGroupStart={startsMessageGroup(previous, item)}
            isEditing={editingMessageId === item.id}
            resolveMention={resolveMention}
            onToggleReaction={(emoji) => onToggleReaction(item.id, emoji)}
            onRequestReaction={() => onRequestReaction(item.id)}
            onRequestActions={() => onRequestActions(item.id)}
            onSaveEdit={(content) => onSaveEdit(item.id, content)}
            onCancelEdit={onCancelEdit}
          />
        );
      }}
    />
  );
}
