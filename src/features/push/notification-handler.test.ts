import * as Notifications from "expo-notifications";

import { configurePushNotifications } from "./notification-handler";

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  setNotificationCategoryAsync: jest.fn(() => Promise.resolve()),
  useLastNotificationResponse: jest.fn(),
  DEFAULT_ACTION_IDENTIFIER: "expo.modules.notifications.actions.DEFAULT",
}));

describe("configurePushNotifications", () => {
  it("no muestra ningun aviso mientras la app esta en primer plano", async () => {
    configurePushNotifications();

    const { handleNotification } = (
      Notifications.setNotificationHandler as jest.Mock
    ).mock.calls[0][0];

    expect(await handleNotification()).toEqual({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    });
  });

  it("registra la llamada entrante con los botones Rechazar y Aceptar", () => {
    configurePushNotifications();

    expect(Notifications.setNotificationCategoryAsync).toHaveBeenCalledWith(
      "private_call_incoming",
      [
        expect.objectContaining({
          identifier: "decline_call",
          buttonTitle: "Rechazar",
        }),
        expect.objectContaining({
          identifier: "accept_call",
          buttonTitle: "Aceptar",
        }),
      ],
    );
  });
});
