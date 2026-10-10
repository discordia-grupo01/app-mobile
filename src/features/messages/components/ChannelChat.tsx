import {
  ADD_REACTION_LABEL,
  authorFromMember,
  buildMentionResolver,
  canDeleteMessage,
  canEditMessage,
  CHAT_RECONNECTING_NOTICE,
  type Channel,
  LOADING_MESSAGES_LABEL,
  type MentionSources,
  messageInputPlaceholder,
  type MessageAuthor,
  resolveImageUrl,
  type Role,
} from "@discordia/client-shared";

import { useMemo, useState } from "react";
import { Text } from "react-native";

import { env } from "../../../lib/env";
import { useServerMembers } from "../../servers/useServerMembers";
import { useChannelMessages } from "../use-channel-messages";
import { useMessageAuthors } from "../useMessageAuthors";
import { ChannelWelcome } from "./ChannelWelcome";
import { ChatStatusNotice } from "./ChatStatusNotice";
import { DeleteMessageModal } from "./DeleteMessageModal";
import { EmojiPickerSheet } from "./EmojiPickerSheet";
import {
  MessageMentionsProvider,
  type MessageMentionsValue,
} from "./MentionsContext";
import { MessageActionsSheet } from "./MessageActionsSheet";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";

interface ChannelChatProps {
  serverId: string;
  channel: Channel;
  currentAuthor: MessageAuthor | null;
  serverRoles: Role[];
  myRoleIds: string[];
  canManageMessages: boolean;
  canSendMessages: boolean;
  canMentionEveryone: boolean;
  canAddReactions: boolean;
}

export function ChannelChat({
  serverId,
  channel,
  currentAuthor,
  serverRoles,
  myRoleIds,
  canManageMessages,
  canSendMessages,
  canMentionEveryone,
  canAddReactions,
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
  } = useChannelMessages(channel, currentAuthor?.id ?? null);
  const members = useServerMembers(serverId);
  const authors = useMessageAuthors(members, messages, currentAuthor);
  const [reactingToId, setReactingToId] = useState<string | null>(null);
  const [actionsMessageId, setActionsMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(messageId: string) {
    setActionError(null);
    const result = await deleteMessage(messageId);
    if (!result.ok) setActionError(result.message);
  }

  async function handleToggleReaction(messageId: string, emoji: string) {
    setActionError(null);
    const result = await toggleReaction(messageId, emoji);
    if (!result.ok) setActionError(result.message);
  }

  const currentUserId = currentAuthor?.id ?? null;
  const mentions = useMemo<MessageMentionsValue>(() => {
    const sources: MentionSources = {
      members: (members ?? []).map((member) =>
        authorFromMember(
          member,
          resolveImageUrl(member.profile?.avatar_url, env.apiUrl),
        ),
      ),
      roles: serverRoles,
      canMentionEveryone,
    };
    return {
      resolveMention: buildMentionResolver(authors, serverRoles),
      sources,
      me: { userId: currentUserId, roleIds: myRoleIds },
    };
  }, [
    authors,
    members,
    serverRoles,
    canMentionEveryone,
    currentUserId,
    myRoleIds,
  ]);

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
      ? canEditMessage(actionsMessage, currentAuthor.id, canSendMessages)
      : false;
  const canDeleteActions =
    actionsMessage && currentAuthor
      ? canDeleteMessage(actionsMessage, currentAuthor.id, canManageMessages)
      : false;

  const editingMessage =
    messages?.find((m) => m.id === editingMessageId) ?? null;
  const deletingMessage =
    messages?.find((m) => m.id === deletingMessageId) ?? null;

  return (
    <MessageMentionsProvider value={mentions}>
      {messages === null ? (
        <ChatStatusNotice message={LOADING_MESSAGES_LABEL} />
      ) : (
        <MessageList
          welcome={<ChannelWelcome channelName={channel.name} />}
          messages={messages}
          authors={authors}
          editingMessageId={editingMessageId}
          hasMore={hasMore}
          isLoadingOlder={isLoadingOlder}
          onLoadOlder={loadOlder}
          onToggleReaction={handleToggleReaction}
          onRequestReaction={setReactingToId}
          canAddReactions={canAddReactions}
          onRequestActions={setActionsMessageId}
        />
      )}
      {actionError ? (
        <Text
          accessibilityRole="alert"
          className="bg-danger/10 px-4 py-1 text-center text-[12px] text-danger"
        >
          {actionError}
        </Text>
      ) : null}
      {status === "reconnecting" ? (
        <Text
          accessibilityRole="alert"
          className="bg-surface-hover px-4 py-1 text-center text-[12px] text-content-muted"
        >
          {CHAT_RECONNECTING_NOTICE}
        </Text>
      ) : null}
      <MessageComposer
        placeholder={messageInputPlaceholder(channel.name)}
        onSend={sendMessage}
        disabled={!currentAuthor || status !== "ready"}
        editing={
          editingMessage
            ? {
                id: editingMessage.id,
                content: editingMessage.content,
                onSave: async (content) => {
                  const result = await editMessage(editingMessage.id, content);
                  if (result.ok) setEditingMessageId(null);
                  return result;
                },
                onCancel: () => setEditingMessageId(null),
              }
            : null
        }
      />

      <MessageActionsSheet
        visible={actionsMessageId !== null}
        canEdit={canEditActions}
        canDelete={canDeleteActions}
        onReact={
          canAddReactions
            ? () => {
                setReactingToId(actionsMessageId);
                setActionsMessageId(null);
              }
            : undefined
        }
        onEdit={() => {
          setEditingMessageId(actionsMessageId);
          setActionsMessageId(null);
        }}
        onDelete={() => {
          setDeletingMessageId(actionsMessageId);
          setActionsMessageId(null);
        }}
        onClose={() => setActionsMessageId(null)}
      />

      <DeleteMessageModal
        visible={deletingMessageId !== null}
        message={deletingMessage}
        author={
          deletingMessage ? (authors[deletingMessage.user_id] ?? null) : null
        }
        onConfirm={() => {
          if (deletingMessageId) void handleDelete(deletingMessageId);
          setDeletingMessageId(null);
        }}
        onCancel={() => setDeletingMessageId(null)}
      />

      <EmojiPickerSheet
        visible={reactingToId !== null}
        title={ADD_REACTION_LABEL}
        onPick={(emoji) => {
          if (reactingToId) void handleToggleReaction(reactingToId, emoji);
        }}
        onClose={() => setReactingToId(null)}
      />
    </MessageMentionsProvider>
  );
}
