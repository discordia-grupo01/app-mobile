import {
  ACTIVITY_STATUS_DESCRIPTION,
  ACTIVITY_STATUS_LABEL,
  ACTIVITY_STATUSES,
  type ActivityStatus,
} from "@discordia/client-shared";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

/** Solo presentacion: el resto del modelo vive en `client-shared`. */
export const ACTIVITY_STATUS_COLOR: Record<ActivityStatus, string> = {
  online: "#38A169",
  dnd: "#e05252",
  offline: "#4F5660",
};

interface ActivityStatusPickerProps {
  status: ActivityStatus;
  onChange: (status: ActivityStatus) => void;
}

export function ActivityStatusPicker({
  status,
  onChange,
}: ActivityStatusPickerProps) {
  const colors = useThemeColors();
  return (
    <View>
      <Text className="text-[11px] font-bold tracking-[1.2px] text-content-subtle mb-1.5">
        ESTADO DE ACTIVIDAD
      </Text>
      <View className="flex-row gap-1.5">
        {ACTIVITY_STATUSES.map((option) => {
          const active = option === status;
          const color = ACTIVITY_STATUS_COLOR[option];
          return (
            <TouchableOpacity
              key={option}
              onPress={() => onChange(option)}
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[10px] border border-line bg-surface-input py-[9px] px-1"
              style={
                active && {
                  backgroundColor: `${color}1A`,
                  borderColor: `${color}55`,
                }
              }
              activeOpacity={0.8}
            >
              <View
                className="w-2 h-2 rounded-sm"
                style={{
                  backgroundColor: active ? color : colors.textSubtle,
                }}
              />
              <Text
                className="text-[11px] font-semibold text-content-subtle"
                style={active && { color }}
              >
                {ACTIVITY_STATUS_LABEL[option]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text className="text-[11px] text-content-subtle mt-2">
        {ACTIVITY_STATUS_DESCRIPTION[status]}
      </Text>
    </View>
  );
}
