import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";

import { colors } from "../../theme/colors";

const HERO_SIZE = 220;
const ICON_BOX_SIZE = 112;
const BADGE_SIZE = 40;

const FLOATING_BADGES: {
  emoji: string;
  angle: number;
  r: number;
  background: string;
  delay: number;
}[] = [
  { emoji: "🎮", angle: -40, r: 78, background: colors.accent, delay: 0 },
  { emoji: "🎨", angle: 12, r: 88, background: colors.info, delay: 400 },
  { emoji: "🏆", angle: 55, r: 76, background: colors.success, delay: 800 },
];

const FEATURE_PILLS: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
}[] = [
  { icon: "hash", label: "Canales de texto" },
  { icon: "volume-2", label: "Canales de voz" },
  { icon: "zap", label: "Roles y permisos" },
  { icon: "users", label: "Invitaciones sin límite de usos" },
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
  background: string;
  delay: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;

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
          backgroundColor: background,
          left: center + x - BADGE_SIZE / 2,
          top: center + y - BADGE_SIZE / 2,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.badgeEmoji}>{emoji}</Text>
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
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, accent ? styles.cardAccent : styles.cardPlain]}
    >
      <View
        style={[
          styles.cardIconWrap,
          accent ? styles.cardIconWrapAccent : styles.cardIconWrapPlain,
        ]}
      >
        <Feather
          name={icon}
          size={20}
          color={accent ? colors.sky : colors.textSubtle}
        />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
        <Text
          style={[styles.cardCta, { color: accent ? colors.sky : colors.info }]}
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
  return (
    <View style={[styles.container, style]}>
      <View style={styles.hero}>
        <View style={styles.glow} pointerEvents="none" />

        {FLOATING_BADGES.map((badge) => (
          <FloatingBadge key={badge.emoji} {...badge} />
        ))}

        <View style={styles.iconBox}>
          <Feather name="upload-cloud" size={44} color={colors.accentBright} />
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>
          {userName
            ? `Hola, ${userName}. Tu espacio está esperándote`
            : "Tu espacio está esperándote"}
        </Text>
        <Text style={styles.subtitle}>
          Todavía no pertenecés a ningún servidor. Creá el tuyo en segundos o
          uníte a una comunidad existente con un enlace de invitación.
        </Text>
      </View>

      <View style={styles.cards}>
        <ActionCard
          accent
          icon="plus"
          title="Crear mi primer servidor"
          description="Elegí un nombre e ícono. El resto lo hacemos nosotros: dos canales listos para usar desde el principio."
          cta="Empezar ahora"
          onPress={onCreatePress}
        />
        <ActionCard
          icon="link-2"
          title="Unirme con un enlace"
          description="¿Tenés un código de invitación? Pegalo acá y entrás al instante."
          cta="Ingresar código"
          onPress={onJoinPress}
        />
      </View>

      <View style={styles.pills}>
        {FEATURE_PILLS.map((pill) => (
          <View key={pill.label} style={styles.pill}>
            <Feather name={pill.icon} size={11} color={colors.textSubtle} />
            <Text style={styles.pillLabel}>{pill.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: 28,
  },
  hero: {
    width: HERO_SIZE,
    height: HERO_SIZE,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: HERO_SIZE,
    height: HERO_SIZE,
    borderRadius: HERO_SIZE / 2,
    backgroundColor: colors.accent,
    opacity: 0.16,
  },
  iconBox: {
    width: ICON_BOX_SIZE,
    height: ICON_BOX_SIZE,
    borderRadius: 32,
    backgroundColor: colors.bgModal,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
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
  badgeEmoji: {
    fontSize: 18,
  },
  copy: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 340,
  },
  cards: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardAccent: {
    backgroundColor: "rgba(36,92,107,0.14)",
    borderColor: "rgba(36,92,107,0.4)",
  },
  cardPlain: {
    backgroundColor: colors.bgInput,
    borderColor: colors.border,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  cardIconWrapAccent: {
    backgroundColor: "rgba(36,92,107,0.35)",
  },
  cardIconWrapPlain: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  cardCta: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillLabel: {
    fontSize: 11,
    color: colors.textSubtle,
  },
});
