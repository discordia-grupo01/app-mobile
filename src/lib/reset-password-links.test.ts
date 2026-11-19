import { getResetPasswordToken } from "./reset-password-links";

jest.mock("react-native", () => ({ Linking: { addEventListener: jest.fn() } }));

describe("getResetPasswordToken", () => {
  it("lee el token del link con esquema propio", () => {
    expect(
      getResetPasswordToken("discordia://reset-password?token=abc123"),
    ).toBe("abc123");
  });

  it("lee el token en Expo Go", () => {
    expect(
      getResetPasswordToken(
        "exp://192.168.0.10:8081/--/reset-password?token=abc%2F1",
      ),
    ).toBe("abc/1");
  });

  // El link https del mail lo abre la pagina puente de la web, que redirige a
  // discordia://reset-password; la app nunca ve la URL https.
  it("ignora el link https de la web", () => {
    expect(
      getResetPasswordToken(
        "https://web-client-chi-inky.vercel.app/reset-password?token=xyz789",
      ),
    ).toBeUndefined();
  });

  it("ignora otros links de la app aunque traigan token", () => {
    expect(
      getResetPasswordToken("discordia://confirm-email?token=abc"),
    ).toBeUndefined();
    expect(
      getResetPasswordToken("discordia://invite/servidor?token=nope"),
    ).toBeUndefined();
  });

  it("ignora un link de reset sin token", () => {
    expect(getResetPasswordToken("discordia://reset-password")).toBeUndefined();
  });

  it("devuelve undefined para urls no relacionadas", () => {
    expect(getResetPasswordToken("https://discordia.app/home")).toBeUndefined();
  });
});
