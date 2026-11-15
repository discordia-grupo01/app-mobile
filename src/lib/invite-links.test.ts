import { appInviteLink, getInviteCode } from "./invite-links";

jest.mock("react-native", () => ({ Linking: { addEventListener: jest.fn() } }));

describe("appInviteLink", () => {
  it("usa el scheme de la app", () => {
    expect(appInviteLink("taller")).toBe("discordia://invite/taller");
  });
});

describe("getInviteCode", () => {
  it("lee el código del link de la app", () => {
    expect(getInviteCode("discordia://invite/taller")).toBe("taller");
    expect(getInviteCode("discordia://invite/xY7z2Qab_9kL/")).toBe(
      "xY7z2Qab_9kL",
    );
  });

  it("lee el código en Expo Go", () => {
    expect(getInviteCode("exp://192.168.0.10:8081/--/invite/taller")).toBe(
      "taller",
    );
  });

  it("ignora otros links de la app y los de la web", () => {
    expect(
      getInviteCode("discordia://confirm-email?token=abc"),
    ).toBeUndefined();
    expect(getInviteCode("discordia://invite/")).toBeUndefined();
    expect(
      getInviteCode("https://discordia.app/invite/taller"),
    ).toBeUndefined();
  });
});
