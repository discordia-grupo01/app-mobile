import {
  BANS_MEMBERS_SEARCH_LABEL,
  BANS_SEARCH_LABEL,
  BANS_SEARCH_PLACEHOLDER,
  BANS_TAB_MEMBERS,
  BANS_TITLE,
  bansTabLabel,
  searchResultsSummary,
} from "@discordia/client-shared";

import { Text, View } from "react-native";

import { SearchInput } from "../../../components/ui/SearchInput";
import { SegmentedTabs } from "../../../components/ui/SegmentedTabs";
import { type BansTab } from "../types";

interface BansToolbarProps {
  tab: BansTab;
  onTabChange: (tab: BansTab) => void;
  bansCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  /** Resumen de la busqueda: coincidencias y total de la pestaña (solo si se busca). */
  results: { matches: number; total: number; noun: string } | null;
}

/** Pestañas (baneados / miembros), buscador y resumen de la busqueda. */
export function BansToolbar({
  tab,
  onTabChange,
  bansCount,
  search,
  onSearchChange,
  results,
}: BansToolbarProps) {
  return (
    <View className="shrink-0 gap-3 border-b border-line px-5 py-4">
      <SegmentedTabs
        label={BANS_TITLE}
        value={tab}
        onChange={onTabChange}
        tabs={[
          { value: "bans", label: bansTabLabel(bansCount) },
          { value: "members", label: BANS_TAB_MEMBERS },
        ]}
      />
      <SearchInput
        value={search}
        onChange={onSearchChange}
        label={tab === "bans" ? BANS_SEARCH_LABEL : BANS_MEMBERS_SEARCH_LABEL}
        placeholder={BANS_SEARCH_PLACEHOLDER}
      />
      {results ? (
        <Text
          accessibilityLiveRegion="polite"
          className="text-xs text-content-muted"
        >
          {searchResultsSummary(results.matches, results.total, results.noun)}
        </Text>
      ) : null}
    </View>
  );
}
