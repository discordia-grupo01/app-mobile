import { newIdempotencyKey } from "./idempotencyKey";

describe("newIdempotencyKey", () => {
  it("tiene forma de UUID v4", () => {
    expect(newIdempotencyKey()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("no se repite entre llamadas", () => {
    const keys = new Set(
      Array.from({ length: 200 }, () => newIdempotencyKey()),
    );
    expect(keys.size).toBe(200);
  });
});
