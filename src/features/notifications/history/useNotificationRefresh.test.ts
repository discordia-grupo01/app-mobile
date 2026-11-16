import { retryUntilFound } from "./useNotificationRefresh";

jest.mock("react-native", () => ({
  AppState: { currentState: "active", addEventListener: jest.fn() },
}));

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

async function advance(ms: number) {
  jest.advanceTimersByTime(ms);
  await Promise.resolve();
  await Promise.resolve();
}

describe("retryUntilFound", () => {
  it("reintenta hasta encontrar algo nuevo", async () => {
    const refresh = jest
      .fn<Promise<boolean>, []>()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    retryUntilFound(refresh, [100, 200, 300]);
    await advance(100);
    await advance(200);
    await advance(300);

    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("se detiene al agotar las esperas", async () => {
    const refresh = jest.fn<Promise<boolean>, []>().mockResolvedValue(false);

    retryUntilFound(refresh, [100, 100]);
    await advance(100);
    await advance(100);
    await advance(1000);

    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("cancelar corta los reintentos pendientes", async () => {
    const refresh = jest.fn<Promise<boolean>, []>().mockResolvedValue(false);

    const cancel = retryUntilFound(refresh, [100, 100]);
    cancel();
    await advance(500);

    expect(refresh).not.toHaveBeenCalled();
  });
});
