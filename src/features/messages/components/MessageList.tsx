import {
  type FocusedMessage,
  formatMemberSince,
  LOAD_NEWER_MESSAGES_LABEL,
  LOAD_OLDER_MESSAGES_LABEL,
  LOADING_MESSAGES_LABEL,
  type Message,
  type MessageAuthor,
  startsMessageGroup,
  startsNewDay,
  unknownAuthor,
} from "@discordia/client-shared";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { useMessageHighlight } from "../useMessageHighlight";
import { MessageItem } from "./MessageItem";

/** Espera antes de reintentar un `scrollToIndex` a una fila que no estaba medida. */
const SCROLL_RETRY_MS = 120;

interface MessageListProps {
  welcome: ReactNode;
  messages: Message[];
  authors: Record<string, MessageAuthor>;
  editingMessageId: string | null;
  hasMore: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  /** Hay mensajes mas nuevos sin cargar (se salto a un mensaje viejo). */
  hasNewer?: boolean;
  isLoadingNewer?: boolean;
  onLoadNewer?: () => void;
  /** Mensaje al que se salto: se centra y se resalta un momento. */
  focusedMessage?: FocusedMessage | null;
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
  hasNewer = false,
  isLoadingNewer = false,
  onLoadNewer,
  focusedMessage = null,
  onToggleReaction,
  onRequestReaction,
  canAddReactions = true,
  onRequestActions,
  onRetryMessage,
  onDiscardMessage,
  onOpenProfile,
}: MessageListProps) {
  const newestFirst = useMemo(() => [...messages].reverse(), [messages]);
  const listRef = useRef<FlatList<Message>>(null);
  const highlightedId = useMessageHighlight(focusedMessage);

  const focusId = focusedMessage?.id;
  const focusNonce = focusedMessage?.nonce;
  const focusIndex = focusId
    ? newestFirst.findIndex((message) => message.id === focusId)
    : -1;
  useEffect(() => {
    if (focusIndex < 0) return;
    const frame = requestAnimationFrame(() =>
      listRef.current?.scrollToIndex({
        index: focusIndex,
        viewPosition: 0.5,
        animated: true,
      }),
    );
    return () => cancelAnimationFrame(frame);
    // Solo al saltar: no hay que volver a centrarlo cuando llegan mensajes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, focusNonce]);

  return (
    <FlatList
      ref={listRef}
      inverted
      data={newestFirst}
      keyExtractor={(message) => message.id}
      keyboardShouldPersistTaps="handled"
      // Invertida, el padding de arriba queda abajo: aire para el globito de "Ir al presente".
      contentContainerClassName={hasNewer ? "pt-14" : "pt-3"}
      onEndReached={hasMore ? onLoadOlder : undefined}
      onEndReachedThreshold={0.5}
      // Mientras se ve el pasado, lo que se carga abajo no tiene que mover lo que se esta leyendo.
      maintainVisibleContentPosition={
        hasNewer ? { minIndexForVisible: 0 } : undefined
      }
      onScrollToIndexFailed={(info) => {
        listRef.current?.scrollToOffset({
          offset: info.averageItemLength * info.index,
          animated: false,
        });
        setTimeout(
          () =>
            listRef.current?.scrollToIndex({
              index: info.index,
              viewPosition: 0.5,
              animated: true,
            }),
          SCROLL_RETRY_MS,
        );
      }}
      ListHeaderComponent={
        hasNewer && onLoadNewer ? (
          <TouchableOpacity
            onPress={onLoadNewer}
            disabled={isLoadingNewer}
            accessibilityRole="button"
            className="items-center py-3"
          >
            <Text className="text-[12px] text-content-muted">
              {isLoadingNewer
                ? LOADING_MESSAGES_LABEL
                : LOAD_NEWER_MESSAGES_LABEL}
            </Text>
          </TouchableOpacity>
        ) : undefined
      }
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
              isFocused={item.id === highlightedId}
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
