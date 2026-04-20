/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { api } from '../shared/api/client';
import type { AuthResponse, User } from '../shared/types';

const STORAGE_KEY = 'agrotrade-session';

type Session = {
  accessToken: string;
  user: User;
};

type AuthContextValue = {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  registerBuyer: (payload: {
    email: string;
    password: string;
    buyerType: 'b2c' | 'b2b';
    displayName: string;
    companyName?: string;
    taxId?: string;
    phone?: string;
  }) => Promise<void>;
  registerFarmer: (payload: {
    email: string;
    password: string;
    displayName: string;
    companyName: string;
    farmTaxId: string;
    pickupAddress?: string;
    phone?: string;
  }) => Promise<void>;
  refreshMe: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistSession(payload: AuthResponse | null) {
  if (!payload) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function readStoredSession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readStoredSession());
  const [isLoading, setIsLoading] = useState(false);

  const accessToken = session?.accessToken;

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    void api
      .me(accessToken)
      .then((user) => {
        setSession((current) => {
          if (!current || current.accessToken !== accessToken) {
            return current;
          }

          const nextSession = { ...current, user };
          persistSession(nextSession);
          return nextSession;
        });
      })
      .catch(() => {
        setSession(null);
        persistSession(null);
      });
  }, [accessToken]);

  const saveAuthResponse = (payload: AuthResponse) => {
    const nextSession = {
      accessToken: payload.accessToken,
      user: payload.user,
    };

    setSession(nextSession);
    persistSession(nextSession);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      isLoading,
      login: async (payload) => {
        setIsLoading(true);
        try {
          const response = await api.login(payload);
          saveAuthResponse(response);
        } finally {
          setIsLoading(false);
        }
      },
      registerBuyer: async (payload) => {
        setIsLoading(true);
        try {
          const response = await api.registerBuyer(payload);
          saveAuthResponse(response);
        } finally {
          setIsLoading(false);
        }
      },
      registerFarmer: async (payload) => {
        setIsLoading(true);
        try {
          const response = await api.registerFarmer(payload);
          saveAuthResponse(response);
        } finally {
          setIsLoading(false);
        }
      },
      refreshMe: async () => {
        if (!session) {
          return;
        }

        const user = await api.me(session.accessToken);
        const nextSession = { ...session, user };
        setSession(nextSession);
        persistSession(nextSession);
      },
      logout: () => {
        setSession(null);
        persistSession(null);
      },
    }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
