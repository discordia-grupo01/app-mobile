import type {
  ConversationSummary,
  Message,
  NotificationHistoryItem,
} from "@discordia/client-shared";

import {
  latestIncomingMessageId,
  messagingUnreadCheck,
  notificationTargetOf,
} from "./historyHelpers";

const mention = (
  overrides: Partial<NotificationHistoryItem> = {},
): NotificationHistoryItem => ({
  kind: "mention",
  message_id: "m1",
  author_id: "beto",
  occurred_at: "2026-11-04T12:00:00.000Z",
  server_id: "s1",
  channel_id: "c1",
  conversation_id: null,
  ...overrides,
});

const direct = (
  overrides: Partial<NotificationHistoryItem> = {},
): NotificationHistoryItem => ({
  kind: "direct_message",
  message_id: "d1",
  author_id: "carla",
  occurred_at: "2026-11-04T12:00:00.000Z",
  server_id: null,
  channel_id: null,
  conversation_id: "conv1",
  ...overrides,
});

const conversation = (
  conversationId: string | null,
  lastMessage: Partial<Message> | null,
  isUnread = false,
): ConversationSummary => ({
  conversationId,
  partner: {
    id: "p",
    name: "P",
    avatarUrl: null,
    roleName: null,
    roleColor: null,
  },
  lastMessage: lastMessage
    ? ({
        id: "x",
        user_id: "p",
        inserted_at: "2026-11-04T10:00:00Z",
        ...lastMessage,
      } as Message)
    : null,
  isUnread,
  blockedByMe: false,
});

describe("notificationTargetOf", () => {
  it("una mención lleva al canal", () => {
    expect(notificationTargetOf(mention())).toEqual({
      kind: "channel",
      serverId: "s1",
      channelId: "c1",
    });
  });

  it("un DM lleva a la conversación con el autor", () => {
    expect(notificationTargetOf(direct())).toEqual({
      kind: "direct",
      partnerId: "carla",
    });
  });

  it("una mención sin canal no lleva a ningún lado", () => {
    expect(notificationTargetOf(mention({ channel_id: null }))).toBeNull();
  });
});

describe("latestIncomingMessageId", () => {
  it("toma el más nuevo que no mandé yo", () => {
    expect(
      latestIncomingMessageId(
        [
          conversation("a", {
            id: "viejo",
            inserted_at: "2026-11-04T09:00:00Z",
          }),
          conversation("b", {
            id: "nuevo",
            inserted_at: "2026-11-04T11:00:00Z",
          }),
          conversation("c", {
            id: "mio",
            user_id: "me",
            inserted_at: "2026-11-04T12:00:00Z",
          }),
          conversation(null, null),
        ],
        "me",
      ),
    ).toBe("nuevo");
  });

  it("sin mensajes recibidos devuelve null", () => {
    expect(latestIncomingMessageId([], "me")).toBeNull();
  });
});

describe("messagingUnreadCheck", () => {
  const base = {
    areMentionsLoaded: true,
    isMentionUnread: (id: string) => id === "m1",
    areConversationsLoading: false,
    conversations: [conversation("conv1", null, true)],
  };

  it("una mención está sin leer si messaging la tiene sin leer", () => {
    const check = messagingUnreadCheck(base);
    expect(check(mention())).toBe(true);
    expect(check(mention({ message_id: "m2" }))).toBe(false);
  });

  it("un DM sigue la conversación", () => {
    expect(messagingUnreadCheck(base)(direct())).toBe(true);
    expect(
      messagingUnreadCheck({
        ...base,
        conversations: [conversation("conv1", null, false)],
      })(direct()),
    ).toBe(false);
  });

  it("mientras carga, todo cuenta como sin leer", () => {
    const check = messagingUnreadCheck({
      ...base,
      areMentionsLoaded: false,
      areConversationsLoading: true,
      conversations: [],
    });
    expect(check(mention({ message_id: "m2" }))).toBe(true);
    expect(check(direct())).toBe(true);
  });
});

describe("transferencia de propiedad", () => {
  const transfer = (): NotificationHistoryItem => ({
    kind: "ownership_transfer",
    message_id: "t1",
    author_id: "owner",
    to_user_id: "member",
    transfer_status: "pending",
    occurred_at: "2026-11-04T12:00:00.000Z",
    server_id: "s1",
    channel_id: null,
    conversation_id: null,
  });

  it("no abre ningun canal ni conversacion", () => {
    expect(notificationTargetOf(transfer())).toBeNull();
  });

  it("siempre cuenta como sin leer en mensajeria: solo la marca propia la lee", () => {
    const check = messagingUnreadCheck({
      areMentionsLoaded: true,
      isMentionUnread: () => false,
      areConversationsLoading: false,
      conversations: [],
    });

    expect(check(transfer())).toBe(true);
  });
});
