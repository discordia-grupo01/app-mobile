import { View } from "react-native";

interface BoostProgressBarProps {
  boostCount: number;
  target: number;
  label: string;
}

export function BoostProgressBar({
  boostCount,
  target,
  label,
}: BoostProgressBarProps) {
  const percent = Math.min(100, (boostCount / target) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{
        min: 0,
        max: target,
        now: Math.min(boostCount, target),
      }}
      className="h-2 w-full overflow-hidden rounded-full bg-surface-input"
    >
      <View
        className="h-full rounded-full bg-accent-strong"
        style={{ width: `${percent}%` }}
      />
    </View>
  );
}
