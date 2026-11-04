import { useCallback, useEffect, useRef, type ComponentRef } from "react";
import { Keyboard, type LayoutChangeEvent, ScrollView } from "react-native";

const REVEAL_MARGIN = 12;

export function useRevealOnKeyboard<Section extends string>() {
  const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const sectionTopsRef = useRef<Partial<Record<Section, number>>>({});
  const pendingRef = useRef<Section | null>(null);

  const scrollToSection = useCallback((section: Section) => {
    const top = sectionTopsRef.current[section];
    if (top === undefined) return;
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, top - REVEAL_MARGIN),
      animated: true,
    });
  }, []);

  useEffect(() => {
    const shown = Keyboard.addListener("keyboardDidShow", () => {
      if (pendingRef.current) scrollToSection(pendingRef.current);
    });
    const hidden = Keyboard.addListener("keyboardDidHide", () => {
      pendingRef.current = null;
    });
    return () => {
      shown.remove();
      hidden.remove();
    };
  }, [scrollToSection]);

  const onSectionLayout = useCallback(
    (section: Section) => (event: LayoutChangeEvent) => {
      sectionTopsRef.current[section] = event.nativeEvent.layout.y;
    },
    [],
  );

  const reveal = useCallback(
    (section: Section) => {
      pendingRef.current = section;
      scrollToSection(section);
    },
    [scrollToSection],
  );

  return { scrollViewRef, onSectionLayout, reveal };
}
