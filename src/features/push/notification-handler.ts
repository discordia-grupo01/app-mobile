import {
  pushNotificationTarget,
  type PushTarget,
} from "@discordia/client-shared";

import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

export function configurePushNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export function usePushNotificationTap(
  isReady: boolean,
  onTarget: (target: PushTarget) => void,
) {
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!isReady || !response) return;
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
      return;
    }

    const identifier = response.notification.request.identifier;
    if (handled.current === identifier) return;
    handled.current = identifier;

    const target = pushNotificationTarget(
      response.notification.request.content.data,
    );
    if (target) onTarget(target);
  }, [isReady, response, onTarget]);
}
