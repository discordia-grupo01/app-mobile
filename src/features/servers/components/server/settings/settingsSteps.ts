import type { SettingsStep } from "./SettingsHeader";

/** Por dónde se entra a la configuración desde el menú del servidor. */
export type SettingsEntry = "menu" | "boosts" | "emojis";

export interface SettingsAccess {
  isOwner: boolean;
  canManageServer: boolean;
  canManageMessages: boolean;
  canReviewReports: boolean;
  canManageRoles: boolean;
  canBanMembers: boolean;
}

/**
 * Con dos secciones abiertas para todos (Boosts y Emojis), cualquier miembro
 * tiene menú de configuración: puede navegar entre las dos.
 */
export function hasSettingsMenu(_access?: SettingsAccess): boolean {
  return true;
}

export function initialSettingsStep(
  entry: SettingsEntry,
  hasMenu: boolean,
): SettingsStep {
  return hasMenu ? entry : "boosts";
}
