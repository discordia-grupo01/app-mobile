import {
  NO_NOTIFICATION_SETTINGS,
  type NotificationSettings,
} from "@discordia/client-shared";

import {
  updateChannelNotificationSettings,
  updateServerNotificationSettings,
} from "./api";
import { saveNotificationSetting } from "./useNotificationSettings";

jest.mock("./api", () => ({
  listNotificationSettings: jest.fn(),
  updateChannelNotificationSettings: jest.fn(),
  updateServerNotificationSettings: jest.fn(),
}));

const mockedChannel = updateChannelNotificationSettings as jest.MockedFunction<
  typeof updateChannelNotificationSettings
>;
const mockedServer = updateServerNotificationSettings as jest.MockedFunction<
  typeof updateServerNotificationSettings
>;

function storeWith(initial: NotificationSettings) {
  let value = initial;
  const history: NotificationSettings[] = [];
  return {
    store: {
      get: () => value,
      set: (next: NotificationSettings) => {
        value = next;
        history.push(next);
      },
    },
    current: () => value,
    history,
  };
}

beforeEach(() => {
  mockedChannel.mockReset();
  mockedServer.mockReset();
});

describe("saveNotificationSetting", () => {
  it("silencia el canal antes de que conteste el back", async () => {
    const { store, history, current } = storeWith(NO_NOTIFICATION_SETTINGS);
    mockedChannel.mockResolvedValue({ ok: true, muted: true, level: null });

    const result = await saveNotificationSetting(store, "channel", "c1", {
      muted: true,
    });

    expect(result).toEqual({ ok: true });
    expect(history[0].mutedChannels).toEqual({ c1: true });
    expect(current().mutedChannels).toEqual({ c1: true });
  });

  it("se queda con lo que confirma el back", async () => {
    const { store, current } = storeWith(NO_NOTIFICATION_SETTINGS);
    mockedServer.mockResolvedValue({ ok: true, muted: false, level: "all" });

    await saveNotificationSetting(store, "server", "s1", { level: "none" });

    expect(current().serverLevels).toEqual({ s1: "all" });
  });

  it("si falla, vuelve el destino a como estaba y devuelve el mensaje", async () => {
    const initial: NotificationSettings = {
      ...NO_NOTIFICATION_SETTINGS,
      channelLevels: { c1: "mentions" },
    };
    const { store, current } = storeWith(initial);
    mockedChannel.mockResolvedValue({ ok: false, message: "No se pudo" });

    const result = await saveNotificationSetting(store, "channel", "c1", {
      level: "none",
      muted: true,
    });

    expect(result).toEqual({ ok: false, message: "No se pudo" });
    expect(current().channelLevels).toEqual({ c1: "mentions" });
    expect(current().mutedChannels).toEqual({});
  });

  it("borrar el nivel (null) hace que el canal vuelva a heredar", async () => {
    const { store, current } = storeWith({
      ...NO_NOTIFICATION_SETTINGS,
      channelLevels: { c1: "all" },
    });
    mockedChannel.mockResolvedValue({ ok: true, muted: false, level: null });

    await saveNotificationSetting(store, "channel", "c1", { level: null });

    expect(current().channelLevels).toEqual({});
  });
});
