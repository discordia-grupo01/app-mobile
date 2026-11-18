import {
  accountSettingsRequest,
  createNavigationRequest,
  serverBoostsRequest,
} from "./navigationRequests";

describe("createNavigationRequest", () => {
  it("avisa a quien escucha y guarda el pedido hasta que lo toman", () => {
    const channel = createNavigationRequest<string>();
    const seen = jest.fn();
    const stop = channel.subscribe(seen);

    channel.request("club");

    expect(seen).toHaveBeenCalledWith("club");
    expect(channel.take()).toBe("club");
    expect(channel.take()).toBeNull();
    stop();
  });

  it("solo entrega el pedido a quien corresponde", () => {
    const channel = createNavigationRequest<string>();
    channel.request("club");

    expect(channel.take((id) => id === "otro")).toBeNull();
    expect(channel.take((id) => id === "club")).toBe("club");
  });

  it("deja de avisar al desuscribirse", () => {
    const channel = createNavigationRequest<string>();
    const seen = jest.fn();
    channel.subscribe(seen)();

    channel.request("club");

    expect(seen).not.toHaveBeenCalled();
  });
});

describe("serverBoostsRequest", () => {
  it("lleva el servidor y la pestaña pedida", () => {
    serverBoostsRequest.request({ serverId: "s1", tab: "benefits" });

    expect(
      serverBoostsRequest.take(({ serverId }) => serverId === "s1"),
    ).toEqual({
      serverId: "s1",
      tab: "benefits",
    });
  });
});

describe("accountSettingsRequest", () => {
  it("guarda y entrega la sección pedida (por ejemplo, subscriptions)", () => {
    accountSettingsRequest.request("subscriptions");

    expect(accountSettingsRequest.take()).toBe("subscriptions");
    expect(accountSettingsRequest.take()).toBeNull();
  });
});
