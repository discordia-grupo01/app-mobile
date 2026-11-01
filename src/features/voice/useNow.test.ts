import { getNow, subscribeToNow } from "./useNow";

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-11-01T16:00:00Z"));
});

afterEach(() => {
  jest.useRealTimers();
});

describe("subscribeToNow", () => {
  it("arranca con la hora actual y avanza cada segundo", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToNow(listener);
    const start = getNow();
    expect(start).toBe(Date.parse("2026-11-01T16:00:00Z"));

    jest.advanceTimersByTime(3000);

    expect(getNow()).toBe(start + 3000);
    expect(listener).toHaveBeenCalledTimes(4);
    unsubscribe();
  });

  it("comparte un solo intervalo y lo apaga sin usuarios", () => {
    const setIntervalSpy = jest.spyOn(globalThis, "setInterval");
    const clearIntervalSpy = jest.spyOn(globalThis, "clearInterval");

    const first = subscribeToNow(jest.fn());
    const second = subscribeToNow(jest.fn());
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    first();
    expect(clearIntervalSpy).not.toHaveBeenCalled();
    second();
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });

  it("deja de avisar a quien se desuscribio", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToNow(listener);
    unsubscribe();
    listener.mockClear();

    jest.advanceTimersByTime(2000);

    expect(listener).not.toHaveBeenCalled();
  });
});
