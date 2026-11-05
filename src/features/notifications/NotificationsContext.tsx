import { createContext, useContext } from "react";

export interface NotificationsValue {
  unreadCount: number;
  open: () => void;
}

const NotificationsContext = createContext<NotificationsValue | null>(null);

export const NotificationsProvider = NotificationsContext.Provider;

export function useOptionalNotifications(): NotificationsValue | null {
  return useContext(NotificationsContext);
}
