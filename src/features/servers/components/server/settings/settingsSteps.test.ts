import { hasSettingsMenu, initialSettingsStep } from "./settingsSteps";

const NO_PERMISSIONS = {
  isOwner: false,
  canManageServer: false,
  canManageMessages: false,
  canReviewReports: false,
  canManageRoles: false,
  canBanMembers: false,
};

describe("hasSettingsMenu", () => {
  it("cualquier miembro tiene menú porque ve al menos Boosts y Emojis", () => {
    expect(hasSettingsMenu(NO_PERMISSIONS)).toBe(true);
  });

  it("con permisos de gestión también tiene menú", () => {
    expect(hasSettingsMenu({ ...NO_PERMISSIONS, isOwner: true })).toBe(true);
    expect(hasSettingsMenu({ ...NO_PERMISSIONS, canManageServer: true })).toBe(
      true,
    );
  });
});

describe("initialSettingsStep", () => {
  it("con menú, abre por donde se entró", () => {
    expect(initialSettingsStep("menu", true)).toBe("menu");
    expect(initialSettingsStep("boosts", true)).toBe("boosts");
    expect(initialSettingsStep("emojis", true)).toBe("emojis");
  });

  it("sin menú, abre siempre en Boosts", () => {
    expect(initialSettingsStep("menu", false)).toBe("boosts");
    expect(initialSettingsStep("boosts", false)).toBe("boosts");
    expect(initialSettingsStep("emojis", false)).toBe("boosts");
  });
});
