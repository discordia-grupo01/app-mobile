import { AppState, type AppStateStatus } from "react-native";

jest.mock("phoenix", () => {
  class FakeSocket {
    static instances: FakeSocket[] = [];
    params: () => { ticket: string };
    openCallback: (() => void) | null = null;
    closeCallback: (() => void) | null = null;
    connect = jest.fn();
    disconnect = jest.fn((callback?: () => void) => callback?.());
    isConnected = jest.fn(() => false);
    url: string;
    constructor(url: string, options: { params: () => { ticket: string } }) {
      this.url = url;
      this.params = options.params;
      FakeSocket.instances.push(this);
    }
    onOpen(callback: () => void) {
      this.openCallback = callback;
    }
    onClose(callback: () => void) {
      this.closeCallback = callback;
    }
  }
  return { Socket: FakeSocket };
});
jest.mock("./api", () => ({ fetchSocketTicket: jest.fn() }));

type SocketModule = typeof import("./socket");
let socketModule: SocketModule;
let api: typeof import("./api");
let FakeSocket: {
  instances: {
    url: string;
    params: () => { ticket: string };
    openCallback: (() => void) | null;
    closeCallback: (() => void) | null;
    connect: jest.Mock;
    disconnect: jest.Mock;
    isConnected: jest.Mock;
  }[];
};
let appStateListener: ((state: AppStateStatus) => void) | null = null;

function ticket(value: string) {
  return { ok: true as const, ticket: value };
}

const TRANSIENT = { ok: false as const, sessionExpired: false };
const SESSION_DEAD = { ok: false as const, sessionExpired: true };

function lastSocket() {
  const [socket] = FakeSocket.instances;
  return socket;
}

function mockedFetchTicket() {
  return api.fetchSocketTicket as unknown as jest.Mock;
}

/* eslint-disable @typescript-eslint/no-require-imports -- jest no soporta import() dinamico sin flags */
beforeEach(() => {
  jest.useFakeTimers();
  jest.resetModules();
  // El manager guarda el socket en una variable de modulo: uno nuevo por test.
  FakeSocket = require("phoenix").Socket;
  api = require("./api");
  socketModule = require("./socket");
  mockedFetchTicket().mockResolvedValue(ticket("A"));
  appStateListener = null;
  jest.spyOn(AppState, "addEventListener").mockImplementation(((
    _type: string,
    listener: (state: AppStateStatus) => void,
  ) => {
    appStateListener = listener;
    return { remove: jest.fn() };
  }) as typeof AppState.addEventListener);
});

/* eslint-enable @typescript-eslint/no-require-imports */

