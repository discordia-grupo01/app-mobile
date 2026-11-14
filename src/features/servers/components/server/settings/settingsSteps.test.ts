import { hasSettingsMenu, initialSettingsStep } from "./settingsSteps";

const NO_PERMISSIONS = {
  isOwner: false,
  canManageServer: false,
  canManageMessages: false,
  canReviewReports: false,
};

describe("hasSettingsMenu", () => {
  it("un miembro sin permisos no tiene menú", () => {
    expect(hasSettingsMenu(NO_PERMISSIONS)).toBe(false);
  });

  it("cualquier permiso de gestión suma el menú", () => {
    expect(hasSettingsMenu({ ...NO_PERMISSIONS, isOwner: true })).toBe(true);
    expect(hasSettingsMenu({ ...NO_PERMISSIONS, canManageServer: true })).toBe(
      true,
    );
    expect(
      hasSettingsMenu({ ...NO_PERMISSIONS, canManageMessages: true }),
    ).toBe(true);
    expect(hasSettingsMenu({ ...NO_PERMISSIONS, canReviewReports: true })).toBe(
      true,
    );
  });
});

describe("initialSettingsStep", () => {
  it("con menú, abre por donde se entró", () => {
    expect(initialSettingsStep("menu", true)).toBe("menu");
    expect(initialSettingsStep("boosts", true)).toBe("boosts");
  });

  it("sin menú, abre siempre en Boosts", () => {
    expect(initialSettingsStep("menu", false)).toBe("boosts");
    expect(initialSettingsStep("boosts", false)).toBe("boosts");
  });
});
