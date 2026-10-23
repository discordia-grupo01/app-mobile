import {
  ACTIVITY_STATUS_CHOICE_LABEL,
  displayedStatus,
  type ActivityStatusChoice,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { activityStatusColor } from "./activityStatusColor";
import { ActivityStatusSheet } from "./ActivityStatusSheet";

interface ActivityStatusRowProps {
  status: ActivityStatusChoice;
  onChange: (status: ActivityStatusChoice) => void;
}

export function ActivityStatusRow({
  status,
  onChange,
}: ActivityStatusRowProps) {
  const colors = useThemeColors();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <View>
      <Text className="text-[11px] font-bold tracking-[1.2px] text-content-subtle mb-1.5">
        ESTADO DE ACTIVIDAD
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSheetOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Estado de actividad: ${ACTIVITY_STATUS_CHOICE_LABEL[status]}`}
        className="flex-row items-center gap-3 rounded-[10px] border border-line bg-surface-input px-3 py-3"
      >
        <View
          className="w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: activityStatusColor(
              colors,
              displayedStatus(status),
            ),
          }}
        />
        <Text className="flex-1 text-[14px] font-semibold text-content">
          {ACTIVITY_STATUS_CHOICE_LABEL[status]}
        </Text>
        <Feather name="chevron-right" size={16} color={colors.textSubtle} />
      </TouchableOpacity>

      <ActivityStatusSheet
        visible={sheetOpen}
        status={status}
        onClose={() => setSheetOpen(false)}
        onSelect={(choice) => {
          onChange(choice);
          setSheetOpen(false);
        }}
      />
    </View>
  );
}
