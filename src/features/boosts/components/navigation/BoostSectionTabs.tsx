import {
  BOOST_SECTION_TAB_LABELS,
  BOOST_SECTION_TABS,
  type BoostSectionTab,
} from "@discordia/client-shared";

import { Pressable, Text, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { BoostActionIcon } from "../BoostActionIcon";
import { BoostsSectionIcon } from "../BoostsSectionIcon";

interface BoostSectionTabsProps {
  active: BoostSectionTab;
  onSelect: (tab: BoostSectionTab) => void;
}

function TabIcon({ tab, active }: { tab: BoostSectionTab; active: boolean }) {
  return tab === "boost" ? (
    <BoostActionIcon size={17} outlined={active} />
  ) : (
    <BoostsSectionIcon size={17} onAccent={active} />
  );
}

/** Solapas de la sección Boosts, como las de Facturación pero con la activa en petrol. */
export function BoostSectionTabs({ active, onSelect }: BoostSectionTabsProps) {
  return (
    <View accessibilityRole="tablist" className="flex-row gap-2">
      {BOOST_SECTION_TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <Pressable
            key={tab}
            onPress={() => onSelect(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={cn(
              "flex-row items-center gap-2 rounded-xl border px-3 py-2",
              isActive
                ? "border-transparent bg-accent"
                : "border-line bg-surface-input",
            )}
          >
            <TabIcon tab={tab} active={isActive} />
            <Text
              className={cn(
                "text-[13px] font-bold",
                isActive ? "text-on-accent" : "text-content-muted",
              )}
            >
              {BOOST_SECTION_TAB_LABELS[tab]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
