import { AppState, type AppStateStatus } from "react-native";

// La conexion, los tickets y la reconexion se prueban en `client-shared`
// (`createSocketManager`). Aca solo lo propio de React Native.
jest.mock("phoenix", () => {
  class FakeSocket {
    static instances: FakeSocket[] = [];
    params: () => { ticket: string };
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
    onOpen() {}
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
  // El manager guarda el socket en una variable del modulo: uno nuevo por test.
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

describe("socket de mobile", () => {
  it("conecta a la URL del gateway con el ticket", async () => {
    await socketModule.acquireSocket();

    expect(lastSocket().url).toMatch(/^wss?:\/\/.+\/socket$/);
    expect(lastSocket().params()).toEqual({ ticket: "A" });
  });

  it("al volver a primer plano con el socket caido reconecta con un ticket nuevo", async () => {
    await socketModule.acquireSocket();
    const socket = lastSocket();
    socket.params();
    socket.connect.mockClear();
    socket.isConnected.mockReturnValue(false);
    mockedFetchTicket().mockResolvedValue(ticket("B"));

    appStateListener?.("active");
    await jest.advanceTimersByTimeAsync(0);

    expect(socket.connect).toHaveBeenCalledTimes(1);
    expect(socket.params()).toEqual({ ticket: "B" });
  });

  it("al volver a primer plano con el socket abierto no hace nada", async () => {
    await socketModule.acquireSocket();
    const socket = lastSocket();
    socket.connect.mockClear();
    socket.isConnected.mockReturnValue(true);
    mockedFetchTicket().mockClear();

    appStateListener?.("active");
    await jest.advanceTimersByTimeAsync(1_000);

    expect(mockedFetchTicket()).not.toHaveBeenCalled();
    expect(socket.connect).not.toHaveBeenCalled();
  });
});
