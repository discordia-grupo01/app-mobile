import { getInitial } from "@discordia/client-shared";

import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { useThemeColors } from "../../../theme/theme-context";

interface ServerAvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
  borderRadius?: number;
}

export function ServerAvatar({
  name,
  uri,
  size = 48,
  borderRadius,
}: ServerAvatarProps) {
  const colors = useThemeColors();
  const radius = borderRadius ?? size / 2;
  const [failed, setFailed] = useState(false);
  const [lastUri, setLastUri] = useState(uri);
  if (uri !== lastUri) {
    setLastUri(uri);
    setFailed(false);
  }

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        onError={() => setFailed(true)}
        className="bg-surface-raised"
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }

  const initial = getInitial(name) ?? "?";

  return (
    <View
      className="items-center justify-center overflow-hidden"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="serverAvatarGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.accentGradientStart} />
            <Stop offset="1" stopColor={colors.accentGradientEnd} />
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width="100%"
          height="100%"
          fill="url(#serverAvatarGradient)"
        />
      </Svg>
      <Text
        className="text-on-accent font-bold"
        style={{ fontSize: size * 0.42 }}
      >
        {initial}
      </Text>
    </View>
  );
}
