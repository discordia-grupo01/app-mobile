import {
  ADD_REACTION_LABEL,
  canDeleteMessage,
  canEditMessage,
  type Channel,
  type MessageAuthor,
  type Role,
} from "@discordia/client-shared";

import { useMemo, useState } from "react";

import { buildMentionResolver } from "../message-mentions";
import { useChannelMessages } from "../use-channel-messages";
import { EmojiPickerSheet } from "./EmojiPickerSheet";
import { MessageActionsSheet } from "./MessageActionsSheet";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";

interface ChannelChatProps {
  channel: Channel;
  currentAuthor: MessageAuthor | null;
  serverRoles: Role[];
  canManageMessages: boolean;
  canMentionEveryone: boolean;
}

export function ChannelChat({
  channel,
  currentAuthor,
  serverRoles,
  canManageMessages,
  canMentionEveryone,
}: ChannelChatProps) {
  const {
    messages,
    authors,
    sendMessage,
    toggleReaction,
    editMessage,
    deleteMessage,
  } = useChannelMessages(channel, currentAuthor);
  const [reactingToId, setReactingToId] = useState<string | null>(null);
  const [actionsMessageId, setActionsMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const resolveMention = useMemo(
    () => buildMentionResolver(authors, serverRoles),
    [authors, serverRoles],
  );

  const actionsMessage =
    messages.find((m) => m.id === actionsMessageId) ?? null;
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
      <MessageList
        channelName={channel.name}
        messages={messages}
        authors={authors}
        editingMessageId={editingMessageId}
        resolveMention={resolveMention}
        onToggleReaction={toggleReaction}
        onRequestReaction={setReactingToId}
        onRequestActions={setActionsMessageId}
        onSaveEdit={(id, content) => {
          editMessage(id, content);
          setEditingMessageId(null);
        }}
        onCancelEdit={() => setEditingMessageId(null)}
      />
      <MessageComposer
        channelName={channel.name}
        onSend={sendMessage}
        disabled={!currentAuthor}
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
