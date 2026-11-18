import { createContext, useContext } from "react";

export interface NotificationsValue {
  unreadCount: number;
  open: () => void;
  /** Marca leído todo lo de un servidor sin entrar (riel de servidores). */
  markServerRead: (serverId: string) => void;
}

const NotificationsContext = createContext<NotificationsValue | null>(null);

export const NotificationsProvider = NotificationsContext.Provider;

export function useOptionalNotifications(): NotificationsValue | null {
  return useContext(NotificationsContext);
}
