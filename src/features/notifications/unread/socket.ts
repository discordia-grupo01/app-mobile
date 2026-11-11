import {
  CHANGE_SOCKET_EVENTS,
  createSocketManager,
  isResourceChangedPayload,
  PLATFORM_STATUS_SOCKET_EVENTS,
  UNREAD_SOCKET_EVENTS,
  type PlatformStatusChangedPayload,
  type ResourceChangedPayload,
  type UnreadSnapshotPayload,
  unreadTopic,
  type UnreadUpdatedPayload,
} from "@discordia/client-shared";
import { type Channel, Socket } from "phoenix";
import { AppState } from "react-native";

import { env } from "../../../lib/env";
import { fetchUnreadSocketTicket } from "../api";

export interface UnreadHandlers {
  snapshot: (payload: UnreadSnapshotPayload) => void;
  updated: (payload: UnreadUpdatedPayload) => void;
  statusChanged?: (payload: PlatformStatusChangedPayload) => void;
  changed?: (payload: ResourceChangedPayload) => void;
}

export interface UnreadConnection {
  markRead: (channelId: string) => void;
  markAllRead: () => Promise<boolean>;
  disconnect: () => void;
}

const unreadSocket = createSocketManager({
  createSocket: (params) => new Socket(env.notificationsWsUrl, { params }),
  fetchTicket: fetchUnreadSocketTicket,
  watchLifecycle: ({ reconnectIfDisconnected }) => {
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") reconnectIfDisconnected();
    });
    return () => subscription.remove();
  },
});

export function connectUnread(
  userId: string,
  handlers: UnreadHandlers,
): UnreadConnection {
  let disposed = false;
  let channel: Channel | null = null;
  let release: (() => void) | null = null;

  void unreadSocket.acquireSocket().then((acquired) => {
    if (!acquired.ok) return;
    if (disposed) {
      acquired.release();
      return;
    }
    release = acquired.release;
    channel = acquired.socket.channel(unreadTopic(userId), {});
    channel.on(UNREAD_SOCKET_EVENTS.snapshot, handlers.snapshot);
    channel.on(UNREAD_SOCKET_EVENTS.updated, handlers.updated);
    if (handlers.statusChanged) {
      channel.on(PLATFORM_STATUS_SOCKET_EVENTS.changed, handlers.statusChanged);
    }
    const { changed } = handlers;
    if (changed) {
      channel.on(CHANGE_SOCKET_EVENTS.changed, (payload: unknown) => {
        if (isResourceChangedPayload(payload)) changed(payload);
      });
    }
    channel.join();
  });

  return {
    markRead: (channelId) => {
      channel?.push(UNREAD_SOCKET_EVENTS.markRead, { channel_id: channelId });
    },
    markAllRead: () =>
      new Promise<boolean>((resolve) => {
        const joined = channel;
        if (!joined) {
          resolve(false);
          return;
        }
        joined
          .push(UNREAD_SOCKET_EVENTS.markAllRead, {})
          .receive("ok", () => resolve(true))
          .receive("error", () => resolve(false))
          .receive("timeout", () => resolve(false));
      }),
    disconnect: () => {
      disposed = true;
      channel?.leave();
      release?.();
    },
  };
}
