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
  PUSH_SETTINGS_TITLE,
  PUSH_THIS_DEVICE_OFF,
  PUSH_THIS_DEVICE_ON,
  PUSH_THIS_DEVICE_TITLE,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Linking, Switch, Text, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../../components/ui/FormErrorBanner";
import { useAuth } from "../../../../auth/auth-context";
import { usePushNotifications } from "../../../../push/use-push-notifications";
import { useThemeColors } from "../../../../../theme/theme-context";

export function PushSettingsStep() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const push = usePushNotifications(user ? String(user.id) : null);
  const isAccountOff = push.accountEnabled === false;
  const isOn = push.deviceStatus === "on";

  return (
    <View className="w-full max-w-[560px] self-center px-4.5 pt-5">
      <Text className="mb-4 text-[17px] font-bold text-content">
        {PUSH_SETTINGS_TITLE}
      </Text>

      <FormErrorBanner message={push.error} />

      <View className="mb-4 flex-row items-center gap-3 rounded-2xl border border-line bg-surface-input p-4">
        <Feather
          name={isAccountOff ? "bell-off" : "bell"}
          size={20}
          color={colors.textSubtle}
        />
        <View className="flex-1">
          <Text className="mb-0.5 text-[15px] font-bold text-content">
            {PUSH_ACCOUNT_LABEL}
          </Text>
          <Text className="text-[12px] leading-[17px] text-content-muted">
            {PUSH_ACCOUNT_HINT}
          </Text>
        </View>
        <Switch
          value={push.accountEnabled === true}
          disabled={push.accountEnabled === null}
          onValueChange={(enabled) => void push.setAccountEnabled(enabled)}
          trackColor={{ false: colors.bgHover, true: colors.accent }}
          thumbColor="#ffffff"
          accessibilityLabel={PUSH_ACCOUNT_LABEL}
        />
      </View>

      <View className="rounded-2xl border border-line bg-surface-raised p-4">
        <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-content-subtle">
          {PUSH_THIS_DEVICE_TITLE}
        </Text>

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
    </View>
  );
}
