import {
  PUSH_ACCOUNT_HINT,
  PUSH_ACCOUNT_LABEL,
  PUSH_ACCOUNT_OFF_NOTE,
  PUSH_DEVICE_PERMISSION_DENIED,
  PUSH_DEVICE_UNSUPPORTED,
  PUSH_DISABLE_DEVICE_LABEL,
  PUSH_DISABLING_LABEL,
  PUSH_ENABLE_DEVICE_LABEL,
  PUSH_ENABLING_LABEL,
  PUSH_OPEN_SETTINGS_LABEL,
  PUSH_THIS_DEVICE_OFF,
  PUSH_THIS_DEVICE_ON,
  PUSH_THIS_DEVICE_TITLE,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Linking, Text, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../../components/ui/FormErrorBanner";
import { LoadingSpinner } from "../../../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../../auth/auth-context";
import { usePushNotifications } from "../../../../push/use-push-notifications";
import { useThemeColors } from "../../../../../theme/theme-context";
import { SettingsGroup } from "../../../../../components/ui/SettingsGroup";
import { Switch } from "../../../../../components/ui/Switch";

export function PushSettingsStep() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const push = usePushNotifications(user ? String(user.id) : null);
  const isAccountOff = push.accountEnabled === false;
  const isOn = push.deviceStatus === "on";
  const isLoading =
    (push.accountEnabled === null && !push.error) ||
    push.deviceStatus === "loading";

  if (isLoading) return <LoadingSpinner />;

  return (
    <View className="w-full max-w-[560px] gap-6 self-center px-4.5 pt-5">
      <FormErrorBanner message={push.error} />

      <View className="flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Feather
              name={isAccountOff ? "bell-off" : "bell"}
              size={16}
              color={colors.textSubtle}
            />
            <Text className="shrink text-[15px] font-medium text-content">
              {PUSH_ACCOUNT_LABEL}
            </Text>
          </View>
          <Text className="mt-1 text-[12px] leading-[18px] text-content-subtle">
            {PUSH_ACCOUNT_HINT}
          </Text>
        </View>
        <Switch
          checked={push.accountEnabled === true}
          disabled={push.accountEnabled === null}
          onChange={(enabled) => void push.setAccountEnabled(enabled)}
          label={PUSH_ACCOUNT_LABEL}
        />
      </View>

      <SettingsGroup label={PUSH_THIS_DEVICE_TITLE}>
        <View className="rounded-2xl border border-line bg-surface-raised p-4">
          {push.deviceStatus === "unsupported" ? (
            <Text className="text-[14px] leading-[19px] text-content-muted">
              {PUSH_DEVICE_UNSUPPORTED}
            </Text>
          ) : push.deviceStatus === "denied" ? (
            <>
              <Text className="mb-3 text-[14px] leading-[19px] text-content-muted">
                {PUSH_DEVICE_PERMISSION_DENIED}
              </Text>
              <Button
                title={PUSH_OPEN_SETTINGS_LABEL}
                variant="secondary"
                onPress={() => void Linking.openSettings()}
              />
            </>
          ) : (
            <>
              <Text className="mb-3 text-[14px] leading-[19px] text-content-muted">
                {isOn ? PUSH_THIS_DEVICE_ON : PUSH_THIS_DEVICE_OFF}
              </Text>
              <Button
                title={
                  push.isBusy
                    ? isOn
                      ? PUSH_DISABLING_LABEL
                      : PUSH_ENABLING_LABEL
                    : isOn
                      ? PUSH_DISABLE_DEVICE_LABEL
                      : PUSH_ENABLE_DEVICE_LABEL
                }
                variant={isOn ? "secondary" : "primary"}
                isLoading={push.isBusy}
                disabled={push.deviceStatus === "loading"}
                onPress={() =>
                  void (isOn ? push.disableDevice() : push.enableDevice())
                }
              />
              {isAccountOff && isOn ? (
                <Text className="mt-3 text-[12px] leading-[17px] text-content-subtle">
                  {PUSH_ACCOUNT_OFF_NOTE}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </SettingsGroup>
    </View>
  );
}
