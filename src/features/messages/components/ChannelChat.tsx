import {
  type AccessRevokedReason,
  ADD_REACTION_LABEL,
  canDeleteMessage,
  canEditMessage,
  canReportMessage,
  type Channel,
  LOADING_MESSAGES_LABEL,
  type Member,
  messageInputPlaceholder,
  type MessageAuthor,
  type MessageJumpTarget,
  type Role,
  SEND_MESSAGES_DENIED_PLACEHOLDER,
  unknownAuthor,
} from "@discordia/client-shared";

import { useEffect, useRef, useState } from "react";
import { Text } from "react-native";

import { ReportSheet } from "../../reports/ReportSheet";
import type { ReportTarget } from "../../reports/reportTarget";
import { useServerMembers } from "../../servers/useServerMembers";
import { useChannelMessages } from "../use-channel-messages";
import { usePendingMessages } from "../usePendingMessages";
import { useMessageAuthors } from "../useMessageAuthors";
import { useMessageMentionsValue } from "../useMessageMentionsValue";
import { ChannelWelcome } from "./ChannelWelcome";
import { ChatStatusNotice } from "./ChatStatusNotice";
import { ConnectionPill } from "./ConnectionPill";
import { ConnectionLostNotice } from "./ConnectionLostNotice";
import { DeleteMessageModal } from "./DeleteMessageModal";
import { EmojiPickerSheet } from "./EmojiPickerSheet";
import { MessageMentionsProvider } from "./MentionsContext";
import { MessageActionsSheet } from "./MessageActionsSheet";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";
import { ViewingPastBar } from "./ViewingPastBar";

interface ChannelChatProps {
  serverId: string;
  /** Para el aviso de quien ve un reporte ("Lo ven los moderadores de ..."). */
  serverName: string;
  channel: Channel;
  currentAuthor: MessageAuthor | null;
  serverRoles: Role[];
  myRoleIds: string[];
  canManageMessages: boolean;
  canSendMessages: boolean;
  canMentionEveryone: boolean;
  canAddReactions: boolean;
  isCheckingPermissions?: boolean;
  /** El back cerro el canal: si fue por permisos, conviene recargar el servidor. */
  onAccessRevoked?: (reason: AccessRevokedReason) => void;
  /** Toque en el nombre o la foto de un autor (puede ser el usuario actual). */
  onOpenProfile?: (userId: string, member?: Member) => void;
  /** Resultado de busqueda a mostrar en este canal. */
  jumpTarget?: MessageJumpTarget | null;
  /** El salto ya se hizo: quien lo pidio lo descarta para no repetirlo al volver al canal. */
  onJumpHandled?: () => void;
}

