import {
  PRIVATE_CALL_ACCEPT,
  PRIVATE_CALL_DECLINE,
  pushNotificationTarget,
  type PushTarget,
} from "@discordia/client-shared";

import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

import {
  ACCEPT_CALL_ACTION,
  DECLINE_CALL_ACTION,
  INCOMING_CALL_CATEGORY,
  type PushCallAction,
  pushCallActionOf,
} from "./callActions";

export function configurePushNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  void registerIncomingCallCategory().catch(() => undefined);
}

function registerIncomingCallCategory() {
  return Notifications.setNotificationCategoryAsync(INCOMING_CALL_CATEGORY, [
    {
      identifier: DECLINE_CALL_ACTION,
      buttonTitle: PRIVATE_CALL_DECLINE,
      options: { opensAppToForeground: true },
    },
    {
      identifier: ACCEPT_CALL_ACTION,
      buttonTitle: PRIVATE_CALL_ACCEPT,
      options: { opensAppToForeground: true },
    },
  ]);
}

export function usePushCallAction(onAction: (action: PushCallAction) => void) {
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!response) return;
    const { notification, actionIdentifier } = response;
    const identifier = notification.request.identifier;
    if (handled.current === identifier) return;

    const action = pushCallActionOf({
      actionIdentifier,
      data: notification.request.content.data,
      sentAt: notification.date,
      now: Date.now(),
    });
    if (!action) return;

    handled.current = identifier;
    void Notifications.dismissNotificationAsync(identifier).catch(
      () => undefined,
    );
    onAction(action);
  }, [response, onAction]);
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
