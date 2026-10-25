import { isIdleAppState } from "./useIdleReporter";

describe("isIdleAppState", () => {
  it("en segundo plano se avisa ausente", () => {
    expect(isIdleAppState("background")).toBe(true);
  });

  it("al volver a primer plano se avisa que volvio", () => {
    expect(isIdleAppState("active")).toBe(false);
  });

  it("los estados de transicion no cambian nada", () => {
    expect(isIdleAppState("inactive")).toBeNull();
    expect(isIdleAppState("unknown")).toBeNull();
  });
});
