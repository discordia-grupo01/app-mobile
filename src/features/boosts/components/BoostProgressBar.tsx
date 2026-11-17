import { View } from "react-native";

const SIZES = {
  md: { marker: 16, track: "h-2.5", markerClass: "rounded border-2" },
  sm: {
    marker: 10,
    track: "h-1.5",
    markerClass: "rounded-[3px] border-[1.5px]",
  },
} as const;

interface BoostProgressBarProps {
  boostCount: number;
  target: number;
  label: string;
  size?: keyof typeof SIZES;
}

export function BoostProgressBar({
  boostCount,
  target,
  label,
  size = "md",
}: BoostProgressBarProps) {
  const { marker, track, markerClass } = SIZES[size];
  const ratio = Math.min(1, boostCount / target);
  const percent = `${Math.round(ratio * 1000) / 10}%` as const;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{
        min: 0,
        max: target,
        now: Math.min(boostCount, target),
      }}
      className="justify-center"
      style={{ height: marker }}
    >
      <View className={`${track} overflow-hidden rounded-full bg-boost-track`}>
        <View
          className="h-full rounded-full bg-info"
          style={{ width: percent }}
        />
      </View>
      <View
        className={`absolute top-0 border-boost-ink bg-boost-yellow ${markerClass}`}
        style={{
          left: percent,
          width: marker,
          height: marker,
          marginLeft: -marker / 2,
        }}
      />
    </View>
  );
}
