import {
  canDeleteMessage,
  canEditMessage,
  CHAT_RECONNECTING_NOTICE,
  dmInputPlaceholder,
  LOADING_MESSAGES_LABEL,
  type MessageAuthor,
  type SendDmResult,
} from "@discordia/client-shared";

import { useMemo, useState } from "react";
import { Text } from "react-native";

import { useChannelMessages } from "../../messages/use-channel-messages";
import { ChatStatusNotice } from "../../messages/components/ChatStatusNotice";
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
  onSend: (content: string) => Promise<SendDmResult>;
}

/** Un borrador no tiene canal al que unirse: solo el composer. */
export function DmThread(props: DmThreadProps) {
  if (props.conversationId === null) {
    return (
      <>
        <MessageList
          welcome={<DmWelcome partner={props.partner} />}
          messages={[]}
          authors={{}}
          editingMessageId={null}
          hasMore={false}
          isLoadingOlder={false}
          onLoadOlder={() => {}}
          onRequestActions={() => {}}
        />
        {props.blockedByMe ? <DmBlockedNotice /> : null}
        <MessageComposer
          placeholder={dmInputPlaceholder(props.partner.name)}
          onSend={props.onSend}
          disabled={props.blockedByMe}
        />
      </>
    );
  }
  return <LiveDmThread {...props} conversationId={props.conversationId} />;
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
        <ChatStatusNotice message={LOADING_MESSAGES_LABEL} />
      ) : (
        <MessageList
          welcome={<DmWelcome partner={partner} />}
          messages={messages}
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
        onSend={onSend}
        disabled={blockedByMe}
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
