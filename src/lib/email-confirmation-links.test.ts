import { getConfirmationToken } from "./email-confirmation-links";

jest.mock("react-native", () => ({ Linking: { addEventListener: jest.fn() } }));

describe("getConfirmationToken", () => {
  it("lee el token del link que abre la página puente en el APK", () => {
    expect(getConfirmationToken("discordia://confirm-email?token=abc123")).toBe(
      "abc123",
    );
  });

  it("lee el token en Expo Go", () => {
    expect(
      getConfirmationToken(
        "exp://192.168.0.10:8081/--/confirm-email?foo=1&token=abc%2F1",
      ),
    ).toBe("abc/1");
  });

  it("ignora otros links de la app aunque traigan parámetros", () => {
    expect(
      getConfirmationToken(
        "discordia://billing/return?kind=points&token=no-es-de-mail",
      ),
    ).toBeUndefined();
  });

  it("ignora un link de confirmación sin token", () => {
    expect(getConfirmationToken("discordia://confirm-email")).toBeUndefined();
  });
});
