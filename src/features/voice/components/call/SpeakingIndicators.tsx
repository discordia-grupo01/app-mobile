import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useThemeColors } from "../../../../theme/theme-context";

const GLOW_PULSE_MS = 900;
const BAR_PULSE_MS = 450;
const BAR_STAGGER_MS = 110;
const BAR_HEIGHTS = [4, 7, 11, 7, 4];

export function SpeakingGlow({ borderRadius }: { borderRadius: number }) {
  const colors = useThemeColors();
  const isReducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isReducedMotion) return;
    opacity.value = withRepeat(
      withTiming(0.35, {
        duration: GLOW_PULSE_MS,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [isReducedMotion, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          borderRadius,
          boxShadow: `0 0 18px 3px ${colors.success}`,
        },
        style,
      ]}
    />
  );
}

/** Las barritas de "hablando", arriba del nombre. */
export function SpeakingBars() {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-end gap-[2px]" style={{ height: 11 }}>
      {BAR_HEIGHTS.map((height, index) => (
        <SpeakingBar
          key={index}
          height={height}
          delay={index * BAR_STAGGER_MS}
          color={colors.success}
        />
      ))}
    </View>
  );
}

function SpeakingBar({
  height,
  delay,
  color,
}: {
  height: number;
  delay: number;
  color: string;
}) {
  const isReducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isReducedMotion) return;
    scale.value = withDelay(
      delay,
      withRepeat(withTiming(0.45, { duration: BAR_PULSE_MS }), -1, true),
    );
    return () => cancelAnimation(scale);
  }, [delay, isReducedMotion, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 4,
          height,
          borderRadius: 2,
          backgroundColor: color,
          opacity: 0.85,
          transformOrigin: "bottom",
        },
        style,
      ]}
    />
  );
}
