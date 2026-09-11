import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { clearSession, getStoredUser, getToken, setSession } from "../../lib/storage";
import { loginService, logoutService } from "./service";
import type { LoginActionResult, LoginValues, User } from "./types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginValues) => Promise<LoginActionResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesion persistida al iniciar la app
  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedToken = await getToken();
        const storedUser = await getStoredUser<User>();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch {
        // Error leyendo storage, continuar como no autenticado
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
        setToken(result.token);
        setUser(result.user);

        try {
          await setSession(result.token, result.user);
        } catch {
          // Error escribiendo storage local
        }
      }

      return result;
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    const currentToken = token;
    setToken(null);
    setUser(null);

    try {
      await clearSession();
    } catch {
      // Error limpiando storage
    }

    await logoutService(currentToken);
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: user !== null && token !== null,
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading, login, logout],
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
