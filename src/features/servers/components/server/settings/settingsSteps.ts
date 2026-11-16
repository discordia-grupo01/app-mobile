import type { SettingsStep } from "./SettingsHeader";

/** Por dónde se entra a la configuración desde el menú del servidor. */
export type SettingsEntry = "menu" | "boosts";

interface SettingsAccess {
  isOwner: boolean;
  canManageServer: boolean;
  canManageMessages: boolean;
  canReviewReports: boolean;
}

/** Sin ningún permiso de gestión, Boosts es lo único que se ve: no hay menú. */
export function hasSettingsMenu(access: SettingsAccess): boolean {
  return (
    access.isOwner ||
    access.canManageServer ||
    access.canManageMessages ||
    access.canReviewReports
  );
}

export function initialSettingsStep(
  entry: SettingsEntry,
  hasMenu: boolean,
): SettingsStep {
  return hasMenu ? entry : "boosts";
}
