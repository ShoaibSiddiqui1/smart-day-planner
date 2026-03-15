/**
 * AuthContext
 *
 * Provides:
 *  - token    : the stored JWT (null = logged out)
 *  - loading  : true while AsyncStorage is being read on startup
 *  - login()  : calls the backend, stores the token, updates state
 *  - logout() : clears the token from storage and state
 *
 * Wrap the app root with <AuthProvider> and consume with useAuth().
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { authApi } from "@/services/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextType {
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "auth_token";

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate token from persistent storage when the app starts.
  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY)
      .then((stored) => setToken(stored))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await authApi.login(email, password);
    const { access_token } = response.data;
    await AsyncStorage.setItem(TOKEN_KEY, access_token);
    setToken(access_token);
  };

  const logout = async (): Promise<void> => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
