import {
  editMessageContent,
  otherParticipantId,
  removeMessages,
  validateMessageContent,
  type Conversation,
  type DmMessage,
  type MessageAuthor,
  DEMO_AUTHORS,
} from "@discordia/client-shared";

import { useCallback, useMemo, useState } from "react";

import { useBlockedUsersContext } from "../blocks/blocked-users-context";
import { BLOCKS_ME, INITIALLY_UNREAD_CONVERSATION_IDS } from "./mock-data";
import {
  createLocalDmMessage,
  findOrCreateConversationWith,
  loadConversationMessages,
  loadConversations,
  saveConversationMessages,
} from "./mock-store";

export interface ConversationSummary {
  conversation: Conversation;
  partner: MessageAuthor;
  lastMessage: DmMessage | null;
  isUnread: boolean;
  /** Yo bloqueé al partner: no le puedo escribir. */
  blockedByMe: boolean;
  /** El partner me bloqueó a mí: mis envíos no se entregan. */
  blocksMe: boolean;
}

export type SendDmResult = "sent" | "blocked" | "invalid";

function unknownAuthor(id: string): MessageAuthor {
  return {
    id,
    name: "Usuario desconocido",
    avatarUrl: null,
    roleName: null,
    roleColor: null,
  };
}

export function useDirectMessages(currentAuthor: MessageAuthor | null) {
  const currentUserId = currentAuthor?.id ?? null;
  const { blockedIds } = useBlockedUsersContext();
  const [storeVersion, setStoreVersion] = useState(0);
  const [overrides, setOverrides] = useState<Record<string, DmMessage[]>>({});
  const [unreadIds, setUnreadIds] = useState<Set<string>>(
    () => new Set(INITIALLY_UNREAD_CONVERSATION_IDS),
  );
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  const conversations = useMemo(() => {
    // `storeVersion` no se lee: solo fuerza refrescar tras crear una conversacion nueva.
    void storeVersion;
    return currentUserId ? loadConversations(currentUserId) : [];
  }, [currentUserId, storeVersion]);

  const messagesFor = useCallback(
    (conversationId: string): DmMessage[] =>
      overrides[conversationId] ?? loadConversationMessages(conversationId),
    [overrides],
  );

  const summaries: ConversationSummary[] = useMemo(() => {
    if (!currentUserId) return [];
    return conversations.map((conversation) => {
      const partnerId = otherParticipantId(conversation, currentUserId);
      const messages = messagesFor(conversation.id);
      return {
        conversation,
        partner: DEMO_AUTHORS[partnerId] ?? unknownAuthor(partnerId),
        lastMessage: messages[messages.length - 1] ?? null,
        isUnread: unreadIds.has(conversation.id),
        blockedByMe: blockedIds.has(partnerId),
        blocksMe: BLOCKS_ME.has(partnerId),
      };
    });
  }, [conversations, messagesFor, currentUserId, unreadIds, blockedIds]);

  const activeMessages = activeConversationId
    ? messagesFor(activeConversationId)
    : [];
  const activeSummary =
    summaries.find((s) => s.conversation.id === activeConversationId) ?? null;

  function openConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    setUnreadIds((prev) => {
      if (!prev.has(conversationId)) return prev;
      const next = new Set(prev);
      next.delete(conversationId);
      return next;
    });
  }

  function closeConversation() {
    setActiveConversationId(null);
  }

  const startConversationWith = useCallback(
    (partnerId: string) => {
      if (!currentUserId) return;
      const conversation = findOrCreateConversationWith(
        currentUserId,
        partnerId,
      );
      setStoreVersion((v) => v + 1);
      openConversation(conversation.id);
    },
    [currentUserId],
  );

  const updateConversationMessages = useCallback(
    (
      conversationId: string,
      updater: (messages: DmMessage[]) => DmMessage[],
    ) => {
      const updated = updater(messagesFor(conversationId));
      saveConversationMessages(conversationId, updated);
      setOverrides((prev) => ({ ...prev, [conversationId]: updated }));
    },
    [messagesFor],
  );

  const sendMessage = useCallback(
    (content: string): SendDmResult => {
      if (!currentAuthor || !activeConversationId || !activeSummary) {
        return "invalid";
      }
      if (validateMessageContent(content)) return "invalid";
      if (activeSummary.blockedByMe || activeSummary.blocksMe) {
        return "blocked";
      }

      const message = createLocalDmMessage(
        activeConversationId,
        currentAuthor.id,
        content,
      );
      updateConversationMessages(activeConversationId, (messages) => [
        ...messages,
        message,
      ]);
      return "sent";
    },
    [
      currentAuthor,
      activeConversationId,
      activeSummary,
      updateConversationMessages,
    ],
  );

  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (!activeConversationId || validateMessageContent(content)) return;
      updateConversationMessages(activeConversationId, (messages) =>
        messages.map((message) =>
          message.id === messageId
            ? editMessageContent(message, content.trim())
            : message,
        ),
      );
    },
    [activeConversationId, updateConversationMessages],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!activeConversationId) return;
      updateConversationMessages(activeConversationId, (messages) =>
        removeMessages(messages, [messageId]),
      );
    },
    [activeConversationId, updateConversationMessages],
  );

  const knownPartners = useMemo(
    () =>
      Object.values(DEMO_AUTHORS).filter(
        (author) => author.id !== currentUserId,
      ),
    [currentUserId],
  );

  return {
    conversations: summaries,
    activeConversationId,
    activeMessages,
    activeSummary,
    knownPartners,
    openConversation,
    closeConversation,
    startConversationWith,
    sendMessage,
    editMessage,
    deleteMessage,
  };
}
