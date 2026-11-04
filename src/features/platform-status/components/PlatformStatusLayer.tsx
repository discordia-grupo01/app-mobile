import { statusNoticeKey } from "@discordia/client-shared";
import { useState, type ReactNode } from "react";
import { View } from "react-native";
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { DeviceInsetsContext } from "../hooks/useModalInsets";
import { usePlatformStatus } from "../hooks/usePlatformStatus";
import {
  PlatformStatusBanner,
  STATUS_BANNER_HEIGHT,
} from "./PlatformStatusBanner";
import { PlatformStatusModal } from "./PlatformStatusModal";

export function PlatformStatusLayer({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { state } = usePlatformStatus();
  const [hiddenKey, setHiddenKey] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const data = state.phase === "ready" ? state.data : null;
  const noticeKey = statusNoticeKey(data?.incidents ?? []);
  const isBannerVisible =
    data !== null && data.incidents.length > 0 && hiddenKey !== noticeKey;

  return (
    <DeviceInsetsContext.Provider value={insets}>
      <View className="flex-1">
        <SafeAreaInsetsContext.Provider
          value={
            isBannerVisible
              ? { ...insets, top: insets.top + STATUS_BANNER_HEIGHT }
              : insets
          }
        >
          {children}
        </SafeAreaInsetsContext.Provider>
        {data && isBannerVisible ? (
          <PlatformStatusBanner
            status={data.status}
            incidents={data.incidents}
            top={insets.top}
            onOpenDetails={() => setIsDetailsOpen(true)}
            onHide={() => setHiddenKey(noticeKey)}
          />
        ) : null}
        {data ? (
          <PlatformStatusModal
            visible={isDetailsOpen}
            data={data}
            onClose={() => setIsDetailsOpen(false)}
          />
        ) : null}
      </View>
    </DeviceInsetsContext.Provider>
  );
}
