import type { ActivityStatus } from "@discordia/client-shared";
import { View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { usePresenceOf } from "../../presence/PresenceContext";
import { activityStatusColor } from "./activityStatusColor";

interface ActivityStatusDotProps {
  status: ActivityStatus;
  size?: number;
  ringWidth?: number;
  className?: string;
}

export function ActivityStatusDot({
  status,
  size = 12,
  ringWidth = 2,
  className,
}: ActivityStatusDotProps) {
  const colors = useThemeColors();
  return (
    <View
      accessible={false}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: ringWidth,
        backgroundColor: activityStatusColor(colors, status),
      }}
    />
  );
}

/** El puntito de una persona, con su estado en vivo. */
export function UserActivityStatusDot({
  userId,
  ...props
}: Omit<ActivityStatusDotProps, "status"> & { userId: string }) {
  const status = usePresenceOf(userId);
  return <ActivityStatusDot status={status} {...props} />;
}
