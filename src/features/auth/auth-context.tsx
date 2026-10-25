import {
  type LoginResultWithToken,
  type LoginValues,
  type EmailConfirmationResult,
  type PinLoginResult,
  type RegisterResult,
  type RegisterValues,
  type TwoFactorVerifyResultWithToken,
  type User,
} from "@discordia/client-shared";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { refreshAccessToken, setAuthEventHandlers } from "../../lib/api-client";
import { clearPendingMessages } from "../../lib/pending-messages";
import {
  clearSession,
  getPinEnabled,
  getStoredUser,
  getToken,
  setPinEnabled as persistPinEnabled,
  setSession,
  updateStoredUser,
} from "../../lib/storage";
import {
  loginService,
  loginWithGoogleService,
  loginWithPinService,
  logoutService,
  registerService,
  requestEmailConfirmationService,
} from "./service";
import { verifyTwoFactorService } from "../two-factor/service";
import { closeSocket } from "../messages/socket";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Hay una sesion guardada que se esta validando contra el backend. */
  isRestoringSession: boolean;
  isPinEnabled: boolean;
  setPinEnabled: (enabled: boolean) => Promise<void>;
  login: (credentials: LoginValues) => Promise<LoginResultWithToken>;
  loginWithGoogle: (idToken: string) => Promise<LoginResultWithToken>;
  loginWithPin: (pin: string) => Promise<PinLoginResult>;
  verifyTwoFactor: (
    challengeToken: string,
    code: string,
  ) => Promise<TwoFactorVerifyResultWithToken>;
  register: (values: RegisterValues) => Promise<RegisterResult>;
  requestEmailConfirmation: (email: string) => Promise<EmailConfirmationResult>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPinEnabled, setIsPinEnabledState] = useState(false);

  useEffect(() => {
    setAuthEventHandlers({
      onTokenRefreshed: (newToken, refreshedUser) => {
        setToken(newToken);
        setUser(refreshedUser as User);
      },
      onSessionExpired: () => {
        setToken(null);
        setUser(null);
      },
    });

    return () => setAuthEventHandlers({});
  }, []);

  useEffect(() => {
    async function loadStoredSession() {
      const pinEnabled = await getPinEnabled().catch(() => false);
      setIsPinEnabledState(pinEnabled);

      try {
        const storedUser = await getStoredUser<User>();
        const storedToken = await getToken();

        if (storedUser && storedToken) {
          setUser(storedUser);
          setToken(storedToken);

          const freshToken = await refreshAccessToken();
          if (!freshToken) {
            setUser(null);
            setToken(null);
          }
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredSession();
  }, []);

  const login = useCallback(
    async (credentials: LoginValues): Promise<LoginResultWithToken> => {
      const result = await loginService(credentials);

      if (result.ok && !result.twoFactorRequired) {
        try {
          await setSession(result.token, result.user);
        } catch {}

        setToken(result.token);
        setUser(result.user);
      }

      return result;
    },
    [],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<LoginResultWithToken> => {
      const result = await loginWithGoogleService(idToken);

      if (result.ok && !result.twoFactorRequired) {
        try {
          await setSession(result.token, result.user);
        } catch {}

        setToken(result.token);
        setUser(result.user);
      }

      return result;
    },
    [],
  );

  const loginWithPin = useCallback(
    async (pin: string): Promise<PinLoginResult> => {
      const result = await loginWithPinService(pin);

      if (result.ok && !result.twoFactorRequired) {
        try {
          await setSession(result.token, result.user);
        } catch {}

        setToken(result.token);
        setUser(result.user);
      }

      return result;
    },
    [],
  );

  const verifyTwoFactor = useCallback(
    async (
      challengeToken: string,
      code: string,
    ): Promise<TwoFactorVerifyResultWithToken> => {
      const result = await verifyTwoFactorService(challengeToken, code);

      if (result.ok) {
        try {
          await setSession(result.token, result.user);
        } catch {}

        setToken(result.token);
        setUser(result.user);
      }

      return result;
    },
    [],
  );

  const register = useCallback(
    async (values: RegisterValues): Promise<RegisterResult> => {
      return registerService(values);
    },
    [],
  );

  const requestEmailConfirmation = useCallback(
    (email: string) => requestEmailConfirmationService(email),
    [],
  );

  const userId = user?.id;
  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutService();
    } catch {}
    // Sin esperar a que se desmonte la home: los demas te ven desconectado ya.
    closeSocket();

    setToken(null);
    setUser(null);

    try {
      await clearSession();
    } catch {}
    if (userId !== undefined) await clearPendingMessages(String(userId));
  }, [userId]);

  const setPinEnabled = useCallback(async (enabled: boolean): Promise<void> => {
    setIsPinEnabledState(enabled);
    try {
      await persistPinEnabled(enabled);
    } catch {}
  }, []);

  const updateUser = useCallback((updated: User): void => {
    setUser(updated);
    updateStoredUser(updated).catch(() => {});
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: user !== null && token !== null,
      isLoading,
      isRestoringSession: isLoading && user !== null,
      isPinEnabled,
      setPinEnabled,
      login,
      loginWithGoogle,
      loginWithPin,
      verifyTwoFactor,
      register,
      requestEmailConfirmation,
      logout,
      updateUser,
    }),
    [
      user,
      token,
      isLoading,
      isPinEnabled,
      setPinEnabled,
      login,
      loginWithGoogle,
      loginWithPin,
      verifyTwoFactor,
      register,
      requestEmailConfirmation,
      logout,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return context;
}
