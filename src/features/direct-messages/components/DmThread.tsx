import {
  canDeleteMessage,
  canEditMessage,
  CHAT_RECONNECTING_NOTICE,
  dmInputPlaceholder,
  CHAT_OFFLINE_NOTICE_MOBILE,
  LOADING_MESSAGES_LABEL,
  type MessageAuthor,
  type SendDmResult,
} from "@discordia/client-shared";

import { useMemo, useState } from "react";
import { Text } from "react-native";

import { useChannelMessages } from "../../messages/use-channel-messages";
import { useFailedMessages } from "../../messages/useFailedMessages";
import { ChatStatusNotice } from "../../messages/components/ChatStatusNotice";
import { ConnectionLostNotice } from "../../messages/components/ConnectionLostNotice";
import { DeleteMessageModal } from "../../messages/components/DeleteMessageModal";
import { MessageActionsSheet } from "../../messages/components/MessageActionsSheet";
import { MessageComposer } from "../../messages/components/MessageComposer";
import { MessageList } from "../../messages/components/MessageList";
import { DmBlockedNotice } from "./DmBlockedNotice";
import { DmWelcome } from "./DmWelcome";

interface DmThreadProps {
  /** `null` en un borrador: todavia no hay conversacion, asi que no hay historial que pedir. */
  conversationId: string | null;
  partner: MessageAuthor;
  currentAuthor: MessageAuthor;
  blockedByMe: boolean;
  onSend: (
    content: string,
    attachmentIds?: readonly string[],
  ) => Promise<SendDmResult>;
}

/** Un borrador no tiene canal al que unirse: solo el composer. */
export function DmThread(props: DmThreadProps) {
  if (props.conversationId === null) return <DraftDmThread {...props} />;
  return <LiveDmThread {...props} conversationId={props.conversationId} />;
}

function DraftDmThread({
  partner,
  currentAuthor,
  blockedByMe,
  onSend,
}: DmThreadProps) {
  const failed = useFailedMessages({
    chatKey: partner.id,
    channelId: "",
    currentUserId: currentAuthor.id,
    send: onSend,
    getLastMessageId: () => null,
  });
  return (
    <>
      <MessageList
        welcome={<DmWelcome partner={partner} />}
        messages={failed.withFailed([])}
        authors={{ [currentAuthor.id]: currentAuthor }}
        editingMessageId={null}
        hasMore={false}
        isLoadingOlder={false}
        onLoadOlder={() => {}}
        onRequestActions={() => {}}
      />
      {blockedByMe ? <DmBlockedNotice /> : null}
      <MessageComposer
        placeholder={dmInputPlaceholder(partner.name)}
        onSend={failed.onSend}
        uploadTarget={{ to: partner.id }}
        disabled={blockedByMe}
      />
    </>
  );
}

/**
 * Historial en vivo de una conversacion que ya existe. Una conversacion es un
 * canal para el back, asi que historial, editar, borrar y tiempo real son los
 * de `useChannelMessages`. Lo unico que no se usa es su `sendMessage`: en un DM
 * se envia con `send_dm` (ver `useDirectMessages`).
 */
function LiveDmThread({
  conversationId,
  partner,
  currentAuthor,
  blockedByMe,
  onSend,
}: DmThreadProps & { conversationId: string }) {
  const {
    status,
    statusMessage,
    messages,
    hasMore,
    isLoadingOlder,
    loadOlder,
    retry,
    editMessage,
    deleteMessage,
  } = useChannelMessages({ id: conversationId });
  const failed = useFailedMessages({
    chatKey: conversationId,
    channelId: conversationId,
    currentUserId: currentAuthor.id,
    send: onSend,
    getLastMessageId: () => messages?.at(-1)?.id ?? null,
  });
  const authors = useMemo(
    () => ({ [partner.id]: partner, [currentAuthor.id]: currentAuthor }),
    [partner, currentAuthor],
  );
  const [actionsMessageId, setActionsMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(messageId: string) {
    setDeleteError(null);
    const result = await deleteMessage(messageId);
    if (!result.ok) setDeleteError(result.message);
  }

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
  const canEditActions = actionsMessage
    ? canEditMessage(actionsMessage, currentAuthor.id)
    : false;
  const canDeleteActions = actionsMessage
    ? canDeleteMessage(actionsMessage, currentAuthor.id, false)
    : false;
  const editingMessage =
    messages?.find((m) => m.id === editingMessageId) ?? null;
  const deletingMessage =
    messages?.find((m) => m.id === deletingMessageId) ?? null;

  return (
    <>
      {messages === null ? (
        <ChatStatusNotice
          message={status === "offline" ? CHAT_OFFLINE_NOTICE_MOBILE : LOADING_MESSAGES_LABEL}
        />
      ) : (
        <MessageList
          welcome={<DmWelcome partner={partner} />}
          messages={failed.withFailed(messages)}
          authors={authors}
          editingMessageId={editingMessageId}
          hasMore={hasMore}
          isLoadingOlder={isLoadingOlder}
          onLoadOlder={loadOlder}
          onRequestActions={setActionsMessageId}
        />
      )}
      {deleteError ? (
        <Text
          accessibilityRole="alert"
          className="bg-danger/10 px-4 py-1 text-center text-[12px] text-danger"
        >
          {deleteError}
        </Text>
      ) : null}
      {status === "offline" && messages !== null ? (
        <ConnectionLostNotice />
      ) : null}
      {status === "reconnecting" ? (
        <Text
          accessibilityRole="alert"
          className="bg-surface-hover px-4 py-1 text-center text-[12px] text-content-muted"
        >
          {CHAT_RECONNECTING_NOTICE}
        </Text>
      ) : null}
      {blockedByMe ? <DmBlockedNotice /> : null}
      <MessageComposer
        placeholder={dmInputPlaceholder(partner.name)}
        onSend={failed.onSend}
        uploadTarget={{ to: partner.id }}
        disabled={blockedByMe}
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
    </>
  );
}
