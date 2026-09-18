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
import {
  clearSession,
  getStoredUser,
  getToken,
  setSession,
  updateStoredUser,
} from "../../lib/storage";
import {
  loginService,
  loginWithGoogleService,
  logoutService,
  registerService,
} from "./service";
import type {
  LoginActionResult,
  LoginValues,
  RegisterActionResult,
  RegisterValues,
  User,
} from "./types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginValues) => Promise<LoginActionResult>;
  loginWithGoogle: (idToken: string) => Promise<LoginActionResult>;
  register: (values: RegisterValues) => Promise<RegisterActionResult>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    async (credentials: LoginValues): Promise<LoginActionResult> => {
      const result = await loginService(credentials);

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

  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<LoginActionResult> => {
      const result = await loginWithGoogleService(idToken);

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
    async (values: RegisterValues): Promise<RegisterActionResult> => {
      return registerService(values);
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    setToken(null);
    setUser(null);

    try {
      await clearSession();
    } catch {}

    await logoutService();
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
      login,
      loginWithGoogle,
      register,
      logout,
      updateUser,
    }),
    [user, token, isLoading, login, loginWithGoogle, register, logout, updateUser],
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
