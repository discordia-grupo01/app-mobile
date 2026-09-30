import {
  type Message,
  type MessageAuthor,
  startsMessageGroup,
} from "@discordia/client-shared";

import { useMemo } from "react";
import { FlatList } from "react-native";

import { ChannelWelcome } from "./ChannelWelcome";
import { MessageItem } from "./MessageItem";
import type { MentionResolver } from "./MessageContent";

interface MessageListProps {
  channelName: string;
  messages: Message[];
  authors: Record<string, MessageAuthor>;
  editingMessageId: string | null;
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
      ListFooterComponent={<ChannelWelcome channelName={channelName} />}
      renderItem={({ item, index }) => {
        const previous = newestFirst[index + 1];
        return (
          <MessageItem
            message={item}
            author={authors[item.author_id] ?? unknownAuthor(item.author_id)}
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
