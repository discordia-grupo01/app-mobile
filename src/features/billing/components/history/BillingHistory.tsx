import {
  BILLING_COPY,
  formatArsFromCents,
  formatBillingDate,
  formatPoints,
  formatPointsDelta,
  LEDGER_REASON_LABELS,
  type LedgerEntry,
  type PointPurchase,
  PURCHASE_STATUS_DESCRIPTIONS,
  PURCHASE_STATUS_LABELS,
  PURCHASE_STATUS_TONE,
  type ServerSummary,
  unrecoveredPointsNote,
} from "@discordia/client-shared";

import { useEffect, useMemo, useState } from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";
import { SearchInput } from "../../../../components/ui/SearchInput";
import { DiscordiaPointIcon } from "../shared/DiscordiaIcons";
import { HistoryList } from "./HistoryList";
import { billingToneColor } from "../shared/billingTone";
import { useServerDirectory } from "../boosts/useServerDirectory";

function PurchaseRow({ purchase }: { purchase: PointPurchase }) {
  const colors = useThemeColors();
  const tone = billingToneColor(PURCHASE_STATUS_TONE[purchase.status], colors);

  return (
    <View>
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-input">
          <DiscordiaPointIcon size={21} />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-semibold text-content">
            {formatPoints(purchase.points)}
          </Text>
          <Text className="text-[12px] text-content-subtle tabular-nums">
            {formatArsFromCents(purchase.price_cents)} ·{" "}
            {formatBillingDate(purchase.created_at)}
          </Text>
        </View>
        <View
          className="rounded-full px-2 py-0.5"
          style={{ backgroundColor: withAlpha(tone, 0.15) }}
        >
          <Text
            className="text-[10px] font-bold uppercase"
            style={{ color: tone }}
          >
            {PURCHASE_STATUS_LABELS[purchase.status]}
          </Text>
        </View>
      </View>
      <Text className="ml-[52px] mt-1 text-[12px] leading-[17px] text-content-subtle">
        {PURCHASE_STATUS_DESCRIPTIONS[purchase.status]}
      </Text>
      {purchase.points_unrecovered > 0 ? (
        <View
          className="mt-2 rounded-lg px-3 py-2"
          style={{ backgroundColor: withAlpha(colors.danger, 0.1) }}
        >
          <Text className="text-[12px] text-danger">
            {unrecoveredPointsNote(purchase.points_unrecovered)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function MovementRow({
  entry,
  serverName,
}: {
  entry: LedgerEntry;
  serverName?: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <DiscordiaPointIcon size={24} />
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-content">
          {LEDGER_REASON_LABELS[entry.reason]}
        </Text>
        <Text className="text-[12px] text-content-subtle">
          {formatBillingDate(entry.created_at)}
        </Text>
        {serverName ? (
          <Text className="text-[12px] text-content-subtle">{serverName}</Text>
        ) : null}
      </View>
      <Text
        className={
          entry.delta >= 0
            ? "text-[15px] font-bold text-success tabular-nums"
            : "text-[15px] font-bold text-danger tabular-nums"
        }
      >
        {formatPointsDelta(entry.delta)}
      </Text>
    </View>
  );
}

interface ServerDirectoryLike {
  get: (id: string) => { name: string } | undefined;
}

interface BillingHistoryProps {
  purchases: PointPurchase[];
  ledger: LedgerEntry[];
  serverDirectory?:
    | Map<string, { name: string }>
    | Map<string, ServerSummary>
    | ServerDirectoryLike
    | null;
}

export function BillingHistory({
  purchases,
  ledger,
  serverDirectory: serverDirectoryProp,
}: BillingHistoryProps) {
  const directoryFromHook = useServerDirectory();
  const serverDirectory =
    serverDirectoryProp !== undefined ? serverDirectoryProp : directoryFromHook;

  const [searchQuery, setSearchQuery] = useState("");
  const [serverFilter, setServerFilter] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const serversInLedger = useMemo(() => {
    const list: { id: string; name: string }[] = [];
    const seen = new Set<string>();
    for (const entry of ledger) {
      if (entry.server_id && !seen.has(entry.server_id)) {
        seen.add(entry.server_id);
        const name =
          serverDirectory?.get(entry.server_id)?.name ?? "Servidor desconocido";
        list.push({ id: entry.server_id, name });
      }
    }
    return list;
  }, [ledger, serverDirectory]);

  const matchingServers = useMemo(() => {
    if (!searchQuery.trim()) return serversInLedger;
    const q = searchQuery.toLowerCase();
    return serversInLedger.filter((s) => s.name.toLowerCase().includes(q));
  }, [serversInLedger, searchQuery]);

  const filteredLedger = useMemo(() => {
    if (serverFilter !== null) {
      return ledger.filter((entry) => entry.server_id === serverFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return ledger.filter((entry) => {
        if (!entry.server_id) return false;
        const name =
          serverDirectory?.get(entry.server_id)?.name ?? "Servidor desconocido";
        return name.toLowerCase().includes(q);
      });
    }
    return ledger;
  }, [ledger, serverFilter, searchQuery, serverDirectory]);

  return (
    <View className="gap-6">
      <HistoryList
        title={BILLING_COPY.historyTitle}
        subtitle={BILLING_COPY.historySubtitle}
        emptyText={BILLING_COPY.historyEmpty}
        noun="compras"
        items={purchases}
        keyOf={(purchase) => purchase.id}
        renderItem={(purchase) => <PurchaseRow purchase={purchase} />}
      />
      <HistoryList
        title={BILLING_COPY.movementsTitle}
        subtitle={BILLING_COPY.movementsSubtitle}
        emptyText={BILLING_COPY.movementsEmpty}
        noun="movimientos"
        items={filteredLedger}
        keyOf={(entry, index) => `${entry.created_at}-${index}`}
        headerAccessory={
          serversInLedger.length > 0 ? (
            <View className="gap-1.5">
              <SearchInput
                value={searchQuery}
                onChange={(text) => {
                  setSearchQuery(text);
                  setServerFilter(null);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                label="Buscar por servidor"
                placeholder="Buscar por servidor..."
              />
              {isDropdownOpen ? (
                <View className="max-h-52 overflow-hidden rounded-xl border border-line bg-surface-raised">
                  {serverFilter !== null || searchQuery ? (
                    <TouchableOpacity
                      onPress={() => {
                        setServerFilter(null);
                        setSearchQuery("");
                        setIsDropdownOpen(false);
                        Keyboard.dismiss();
                      }}
                      className="border-b border-line px-4 py-2.5"
                    >
                      <Text className="text-[13px] font-semibold text-content-subtle">
                        Todos los servidores
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  {matchingServers.length === 0 ? (
                    <View className="p-3">
                      <Text className="text-center text-[12px] text-content-subtle">
                        No se encontraron servidores
                      </Text>
                    </View>
                  ) : (
                    matchingServers.map((server) => {
                      const isSelected = serverFilter === server.id;
                      return (
                        <TouchableOpacity
                          key={server.id}
                          onPress={() => {
                            setServerFilter(server.id);
                            setSearchQuery(server.name);
                            setIsDropdownOpen(false);
                            Keyboard.dismiss();
                          }}
                          className={cn(
                            "flex-row items-center justify-between px-4 py-2.5",
                            isSelected
                              ? "bg-accent/15"
                              : "active:bg-surface-hover",
                          )}
                        >
                          <Text
                            className={cn(
                              "text-[13px]",
                              isSelected
                                ? "font-semibold text-accent"
                                : "text-content",
                            )}
                          >
                            {server.name}
                          </Text>
                          {isSelected ? (
                            <Text className="text-[11px] font-bold text-accent">
                              Seleccionado
                            </Text>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              ) : null}
            </View>
          ) : null
        }
        renderItem={(entry) => (
          <MovementRow
            entry={entry}
            serverName={
              entry.server_id
                ? (serverDirectory?.get(entry.server_id)?.name ??
                  "Servidor desconocido")
                : undefined
            }
          />
        )}
      />
    </View>
  );
}
