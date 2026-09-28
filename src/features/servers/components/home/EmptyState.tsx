import {
  CREATE_FIRST_SERVER_DESCRIPTION,
  CREATE_FIRST_SERVER_TITLE,
  EMPTY_HOME_TITLE,
  JOIN_WITH_LINK_DESCRIPTION,
  JOIN_WITH_LINK_TITLE,
  type ThemeColors,
  UNLIMITED_INVITES_FEATURE,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";

import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

const HERO_SIZE = 220;
const ICON_BOX_SIZE = 112;
const BADGE_SIZE = 40;

const FLOATING_BADGES: {
  emoji: string;
  angle: number;
  r: number;
  background: keyof ThemeColors;
  delay: number;
}[] = [
  { emoji: "🎮", angle: -40, r: 78, background: "accent", delay: 0 },
  { emoji: "🎨", angle: 12, r: 88, background: "info", delay: 400 },
  { emoji: "🏆", angle: 55, r: 76, background: "success", delay: 800 },
];

const FEATURE_PILLS: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
}[] = [
  { icon: "hash", label: "Canales de texto" },
  { icon: "volume-2", label: "Canales de voz" },
  { icon: "zap", label: "Roles y permisos" },
  { icon: "users", label: UNLIMITED_INVITES_FEATURE },
];

function FloatingBadge({
  emoji,
  angle,
  r,
  background,
  delay,
}: {
  emoji: string;
  angle: number;
  r: number;
  background: keyof ThemeColors;
  delay: number;
}) {
  const colors = useThemeColors();
  const [translateY] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, {
          toValue: -8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, translateY]);

  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * r;
  const y = Math.sin(rad) * r;
  const center = HERO_SIZE / 2;

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: colors[background],
          left: center + x - BADGE_SIZE / 2,
          top: center + y - BADGE_SIZE / 2,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text className="text-[18px]">{emoji}</Text>
    </Animated.View>
  );
}

interface ActionCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  cta: string;
  accent?: boolean;
  onPress: () => void;
}

function ActionCard({
  icon,
  title,
  description,
  cta,
  accent,
  onPress,
}: ActionCardProps) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={cn(
        "flex-row items-start gap-3.5 rounded-2xl border p-4",
        accent
          ? "bg-[rgba(36,92,107,0.14)] border-[rgba(36,92,107,0.4)]"
          : "bg-surface-input border-line",
      )}
    >
      <View
        className={cn(
          "w-11 h-11 rounded-xl items-center justify-center mt-0.5",
          accent ? "bg-[rgba(36,92,107,0.35)]" : "bg-[rgba(255,255,255,0.06)]",
        )}
      >
        <Feather
          name={icon}
          size={20}
          color={accent ? colors.sky : colors.textSubtle}
        />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-[14px] font-bold text-content mb-0.5">
          {title}
        </Text>
        <Text className="text-[12px] leading-[17px] text-content-muted">
          {description}
        </Text>
        <Text
          className="text-[12px] font-semibold mt-2"
          style={{ color: accent ? colors.sky : colors.info }}
        >
          {cta} →
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface EmptyStateProps {
  userName?: string | null;
  onCreatePress: () => void;
  onJoinPress: () => void;
  style?: ViewStyle;
}

/** Estado del home cuando el usuario todavia no es miembro de ningun servidor. */
export function EmptyState({
  userName,
  onCreatePress,
  onJoinPress,
  style,
}: EmptyStateProps) {
  const colors = useThemeColors();
  return (
    <View className="w-full max-w-105 self-center gap-7" style={style}>
      <View
        className="self-center items-center justify-center"
        style={styles.hero}
      >
        <View
          className="absolute bg-accent opacity-[0.16]"
          style={styles.glow}
          pointerEvents="none"
        />

        {FLOATING_BADGES.map((badge) => (
          <FloatingBadge key={badge.emoji} {...badge} />
        ))}

        <View
          className="rounded-[32px] bg-surface-modal border border-line-strong items-center justify-center"
          style={styles.iconBox}
        >
          <Feather name="upload-cloud" size={44} color={colors.accentBright} />
        </View>
      </View>

      <View className="items-center gap-2">
        <Text className="text-[22px] font-bold text-content text-center">
          {userName
            ? `Hola, ${userName}. Tu espacio está esperándote`
            : EMPTY_HOME_TITLE}
        </Text>
        <Text className="text-[13px] leading-[19px] text-content-muted text-center max-w-85">
          Todavía no pertenecés a ningún servidor. Creá el tuyo en segundos o
          uníte a una comunidad existente con un enlace de invitación.
        </Text>
      </View>

      <View className="gap-3">
        <ActionCard
          accent
          icon="plus"
          title={CREATE_FIRST_SERVER_TITLE}
          description={CREATE_FIRST_SERVER_DESCRIPTION}
          cta="Empezar ahora"
          onPress={onCreatePress}
        />
        <ActionCard
          icon="link-2"
          title={JOIN_WITH_LINK_TITLE}
          description={JOIN_WITH_LINK_DESCRIPTION}
          cta="Ingresar código"
          onPress={onJoinPress}
        />
      </View>

      <View className="flex-row flex-wrap justify-center gap-2">
        {FEATURE_PILLS.map((pill) => (
          <View
            key={pill.label}
            className="flex-row items-center gap-1.5 rounded-full border border-line bg-surface-input px-3 py-1.5"
          >
            <Feather name={pill.icon} size={11} color={colors.textSubtle} />
            <Text className="text-[11px] text-content-subtle">
              {pill.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: HERO_SIZE,
    height: HERO_SIZE,
  },
  glow: {
    width: HERO_SIZE,
    height: HERO_SIZE,
    borderRadius: HERO_SIZE / 2,
  },
  iconBox: {
    width: ICON_BOX_SIZE,
    height: ICON_BOX_SIZE,
  },
  badge: {
    position: "absolute",
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(168,198,223,0.15)",
  },
});
