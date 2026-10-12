import type { ActivityStatus, ThemeColors } from "@discordia/client-shared";

/** Solo presentacion: el resto del modelo vive en `client-shared`. */
export function activityStatusColor(
  colors: ThemeColors,
  status: ActivityStatus,
): string {
  switch (status) {
    case "online":
      return colors.success;
    case "idle":
      return colors.warning;
    case "dnd":
      return colors.danger;
    case "offline":
      return colors.offline;
  }
}
