import {
  ACTIVITY_STATUS_DESCRIPTION,
  ACTIVITY_STATUS_LABEL,
  ACTIVITY_STATUSES,
  type ActivityStatus,
} from "@discordia/client-shared";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "../../../theme/colors";

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
  return (
    <View>
      <Text style={styles.label}>ESTADO DE ACTIVIDAD</Text>
      <View style={styles.row}>
        {ACTIVITY_STATUSES.map((option) => {
          const active = option === status;
          const color = ACTIVITY_STATUS_COLOR[option];
          return (
            <TouchableOpacity
              key={option}
              onPress={() => onChange(option)}
              style={[
                styles.option,
                active && {
                  backgroundColor: `${color}1A`,
                  borderColor: `${color}55`,
                },
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: active ? color : colors.textSubtle,
                  },
                ]}
              />
              <Text style={[styles.optionText, active && { color }]}>
                {ACTIVITY_STATUS_LABEL[option]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.preview}>{ACTIVITY_STATUS_DESCRIPTION[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textSubtle,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    gap: 6,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingVertical: 9,
    paddingHorizontal: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSubtle,
  },
  preview: {
    fontSize: 11,
    color: colors.textSubtle,
    marginTop: 8,
  },
});
