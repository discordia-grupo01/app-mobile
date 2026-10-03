import {
  ADD_REACTION_LABEL,
  canDeleteMessage,
  canEditMessage,
  CHAT_RECONNECTING_NOTICE,
  type Channel,
  LOADING_MESSAGES_LABEL,
  type MessageAuthor,
  type Role,
} from "@discordia/client-shared";

import { useMemo, useState } from "react";
import { Text } from "react-native";

import { buildMentionResolver } from "../message-mentions";
import { useChannelMessages } from "../use-channel-messages";
import { useMessageAuthors } from "../use-message-authors";
import { ChatStatusNotice } from "./ChatStatusNotice";
import { EmojiPickerSheet } from "./EmojiPickerSheet";
import { MessageActionsSheet } from "./MessageActionsSheet";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";

interface ChannelChatProps {
  serverId: string;
  channel: Channel;
  currentAuthor: MessageAuthor | null;
  serverRoles: Role[];
  canManageMessages: boolean;
  canMentionEveryone: boolean;
}

export function ChannelChat({
  serverId,
  channel,
  currentAuthor,
  serverRoles,
  canManageMessages,
  canMentionEveryone,
}: ChannelChatProps) {
  const {
    status,
    statusMessage,
    messages,
    hasMore,
    isLoadingOlder,
    loadOlder,
    retry,
    sendMessage,
    toggleReaction,
    editMessage,
    deleteMessage,
  } = useChannelMessages(channel);
  const authors = useMessageAuthors(serverId, messages, currentAuthor);
  const [reactingToId, setReactingToId] = useState<string | null>(null);
  const [actionsMessageId, setActionsMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const resolveMention = useMemo(
    () => buildMentionResolver(authors, serverRoles),
    [authors, serverRoles],
  );

  // Estados de los que no se sale solos: el canal no se puede mostrar.
  if (statusMessage && status !== "ready") {
    return (
      <ChatStatusNotice
        message={statusMessage}
        onRetry={status === "error" ? retry : undefined}
      />
    );
  }

  const actionsMessage =
    messages?.find((m) => m.id === actionsMessageId) ?? null;
  const canEditActions =
    actionsMessage && currentAuthor
      ? canEditMessage(actionsMessage, currentAuthor.id)
      : false;
  const canDeleteActions =
    actionsMessage && currentAuthor
      ? canDeleteMessage(actionsMessage, currentAuthor.id, canManageMessages)
      : false;

  return (
    <>
      {messages === null ? (
        <ChatStatusNotice message={LOADING_MESSAGES_LABEL} />
      ) : (
        <MessageList
          channelName={channel.name}
          messages={messages}
          authors={authors}
          editingMessageId={editingMessageId}
          resolveMention={resolveMention}
          hasMore={hasMore}
          isLoadingOlder={isLoadingOlder}
          onLoadOlder={loadOlder}
          onToggleReaction={toggleReaction}
          onRequestReaction={setReactingToId}
          onRequestActions={setActionsMessageId}
          onSaveEdit={(id, content) => {
            editMessage(id, content);
            setEditingMessageId(null);
          }}
          onCancelEdit={() => setEditingMessageId(null)}
        />
      )}
      {status === "reconnecting" ? (
        <Text
          accessibilityRole="alert"
          className="bg-surface-hover px-4 py-1 text-center text-[12px] text-content-muted"
        >
          {CHAT_RECONNECTING_NOTICE}
        </Text>
      ) : null}
      <MessageComposer
        channelName={channel.name}
        onSend={sendMessage}
        disabled={!currentAuthor || status !== "ready"}
        canMentionEveryone={canMentionEveryone}
      />

      <MessageActionsSheet
        visible={actionsMessageId !== null}
        canEdit={canEditActions}
        canDelete={canDeleteActions}
        onReact={() => {
          setReactingToId(actionsMessageId);
          setActionsMessageId(null);
        }}
        onEdit={() => {
          setEditingMessageId(actionsMessageId);
          setActionsMessageId(null);
        }}
        onDelete={() => {
          if (actionsMessageId) deleteMessage(actionsMessageId);
          setActionsMessageId(null);
        }}
        onClose={() => setActionsMessageId(null)}
      />

      <EmojiPickerSheet
        visible={reactingToId !== null}
        title={ADD_REACTION_LABEL}
        onPick={(emoji) => {
          if (reactingToId) toggleReaction(reactingToId, emoji);
        }}
        onClose={() => setReactingToId(null)}
      />
    </>
  );
}
