import { createNavigationRequest } from "./navigationRequests";

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
