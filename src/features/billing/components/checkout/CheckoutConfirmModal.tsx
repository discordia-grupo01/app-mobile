import {
  BILLING_COPY,
  type CheckoutItem,
  formatArsFromCents,
  formatPoints,
  PREMIUM_RENEWAL_NOTICE,
  validateEmail,
} from "@discordia/client-shared";

import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { ModalCloseButton } from "../../../../components/ui/ModalCloseButton";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { TextField } from "../../../../components/ui/TextField";
import {
  DiscordiaPointIcon,
  DiscordiaPremiumIcon,
} from "../shared/DiscordiaIcons";

interface CheckoutFormProps {
  item: CheckoutItem;
  defaultEmail: string;
  pending: boolean;
  error: string | null;
  onConfirm: (payerEmail: string) => void;
}

interface CheckoutConfirmModalProps extends Omit<CheckoutFormProps, "item"> {
  item: CheckoutItem | null;
  onClose: () => void;
}

export function CheckoutConfirmModal({
  item,
  pending,
  onClose,
  ...form
}: CheckoutConfirmModalProps) {
  return (
    <ModalShell
      visible={item !== null}
      onClose={pending ? () => undefined : onClose}
      dismissOnBackdrop={!pending}
      className="max-w-[420px] px-6 py-7"
    >
      {pending ? null : <ModalCloseButton onPress={onClose} />}
      {item ? <CheckoutForm item={item} pending={pending} {...form} /> : null}
    </ModalShell>
  );
}

function CheckoutForm({
  item,
  defaultEmail,
  pending,
  error,
  onConfirm,
}: CheckoutFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [emailError, setEmailError] = useState<string>();

  function submit() {
    if (item.kind === "premium") {
      const invalid = validateEmail(email);
      setEmailError(invalid);
      if (invalid) return;
    }
    onConfirm(email.trim());
  }

  return (
    <View className="gap-5">
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
        {pending
          ? BILLING_COPY.checkoutPreparing
          : BILLING_COPY.checkoutTitle[item.kind]}
      </Text>

      <View className="flex-row items-center gap-4">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-surface-input">
          {item.kind === "premium" ? (
            <DiscordiaPremiumIcon size={30} />
          ) : (
            <DiscordiaPointIcon size={28} />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-[19px] font-bold text-content">
            {item.kind === "premium"
              ? BILLING_COPY.premiumTitle
              : formatPoints(item.points)}
          </Text>
          <Text className="text-[17px] font-semibold text-content-muted">
            {formatArsFromCents(item.priceCents)}
          </Text>
        </View>
      </View>

      {item.kind === "premium" ? (
        <>
          <Text className="text-[13px] leading-[19px] text-content-muted">
            {PREMIUM_RENEWAL_NOTICE}
          </Text>
          <TextField
            label={BILLING_COPY.payerEmailLabel}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            editable={!pending}
            error={emailError}
            onChangeText={(value) => {
              setEmail(value);
              setEmailError(undefined);
            }}
            onSubmitEditing={submit}
          />
        </>
      ) : null}

      <FormErrorBanner message={error} />

      <Button
        title={
          pending
            ? BILLING_COPY.checkoutPreparing
            : BILLING_COPY.checkoutContinue
        }
        isLoading={pending}
        onPress={submit}
      />
    </View>
  );
}
