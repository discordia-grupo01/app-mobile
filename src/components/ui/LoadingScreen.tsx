import {
  LOADING_SCREEN,
  LOGO_ANIMATION,
  LOGO_COLORS,
  LOGO_ISOTYPE,
  LOGO_TAGLINE_PATH,
  LOGO_VIEW_BOX,
  LOGO_WORD_PATHS,
} from "@discordia/client-shared";

import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";

import { useTheme, useThemeColors } from "../../theme/theme-context";

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const LOGO_MAX_WIDTH = 320;

const {
  cycleMs,
  blocks: blockTiming,
  gold: goldTiming,
  pulse,
  letters,
  tagline,
  dots: dotTiming,
} = LOGO_ANIMATION;

const GOLD = LOGO_ISOTYPE.gold;

const clamped = { extrapolate: "clamp" } as const;

function useLogoAnimation() {
  const [values] = useState(() => ({
    blocks: LOGO_ISOTYPE.blocks.map(
      () => new Animated.Value(blockTiming.lowOpacity),
    ),
    letters: LOGO_WORD_PATHS.map(() => new Animated.Value(0)),
    tagline: new Animated.Value(0),
    gold: new Animated.Value(0),
    pulse: new Animated.Value(0),
  }));

  useEffect(() => {
    let cancelled = false;
    let running: Animated.CompositeAnimation | null = null;

    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        values.blocks.forEach((value) => value.setValue(1));
        values.letters.forEach((value) => value.setValue(1));
        values.tagline.setValue(1);
        return;
      }

      const timing = (
        value: Animated.Value,
        toValue: number,
        duration: number,
        easing = Easing.inOut(Easing.ease),
      ) =>
        Animated.timing(value, {
          toValue,
          duration,
          easing,
          useNativeDriver: false,
        });

      const blocks = values.blocks.map((value, i) =>
        Animated.sequence([
          Animated.delay(i * blockTiming.staggerMs),
          Animated.loop(
            Animated.sequence([
              timing(value, 1, blockTiming.litAt * cycleMs),
              Animated.delay(
                (blockTiming.fadeAt - blockTiming.litAt) * cycleMs,
              ),
              timing(
                value,
                blockTiming.lowOpacity,
                (1 - blockTiming.fadeAt) * cycleMs,
              ),
            ]),
          ),
        ]),
      );
      const gold = Animated.loop(
        Animated.sequence([
          timing(values.gold, 1, cycleMs / 2),
          timing(values.gold, 0, cycleMs / 2),
        ]),
      );
      const pulse = Animated.loop(
        timing(values.pulse, 1, cycleMs, Easing.linear),
      );
      const intro = Animated.parallel([
        Animated.sequence([
          Animated.delay(letters.startMs),
          Animated.stagger(
            letters.staggerMs,
            values.letters.map((value) =>
              timing(value, 1, letters.fadeMs, Easing.out(Easing.ease)),
            ),
          ),
        ]),
        Animated.sequence([
          Animated.delay(tagline.startMs),
          timing(values.tagline, 1, tagline.fadeMs, Easing.out(Easing.ease)),
        ]),
      ]);

      running = Animated.parallel([...blocks, gold, pulse, intro]);
      running.start();
    });

    return () => {
      cancelled = true;
      running?.stop();
    };
  }, [values]);

  return values;
}

