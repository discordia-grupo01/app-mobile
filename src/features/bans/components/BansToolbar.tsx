import {
  BAN_PICKER_SEARCH_PLACEHOLDER,
  BANS_MEMBERS_SEARCH_LABEL,
  BANS_SEARCH_LABEL,
  BANS_SEARCH_PLACEHOLDER,
  searchResultsSummary,
} from "@discordia/client-shared";

import { Text, View } from "react-native";

import { SearchInput } from "../../../components/ui/SearchInput";

interface BansToolbarProps {
  isBans: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  /** Resumen de la busqueda: coincidencias y total de la lista (solo si se busca). */
  results: { matches: number; total: number; noun: string } | null;
}

export function BansToolbar({
  isBans,
  search,
  onSearchChange,
  results,
}: BansToolbarProps) {
  return (
    <View className="shrink-0 gap-2 px-5 pt-4">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        label={isBans ? BANS_SEARCH_LABEL : BANS_MEMBERS_SEARCH_LABEL}
        placeholder={
          isBans ? BANS_SEARCH_PLACEHOLDER : BAN_PICKER_SEARCH_PLACEHOLDER
        }
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
