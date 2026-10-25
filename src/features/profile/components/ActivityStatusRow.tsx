import {
  ACTIVITY_STATUS_CHOICE_LABEL,
  ACTIVITY_STATUS_LABEL,
  displayedStatus,
  type ActivityStatusChoice,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { ActivityStatusDot } from "./ActivityStatusDot";
import { ActivityStatusSheet } from "./ActivityStatusSheet";

interface ActivityStatusRowProps {
  /** `null` mientras no hay conexion con el back: no se puede elegir. */
  status: ActivityStatusChoice | null;
  error?: string;
  onChange: (status: ActivityStatusChoice) => void;
}

export function ActivityStatusRow({
  status,
  error,
  onChange,
}: ActivityStatusRowProps) {
  const colors = useThemeColors();
  const [sheetOpen, setSheetOpen] = useState(false);
  const label = status
    ? ACTIVITY_STATUS_CHOICE_LABEL[status]
    : ACTIVITY_STATUS_LABEL.offline;

  return (
    <View>
      <Text className="text-[11px] font-bold tracking-[1.2px] text-content-subtle mb-1.5">
        ESTADO DE ACTIVIDAD
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSheetOpen(true)}
        disabled={status === null}
        accessibilityRole="button"
        accessibilityState={{ disabled: status === null }}
        accessibilityLabel={`Estado de actividad: ${label}`}
        className={`flex-row items-center gap-3 rounded-[10px] border border-line bg-surface-input px-3 py-3 ${
          status === null ? "opacity-60" : ""
        }`}
      >
        <ActivityStatusDot
          status={status ? displayedStatus(status) : "offline"}
          size={10}
          ringWidth={0}
        />
        <Text className="flex-1 text-[14px] font-semibold text-content">
          {label}
        </Text>
        <Feather name="chevron-right" size={16} color={colors.textSubtle} />
      </TouchableOpacity>
      {error ? (
        <Text
          accessibilityRole="alert"
          className="text-danger text-[12px] mt-1.5"
        >
          {error}
        </Text>
      ) : null}

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
