import { NOTIFICATIONS_TITLE } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import { CountBadge } from "../../../../components/ui/CountBadge";
import { useThemeColors } from "../../../../theme/theme-context";
import { useOptionalNotifications } from "../../NotificationsContext";

export function NotificationsButton() {
  const colors = useThemeColors();
  const notifications = useOptionalNotifications();
  if (!notifications) return null;

  const { unreadCount, open } = notifications;
  return (
    <TouchableOpacity
      className="relative w-9 h-9 rounded-[10px] items-center justify-center"
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0
          ? `${NOTIFICATIONS_TITLE}, ${unreadCount} sin leer`
          : NOTIFICATIONS_TITLE
      }
    >
      <Feather name="bell" size={19} color={colors.textSubtle} />
      {unreadCount > 0 ? (
        <CountBadge
          count={unreadCount}
          label={`${unreadCount} notificaciones sin leer`}
          className="absolute -right-0.5 top-0 border-2 border-surface-panel"
        />
      ) : null}
    </TouchableOpacity>
  );
}
