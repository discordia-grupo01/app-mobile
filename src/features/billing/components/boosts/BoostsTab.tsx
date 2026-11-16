import {
  BILLING_BOOSTS_COPY,
  BOOST_ACTION_COPY,
  BOOST_TIER_SUMMARIES,
  type BoostedServer,
  boostedServersCountLabel,
  boostedServerSummaryLabel,
  hasBoostedBadge,
  RETRY_LABEL,
  serverBoostCount,
  serverBoostLevel,
  type ServerSummary,
} from "@discordia/client-shared";

import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../../components/ui/Avatar";
import { Button } from "../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { BoostedBadge } from "../../../boosts/components/BoostedBadge";
import { BoostLevelIcon } from "../../../boosts/components/BoostLevelIcon";
import { BoostedRing } from "../../../boosts/components/BoostedRing";
import { resolveServerIconUrl } from "../../../servers/api";
import { EmptyHistory } from "../history/EmptyHistory";
import { ListPagination } from "../history/ListPagination";
import { useBoostedServersPage } from "./useBoostedServersPage";
import { useServerDirectory } from "./useServerDirectory";

function HowBoostsWork({ onBuyPoints }: { onBuyPoints: () => void }) {
  return (
    <View className="rounded-2xl border border-line bg-surface-raised p-5">
      <Text className="font-display text-base font-bold text-content">
        {BILLING_BOOSTS_COPY.howTitle}
      </Text>
      <Text className="mt-1 text-sm leading-5 text-content-muted">
        {BILLING_BOOSTS_COPY.howDescription}
      </Text>
      <View className="mt-4 gap-2">
        {BOOST_TIER_SUMMARIES.map((tier) => (
          <View
            key={tier.level}
            className="flex-row items-center gap-3 rounded-xl bg-surface-input px-3 py-2.5"
          >
            <BoostLevelIcon level={tier.level} size={22} bare />
            <View className="flex-1">
              <Text className="font-display text-sm font-bold text-content">
                {tier.label}
              </Text>
              <Text className="text-xs text-content-muted">{tier.perks}</Text>
            </View>
          </View>
        ))}
      </View>
      <TouchableOpacity
        onPress={onBuyPoints}
        accessibilityRole="link"
        className="mt-4 self-start"
        hitSlop={8}
      >
        <Text className="text-sm font-semibold text-accent-strong">
          {BOOST_ACTION_COPY.buyPoints}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

interface BoostedServerRowProps {
  boosted: BoostedServer;
  /** `undefined` si ya no soy miembro: no está en mi lista de servidores. */
  server: ServerSummary | undefined;
  onManage: (serverId: string) => void;
}

function BoostedServerRow({
  boosted,
  server,
  onManage,
}: BoostedServerRowProps) {
  const level = server ? serverBoostLevel(server) : 0;
  const isBoosted = hasBoostedBadge(level);
  const standing = server
    ? { level, boostCount: serverBoostCount(server) }
    : null;

  return (
    <View className="flex-row items-center gap-3 bg-surface-raised px-4 py-3">
      <BoostedRing visible={isBoosted} borderRadius={12}>
        <Avatar
          name={server?.name ?? "?"}
          uri={server ? resolveServerIconUrl(server.icon_url) : null}
          size={40}
          borderRadius={12}
        />
      </BoostedRing>
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text
            className={cn(
              "shrink font-display text-sm font-bold",
              server ? "text-content" : "text-content-muted",
            )}
            numberOfLines={1}
          >
            {server?.name ?? BILLING_BOOSTS_COPY.unknownServer}
          </Text>
          {isBoosted ? <BoostedBadge size={16} /> : null}
        </View>
        <View className="mt-0.5 flex-row items-center gap-1.5">
          {server ? (
            <BoostLevelIcon level={level} size={14} bare tight />
          ) : null}
          <Text className="flex-1 text-xs text-content-subtle">
            {boostedServerSummaryLabel(boosted, standing)}
          </Text>
        </View>
      </View>
      {server ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onManage(boosted.server_id)}
          accessibilityRole="button"
          className="rounded-xl bg-surface-input px-4 py-2"
        >
          <Text className="text-xs font-semibold text-content-muted">
            {BILLING_BOOSTS_COPY.manage}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

interface BoostsTabProps {
  onBuyPoints: () => void;
  onManageServer: (serverId: string) => void;
}

export function BoostsTab({ onBuyPoints, onManageServer }: BoostsTabProps) {
  const colors = useThemeColors();
  const boosted = useBoostedServersPage();
  const servers = useServerDirectory();
  const rows = boosted.data?.servers ?? [];

  return (
    <View className="gap-6">
      <HowBoostsWork onBuyPoints={onBuyPoints} />

      <View>
        <View className="mb-3 flex-row items-baseline justify-between gap-3">
          <Text
            accessibilityRole="header"
            className="flex-1 font-display text-base font-bold text-content"
          >
            {BILLING_BOOSTS_COPY.yourBoostsTitle}
          </Text>
          {boosted.total > 0 ? (
            <Text className="text-xs font-semibold text-content-subtle">
              {boostedServersCountLabel(boosted.total)}
            </Text>
          ) : null}
        </View>
        {boosted.loadError && boosted.data === null ? (
          <View className="gap-3">
            <FormErrorBanner message={boosted.loadError} />
            <Button
              title={RETRY_LABEL}
              variant="secondary"
              onPress={boosted.reload}
            />
          </View>
        ) : boosted.data === null || servers === null ? (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color={colors.textMuted} />
          </View>
        ) : rows.length === 0 ? (
          <EmptyHistory text={BILLING_BOOSTS_COPY.empty} />
        ) : (
          <>
            <View className="overflow-hidden rounded-2xl border border-line">
              {rows.map((row, index) => (
                <View
                  key={row.server_id}
                  className={cn(index > 0 && "border-t border-line")}
                >
                  <BoostedServerRow
                    boosted={row}
                    server={servers.get(row.server_id)}
                    onManage={onManageServer}
                  />
                </View>
              ))}
            </View>
            <ListPagination
              page={boosted.page}
              pageCount={boosted.pageCount}
              range={boosted.range}
              total={boosted.total}
              noun={BILLING_BOOSTS_COPY.paginationNoun}
              onPageChange={boosted.setPage}
            />
            <Text className="mt-2 text-xs text-content-subtle">
              {BILLING_BOOSTS_COPY.footnote}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