afterEach(() => {
  socketModule.closeSocket();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe("acquireSocket", () => {
  it("abre un solo socket aunque lo pidan varios a la vez", async () => {
    const [a, b] = await Promise.all([
      socketModule.acquireSocket(),
      socketModule.acquireSocket(),
    ]);

    expect(a.ok && b.ok).toBe(true);
    expect(mockedFetchTicket()).toHaveBeenCalledTimes(1);
    expect(FakeSocket.instances).toHaveLength(1);
    expect(lastSocket().connect).toHaveBeenCalledTimes(1);
  });

  it("conecta a la URL del gateway con el ticket", async () => {
    await socketModule.acquireSocket();

    expect(lastSocket().url).toMatch(/^wss?:\/\/.+\/socket$/);
    expect(lastSocket().params()).toEqual({ ticket: "A" });
  });

  it("el ticket es de un solo uso: se entrega una vez y no se reutiliza", async () => {
    await socketModule.acquireSocket();

    expect(lastSocket().params()).toEqual({ ticket: "A" });
    expect(lastSocket().params()).toEqual({ ticket: "" });
  });

  it("si no hay sesion para pedir el ticket no abre el socket", async () => {
    mockedFetchTicket().mockResolvedValue(SESSION_DEAD);

    expect(await socketModule.acquireSocket()).toEqual({
      ok: false,
      sessionExpired: true,
    });
    expect(FakeSocket.instances).toHaveLength(0);
  });

  it("un fallo transitorio se distingue de una sesion muerta", async () => {
    mockedFetchTicket().mockResolvedValue(TRANSIENT);

    expect(await socketModule.acquireSocket()).toEqual({
      ok: false,
      sessionExpired: false,
    });
  });
});

describe("release", () => {
  it("cierra el socket cuando nadie lo usa, no antes", async () => {
    const a = await socketModule.acquireSocket();
    const b = await socketModule.acquireSocket();
    if (!a.ok || !b.ok) throw new Error("no abrio");

    a.release();
    await jest.advanceTimersByTimeAsync(10_000);
    expect(lastSocket().disconnect).not.toHaveBeenCalled();

    b.release();
    await jest.advanceTimersByTimeAsync(10_000);
    expect(lastSocket().disconnect).toHaveBeenCalledTimes(1);
  });

  it("no cierra si alguien lo vuelve a pedir enseguida (cambio de canal)", async () => {
    const first = await socketModule.acquireSocket();
    if (!first.ok) throw new Error("no abrio");
    first.release();

    await jest.advanceTimersByTimeAsync(1_000);
    const second = await socketModule.acquireSocket();
    await jest.advanceTimersByTimeAsync(20_000);

    expect(second.ok).toBe(true);
    expect(FakeSocket.instances).toHaveLength(1);
    expect(lastSocket().disconnect).not.toHaveBeenCalled();
  });

  it("es idempotente: soltar dos veces no resta de mas", async () => {
    const a = await socketModule.acquireSocket();
    const b = await socketModule.acquireSocket();
    if (!a.ok || !b.ok) throw new Error("no abrio");

    a.release();
    a.release();
    await jest.advanceTimersByTimeAsync(10_000);

    expect(lastSocket().disconnect).not.toHaveBeenCalled();
  });
});

describe("reconexion con un ticket nuevo", () => {
  async function openAndClose() {
    await socketModule.acquireSocket();
    const socket = lastSocket();
    socket.params(); // Phoenix consume el ticket al conectar
    socket.connect.mockClear();
    socket.disconnect.mockClear();
    return socket;
  }

  it("al cerrarse pide un ticket nuevo y vuelve a conectar con el", async () => {
    const socket = await openAndClose();
    mockedFetchTicket().mockResolvedValue(ticket("B"));

    socket.closeCallback?.();
    await jest.advanceTimersByTimeAsync(0);

    expect(socket.disconnect).toHaveBeenCalledTimes(1);
    expect(socket.connect).toHaveBeenCalledTimes(1);
    expect(socket.params()).toEqual({ ticket: "B" });
  });

  it("cada reconexion usa un ticket distinto", async () => {
    const socket = await openAndClose();

    mockedFetchTicket().mockResolvedValue(ticket("B"));
    socket.closeCallback?.();
    await jest.advanceTimersByTimeAsync(0);
    expect(socket.params()).toEqual({ ticket: "B" });
    socket.openCallback?.();

    mockedFetchTicket().mockResolvedValue(ticket("C"));
    socket.closeCallback?.();
    await jest.advanceTimersByTimeAsync(0);
    expect(socket.params()).toEqual({ ticket: "C" });
  });

  it("ignora un segundo cierre mientras la reconexion esta en curso", async () => {
    const socket = await openAndClose();
    mockedFetchTicket().mockReturnValue(new Promise(() => {}));

    socket.closeCallback?.();
    socket.closeCallback?.();
    socket.closeCallback?.();
    await jest.advanceTimersByTimeAsync(0);

    expect(socket.disconnect).toHaveBeenCalledTimes(1);
    expect(mockedFetchTicket()).toHaveBeenCalledTimes(2); // 1 de apertura + 1
  });

  it("si el ticket falla por la red reintenta con backoff hasta lograrlo", async () => {
    const socket = await openAndClose();
    mockedFetchTicket()
      .mockResolvedValueOnce(TRANSIENT)
      .mockResolvedValueOnce(TRANSIENT)
      .mockResolvedValueOnce(ticket("B"));

    socket.closeCallback?.();
    await jest.advanceTimersByTimeAsync(0);
    expect(socket.connect).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(1_000);
    expect(socket.connect).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(2_000);
    expect(socket.connect).toHaveBeenCalledTimes(1);
    expect(socket.params()).toEqual({ ticket: "B" });
  });

  it("si el servidor rechaza el handshake una y otra vez, espera cada vez mas", async () => {
    const socket = await openAndClose();
    mockedFetchTicket().mockResolvedValue(ticket("X"));

    // 1er cierre: enseguida.
    socket.closeCallback?.();
    await jest.advanceTimersByTimeAsync(0);
    expect(socket.connect).toHaveBeenCalledTimes(1);

    // 2do cierre sin haber abierto: espera 1 s.
    socket.closeCallback?.();
    await jest.advanceTimersByTimeAsync(500);
    expect(socket.connect).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(500);
    expect(socket.connect).toHaveBeenCalledTimes(2);

    // 3er cierre: espera 2 s.
    socket.closeCallback?.();
    await jest.advanceTimersByTimeAsync(1_500);
    expect(socket.connect).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(500);
    expect(socket.connect).toHaveBeenCalledTimes(3);
  });

  it("el backoff vuelve a cero cuando el socket llega a abrir", async () => {
    const socket = await openAndClose();
    mockedFetchTicket().mockResolvedValue(ticket("X"));

    socket.closeCallback?.();
    await jest.advanceTimersByTimeAsync(0);
    socket.closeCallback?.();
    await jest.advanceTimersByTimeAsync(1_000);
    expect(socket.connect).toHaveBeenCalledTimes(2);

    socket.openCallback?.();
    socket.closeCallback?.();
    await jest.advanceTimersByTimeAsync(0);

    expect(socket.connect).toHaveBeenCalledTimes(3);
  });

  it("si la sesion murio al pedir el ticket cierra el socket y avisa", async () => {
    const socket = await openAndClose();
    const listener = jest.fn();
    socketModule.onSocketSessionExpired(listener);
    mockedFetchTicket().mockResolvedValue(SESSION_DEAD);

    socket.closeCallback?.();
    await jest.advanceTimersByTimeAsync(0);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(socket.connect).not.toHaveBeenCalled();
  });

  it("no reconecta cuando el cierre lo provoca el propio manager", async () => {
    const socket = await openAndClose();
    mockedFetchTicket().mockClear();

    socketModule.closeSocket();
    socket.closeCallback?.();
    await jest.advanceTimersByTimeAsync(5_000);

    expect(mockedFetchTicket()).not.toHaveBeenCalled();
    expect(socket.connect).not.toHaveBeenCalled();
  });

  it("al volver a primer plano con el socket caido reconecta con un ticket nuevo", async () => {
    const socket = await openAndClose();
    socket.isConnected.mockReturnValue(false);
    mockedFetchTicket().mockResolvedValue(ticket("B"));

    appStateListener?.("active");
    await jest.advanceTimersByTimeAsync(0);

    expect(socket.connect).toHaveBeenCalledTimes(1);
    expect(socket.params()).toEqual({ ticket: "B" });
  });

  it("al volver a primer plano con el socket abierto no hace nada", async () => {
    const socket = await openAndClose();
    socket.isConnected.mockReturnValue(true);
    mockedFetchTicket().mockClear();

    appStateListener?.("active");
    await jest.advanceTimersByTimeAsync(1_000);

    expect(mockedFetchTicket()).not.toHaveBeenCalled();
    expect(socket.connect).not.toHaveBeenCalled();
  });
});
