import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "../../../theme/colors";

export type ActivityStatusMode = "auto" | "dnd" | "invisible";

const OPTIONS: { mode: ActivityStatusMode; label: string; color: string }[] = [
  { mode: "auto", label: "Automático", color: "#38A169" },
  { mode: "dnd", label: "No molestar", color: "#e05252" },
  { mode: "invisible", label: "Invisible", color: "#4F5660" },
];

export const ACTIVITY_STATUS_COLOR: Record<ActivityStatusMode, string> =
  Object.fromEntries(OPTIONS.map((o) => [o.mode, o.color])) as Record<
    ActivityStatusMode,
    string
  >;

const PREVIEW_COPY: Record<ActivityStatusMode, string> = {
  auto: 'Visible como "En línea"',
  dnd: "Nadie puede enviarte mensajes directos.",
  invisible: "Aparecés como desconectado para el resto.",
};

interface ActivityStatusPickerProps {
  mode: ActivityStatusMode;
  onChange: (mode: ActivityStatusMode) => void;
}

export function ActivityStatusPicker({
  mode,
  onChange,
}: ActivityStatusPickerProps) {
  return (
    <View>
      <Text style={styles.label}>ESTADO DE ACTIVIDAD</Text>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const active = option.mode === mode;
          return (
            <TouchableOpacity
              key={option.mode}
              onPress={() => onChange(option.mode)}
              style={[
                styles.option,
                active && {
                  backgroundColor: `${option.color}1A`,
                  borderColor: `${option.color}55`,
                },
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: active ? option.color : colors.textSubtle,
                  },
                ]}
              />
              <Text
                style={[styles.optionText, active && { color: option.color }]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.preview}>{PREVIEW_COPY[mode]}</Text>
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
