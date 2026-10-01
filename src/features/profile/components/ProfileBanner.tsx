import { Feather } from "@expo/vector-icons";
import { type ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

interface ProfileBannerProps {
  onClose: () => void;
  height?: number;
  dimmed?: boolean;
  /** Boton extra (por ejemplo banear) que se dibuja a la izquierda del de cerrar. */
  action?: ReactNode;
}

export function ProfileBanner({
  onClose,
  height = 100,
  dimmed = false,
  action,
}: ProfileBannerProps) {
  return (
    <View style={[styles.banner, { height }]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="profileBanner" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#0f1f2e" />
            <Stop offset="0.4" stopColor="#1a3a4a" />
            <Stop offset="0.7" stopColor="#245C6B" />
            <Stop offset="1" stopColor="#1c293b" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#profileBanner)" />
      </Svg>

      {dimmed ? <View style={styles.dimOverlay} /> : null}

      {action ? <View style={styles.actionSlot}>{action}</View> : null}

      <TouchableOpacity
        onPress={onClose}
        style={styles.closeButton}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
      >
        <Feather name="x" size={14} color="rgba(255,255,255,0.85)" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "relative",
    overflow: "hidden",
  },
  dimOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  actionSlot: {
    position: "absolute",
    top: 12,
    right: 50,
    zIndex: 10,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});