export function ChannelChat({
  serverId,
  serverName,
  channel,
  currentAuthor,
  serverRoles,
  myRoleIds,
  canManageMessages,
  canSendMessages,
  canMentionEveryone,
  canAddReactions,
  isCheckingPermissions = false,
  onAccessRevoked,
  onOpenProfile,
  jumpTarget = null,
  onJumpHandled,
}: ChannelChatProps) {
  const {
    status,
    statusMessage,
    messages,
    hasMore,
    isLoadingOlder,
    loadOlder,
    hasNewer,
    isLoadingNewer,
    loadNewer,
    jumpToMessage,
    jumpToPresent,
    focusedMessage,
    retry,
    sendMessage,
    toggleReaction,
    editMessage,
    deleteMessage,
  } = useChannelMessages(channel, currentAuthor?.id ?? null, {
    onAccessRevoked,
  });
  const pending = usePendingMessages({
    chatKey: channel.id,
    channelId: channel.id,
    currentUserId: currentAuthor?.id ?? null,
    isReady: status === "ready",
    send: sendMessage,
  });
  const reconcilePending = pending.reconcile;
  useEffect(() => {
    if (messages) reconcilePending(messages);
  }, [messages, reconcilePending]);
  const members = useServerMembers(serverId);
  const authors = useMessageAuthors(
    members,
    messages,
    currentAuthor,
    serverRoles,
  );
  const [reactingToId, setReactingToId] = useState<string | null>(null);
  const [actionsMessageId, setActionsMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  // Se salta recien con el historial cargado: si no, la primera carga de lo
  // ultimo se mezclaria con el tramo del pasado.
  const isLoaded = messages !== null;
  const handledJump = useRef<number | null>(null);
  useEffect(() => {
    if (!jumpTarget || !isLoaded || handledJump.current === jumpTarget.nonce) {
      return;
    }
    handledJump.current = jumpTarget.nonce;
    onJumpHandled?.();
    setActionError(null);
    void jumpToMessage(jumpTarget.messageId).then((result) => {
      if (!result.ok) setActionError(result.message);
    });
  }, [jumpTarget, isLoaded, jumpToMessage, onJumpHandled]);

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

  const mentions = useMessageMentionsValue({
    members,
    authors,
    serverRoles,
    canMentionEveryone,
    currentUserId: currentAuthor?.id ?? null,
    myRoleIds,
  });

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

  const canReportActions =
    actionsMessage !== null &&
    canReportMessage({
      authorId: actionsMessage.user_id,
      currentUserId: currentAuthor?.id ?? null,
    });

  const editingMessage =
    messages?.find((m) => m.id === editingMessageId) ?? null;
  const deletingMessage =
    messages?.find((m) => m.id === deletingMessageId) ?? null;

  return (
    <MessageMentionsProvider value={mentions}>
      {messages !== null ? (
        <ConnectionPill status={status} onRetry={retry} />
      ) : null}
      {messages === null ? (
        status === "offline" ? (
          <ConnectionLostNotice onRetry={retry} />
        ) : (
          <ChatStatusNotice message={LOADING_MESSAGES_LABEL} isLoading />
        )
      ) : (
        <MessageList
          welcome={<ChannelWelcome channelName={channel.name} />}
          messages={hasNewer ? messages : pending.withPending(messages)}
          authors={authors}
          editingMessageId={editingMessageId}
          hasMore={hasMore}
          isLoadingOlder={isLoadingOlder}
          onLoadOlder={loadOlder}
          hasNewer={hasNewer}
          isLoadingNewer={isLoadingNewer}
          onLoadNewer={loadNewer}
          focusedMessage={focusedMessage}
          onToggleReaction={handleToggleReaction}
          onRequestReaction={setReactingToId}
          canAddReactions={canAddReactions}
          onRequestActions={setActionsMessageId}
          onRetryMessage={pending.retry}
          onDiscardMessage={pending.discard}
          onOpenProfile={
            onOpenProfile
              ? (userId) =>
                  onOpenProfile(
                    userId,
                    members?.find((member) => member.user_id === userId),
                  )
              : undefined
          }
        />
      )}
      {hasNewer && messages !== null ? (
        <ViewingPastBar onJumpToPresent={jumpToPresent} />
      ) : null}
      {actionError ? (
        <Text
          accessibilityRole="alert"
          className="bg-danger/10 px-4 py-1 text-center text-[12px] text-danger"
        >
          {actionError}
        </Text>
      ) : null}
      <MessageComposer
        placeholder={
          canSendMessages || isCheckingPermissions
            ? messageInputPlaceholder(channel.name)
            : SEND_MESSAGES_DENIED_PLACEHOLDER
        }
        onSend={(...args) => {
          // Lo propio llega por el socket, que no agrega nada mientras se ve el pasado.
          jumpToPresent();
          return pending.onSend(...args);
        }}
        uploadTarget={{ channelId: channel.id }}
        disabled={
          !currentAuthor ||
          !canSendMessages ||
          !(
            status === "ready" ||
            status === "reconnecting" ||
            status === "offline"
          )
        }
        editing={
          editingMessage
            ? {
                id: editingMessage.id,
                content: editingMessage.content,
                hasAttachments: Boolean(editingMessage.attachments?.length),
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
        onReport={
          canReportActions && actionsMessage
            ? () => {
                setReportTarget({
                  kind: "message",
                  message: actionsMessage,
                  author:
                    authors[actionsMessage.user_id] ??
                    unknownAuthor(actionsMessage.user_id),
                });
                setActionsMessageId(null);
              }
            : undefined
        }
        onClose={() => setActionsMessageId(null)}
      />

      {reportTarget ? (
        <ReportSheet
          serverId={serverId}
          serverName={serverName}
          target={reportTarget}
          onClose={() => setReportTarget(null)}
        />
      ) : null}

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
