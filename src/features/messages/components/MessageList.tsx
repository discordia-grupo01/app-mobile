import {
  formatMemberSince,
  LOAD_OLDER_MESSAGES_LABEL,
  LOADING_MESSAGES_LABEL,
  type Message,
  type MessageAuthor,
  startsMessageGroup,
  startsNewDay,
  unknownAuthor,
} from "@discordia/client-shared";

import { useMemo, type ReactNode } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { MessageItem } from "./MessageItem";

interface MessageListProps {
  welcome: ReactNode;
  messages: Message[];
  authors: Record<string, MessageAuthor>;
  editingMessageId: string | null;
  hasMore: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  /** Sin estas dos no se muestran reacciones (ej. en mensajes directos). */
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onRequestReaction?: (messageId: string) => void;
  /** `ADD_REACTIONS` del usuario actual en el servidor. */
  canAddReactions?: boolean;
  onRequestActions: (messageId: string) => void;
  /** Reintenta / elimina un mensaje propio que no se pudo enviar (por su `client_id`). */
  onRetryMessage?: (clientId: string) => void;
  onDiscardMessage?: (clientId: string) => void;
  onOpenProfile?: (userId: string) => void;
}

export function MessageList({
  welcome,
  messages,
  authors,
  editingMessageId,
  hasMore,
  isLoadingOlder,
  onLoadOlder,
  onToggleReaction,
  onRequestReaction,
  canAddReactions = true,
  onRequestActions,
  onRetryMessage,
  onDiscardMessage,
  onOpenProfile,
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
        const newDay = startsNewDay(previous?.inserted_at, item.inserted_at);
        return (
          <>
            <MessageItem
              message={item}
              author={authors[item.user_id] ?? unknownAuthor(item.user_id)}
              isGroupStart={newDay || startsMessageGroup(previous, item)}
              isEditing={editingMessageId === item.id}
              onToggleReaction={
                onToggleReaction &&
                ((emoji) => onToggleReaction(item.id, emoji))
              }
              onRequestReaction={
                onRequestReaction && (() => onRequestReaction(item.id))
              }
              canAddReactions={canAddReactions}
              onRequestActions={() => onRequestActions(item.id)}
              onOpenProfile={onOpenProfile}
              onRetry={
                item.client_id && onRetryMessage
                  ? () => onRetryMessage(item.client_id!)
                  : undefined
              }
              onDiscard={
                item.client_id && onDiscardMessage
                  ? () => onDiscardMessage(item.client_id!)
                  : undefined
              }
            />
            {newDay ? (
              <View
                accessibilityRole="header"
                className="mt-3 flex-row items-center gap-3 px-4"
              >
                <View className="h-px flex-1 bg-line" />
                <Text className="text-[12px] font-semibold text-content-muted">
                  {formatMemberSince(item.inserted_at)}
                </Text>
                <View className="h-px flex-1 bg-line" />
              </View>
            ) : null}
          </>
        );
      }}
    />
  );
}