function AnimatedLogo({ width }: { width: number }) {
  const { theme } = useTheme();
  const colors = LOGO_COLORS[theme];
  const values = useLogoAnimation();
  const { inkRects, dPath, dot, square, cablePaths, cableStrokeWidth, blocks } =
    LOGO_ISOTYPE;

  const goldGrowth = (size: number) =>
    values.gold.interpolate({
      inputRange: [0, 1],
      outputRange: [size, size * (1 + goldTiming.growth)],
    });
  const goldShift = (origin: number, size: number) =>
    values.gold.interpolate({
      inputRange: [0, 1],
      outputRange: [origin, origin - (size * goldTiming.growth) / 2],
    });

  return (
    <Svg
      width={width}
      height={(width * LOGO_VIEW_BOX.height) / LOGO_VIEW_BOX.width}
      viewBox={`0 0 ${LOGO_VIEW_BOX.width} ${LOGO_VIEW_BOX.height}`}
    >
      <G fill={colors.ink}>
        {inkRects.map((rect) => (
          <Rect key={rect.y} {...rect} />
        ))}
        <Path d={dPath} />
        <Circle {...dot} />
      </G>
      <Rect {...square} fill={colors.square} />
      <G
        fill="none"
        stroke={colors.ink}
        strokeWidth={cableStrokeWidth}
        strokeLinecap="round"
      >
        {cablePaths.map((d) => (
          <Path key={d} d={d} />
        ))}
      </G>
      {cablePaths.map((d, i) => {
        const { length, dash, startAt, travel } = pulse[i];
        const end = startAt + travel;
        return (
          <AnimatedPath
            key={d}
            d={d}
            fill="none"
            stroke={colors.gold}
            strokeWidth={cableStrokeWidth}
            strokeLinecap="round"
            strokeDasharray={[dash, 1000]}
            strokeDashoffset={values.pulse.interpolate({
              inputRange: [startAt, end],
              outputRange: [dash, -length],
              ...clamped,
            })}
            opacity={values.pulse.interpolate({
              inputRange: [startAt, startAt + 0.02, end, end + 0.01],
              outputRange: [0, 1, 1, 0],
              ...clamped,
            })}
          />
        );
      })}
      {blocks.map((rect, i) => (
        <AnimatedRect
          key={rect.y}
          {...rect}
          fill={colors.blue}
          opacity={values.blocks[i]}
        />
      ))}
      <AnimatedRect
        x={goldShift(GOLD.x, GOLD.width)}
        y={goldShift(GOLD.y, GOLD.height)}
        width={goldGrowth(GOLD.width)}
        height={goldGrowth(GOLD.height)}
        fill={colors.gold}
      />
      {LOGO_WORD_PATHS.map((d, i) => (
        <AnimatedPath
          key={i}
          d={d}
          fill={colors.ink}
          opacity={values.letters[i]}
        />
      ))}
      <AnimatedPath
        d={LOGO_TAGLINE_PATH}
        fill={colors.blue}
        opacity={values.tagline}
      />
    </Svg>
  );
}

function BouncingDots({ logoWidth }: { logoWidth: number }) {
  const colors = useThemeColors();
  const size = logoWidth * 0.025;
  const [dots] = useState(() => [0, 1, 2].map(() => new Animated.Value(0)));

  useEffect(() => {
    const loops = dots.map((value, i) =>
      Animated.sequence([
        Animated.delay(i * dotTiming.staggerMs),
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: dotTiming.cycleMs * 0.4,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: dotTiming.cycleMs * 0.4,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.delay(dotTiming.cycleMs * 0.2),
          ]),
        ),
      ]),
    );
    const all = Animated.parallel(loops);
    all.start();
    return () => all.stop();
  }, [dots]);

  return (
    <View
      className="flex-row justify-center"
      style={{ gap: size, marginTop: logoWidth * 0.031 }}
    >
      {dots.map((value, i) => (
        <Animated.View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size,
            backgroundColor: colors.accentBright,
            opacity: value.interpolate({
              inputRange: [0, 1],
              outputRange: [0.35, 1],
            }),
            transform: [
              {
                translateY: value.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -logoWidth * 0.019],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

interface LoadingScreenProps {
  isLeaving?: boolean;
}

/**
 * Pantalla de carga inicial: se muestra hasta que responden los servicios del
 * home, para no mostrar estados vacios que luego se corrigen.
 */
export function LoadingScreen({ isLeaving = false }: LoadingScreenProps) {
  const { width: screenWidth } = useWindowDimensions();
  const logoWidth = Math.min(LOGO_MAX_WIDTH, screenWidth * 0.8);
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!isLeaving) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: LOADING_SCREEN.fadeOutMs,
      useNativeDriver: true,
    }).start();
  }, [isLeaving, opacity]);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Cargando"
      className="flex-1 items-center justify-center bg-surface-servers"
      style={{ opacity }}
    >
      <View style={{ width: logoWidth }}>
        <AnimatedLogo width={logoWidth} />
        <BouncingDots logoWidth={logoWidth} />
      </View>
    </Animated.View>
  );
}
