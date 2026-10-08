import {
  LOAD_OLDER_MESSAGES_LABEL,
  LOADING_MESSAGES_LABEL,
  type Message,
  type MessageAuthor,
  startsMessageGroup,
  type MentionResolver,
  unknownAuthor,
} from "@discordia/client-shared";

import { useMemo, type ReactNode } from "react";
import { FlatList, Text, TouchableOpacity } from "react-native";

import { MessageItem } from "./MessageItem";

interface MessageListProps {
  /** Encabezado del comienzo del historial (se muestra cuando no hay mas mensajes anteriores). */
  welcome: ReactNode;
  messages: Message[];
  authors: Record<string, MessageAuthor>;
  editingMessageId: string | null;
  hasMore: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  resolveMention?: MentionResolver;
  /** Sin estas dos no se muestran reacciones (ej. en mensajes directos). */
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onRequestReaction?: (messageId: string) => void;
  onRequestActions: (messageId: string) => void;
}

export function MessageList({
  welcome,
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
          <>{welcome}</>
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
            onToggleReaction={
              onToggleReaction && ((emoji) => onToggleReaction(item.id, emoji))
            }
            onRequestReaction={
              onRequestReaction && (() => onRequestReaction(item.id))
            }
            onRequestActions={() => onRequestActions(item.id)}
          />
        );
      }}
    />
  );
}
