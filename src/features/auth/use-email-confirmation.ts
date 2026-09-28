import { useEffect, useState } from "react";
import { Linking } from "react-native";

import {
  getConfirmationToken,
  subscribeToConfirmationLinks,
} from "../../lib/email-confirmation-links";

interface EmailConfirmationState {
  email?: string;
  token?: string;
  canResend: boolean;
  handleRegistered: (email: string) => void;
  handleEmailNotVerified: (email: string) => void;
  clear: () => void;
}

export function useEmailConfirmation(
  onTokenReceived: () => void,
): EmailConfirmationState {
  const [email, setEmail] = useState<string>();
  const [token, setToken] = useState<string>();
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const openConfirmationLink = (confirmationToken: string) => {
      setToken(confirmationToken);
      setEmail(undefined);
      setCanResend(false);
      onTokenReceived();
    };

    Linking.getInitialURL()
      .then((url) => {
        if (cancelled || !url) return;
        const confirmationToken = getConfirmationToken(url);
        if (confirmationToken) openConfirmationLink(confirmationToken);
      })
      .catch(() => {});

    const unsubscribe = subscribeToConfirmationLinks(openConfirmationLink);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [onTokenReceived]);

  function handleRegistered(registeredEmail: string) {
    setEmail(registeredEmail);
    setToken(undefined);
    setCanResend(false);
  }

  function handleEmailNotVerified(unverifiedEmail: string) {
    setEmail(unverifiedEmail);
    setToken(undefined);
    setCanResend(true);
  }

  function clear() {
    setEmail(undefined);
    setToken(undefined);
    setCanResend(false);
  }

  return {
    email,
    token,
    canResend,
    handleRegistered,
    handleEmailNotVerified,
    clear,
  };
}
