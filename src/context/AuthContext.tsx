import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, UserRole } from '../types';
import { SecureStorage } from '../utils/secureStorage';
import { authApi } from '../api/auth';
import { setUnauthorizedHandler } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (phoneOrEmail: string, password: string, selectedRole?: string) => Promise<{ success: boolean; message?: string }>;
  demoLogin: (role: 'WATER_PLANT' | 'DISTRIBUTOR') => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function normalizeRole(roleInput?: string): UserRole {
  if (!roleInput) return 'WATER_PLANT';
  const r = String(roleInput).toUpperCase().trim();
  if (r.includes('DISTRIBUTOR')) return 'DISTRIBUTOR';
  if (r.includes('PLANT') || r.includes('MFR') || r.includes('MANUFACTURER')) return 'WATER_PLANT';
  return 'WATER_PLANT';
}

export function isSupportedMobileRole(roleInput?: string): boolean {
  if (!roleInput) return false;
  const r = String(roleInput).toUpperCase().trim();
  return r.includes('DISTRIBUTOR') || r.includes('PLANT') || r.includes('MFR') || r.includes('MANUFACTURER');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticatingRef = useRef(false);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout().catch(() => {});
    } catch (e) {}
    await SecureStorage.clearSession();
    setUser(null);
    setToken(null);
    setRole(null);
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      await SecureStorage.init();
      const savedToken = SecureStorage.getCachedToken() || (await SecureStorage.getToken());
      const savedUser = SecureStorage.getCachedUser() || (await SecureStorage.getUser());

      if (savedToken && savedUser) {
        setToken(savedToken);
        const userRole = normalizeRole(savedUser.role);
        setUser(savedUser);
        setRole(userRole);
        // Instant 0ms transition: unblock loading immediately with cached session
        setLoading(false);

        // Validate / refresh token with live backend asynchronously in background
        authApi.me()
          .then(async (res) => {
            if (res.data?.user || res.data?.profile) {
              const fetchedUser = res.data.user || res.data.profile;
              const fetchedRole = normalizeRole(fetchedUser.role);
              setUser(fetchedUser);
              setRole(fetchedRole);
              await SecureStorage.setUser(fetchedUser);
            }
          })
          .catch((err) => {
            if (err.response?.status === 401) {
              signOut();
            }
          });
        return;
      }
    } catch (e) {
      console.warn('Failed to restore mobile auth session:', e);
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
    });
    restoreSession();
  }, [restoreSession, signOut]);

  const signIn = useCallback(async (phoneOrEmail: string, password: string, selectedRole = 'WATER_PLANT') => {
    if (isAuthenticatingRef.current) {
      return { success: false, message: 'Authentication in progress...' };
    }
    isAuthenticatingRef.current = true;

    try {
      const payload: any = { password };
      if (phoneOrEmail.includes('@')) {
        payload.email = phoneOrEmail.trim().toLowerCase();
      } else {
        payload.phone = phoneOrEmail.trim();
      }
      payload.role = selectedRole;

      const res = await authApi.login(payload);
      if (res.data?.token && res.data?.user) {
        const u = res.data.user;
        const normalized = normalizeRole(u.role || selectedRole);

        if (!isSupportedMobileRole(u.role)) {
          return {
            success: false,
            message: 'This mobile app is exclusively for Water Plant and Distributor operations. Please use the Web portal for Admin/Brand accounts.',
          };
        }

        await SecureStorage.setToken(res.data.token);
        if (res.data.refreshToken || res.data.refresh_token) {
          await SecureStorage.setRefreshToken(res.data.refreshToken || res.data.refresh_token);
        }
        await SecureStorage.setUser(u);

        setToken(res.data.token);
        setUser(u);
        setRole(normalized);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    } finally {
      isAuthenticatingRef.current = false;
    }
  }, []);

  const demoLogin = useCallback(async (targetRole: 'WATER_PLANT' | 'DISTRIBUTOR') => {
    if (isAuthenticatingRef.current) {
      return { success: false, message: 'Authentication in progress...' };
    }
    isAuthenticatingRef.current = true;

    try {
      const demoEmail = targetRole === 'WATER_PLANT' ? 'plant.dpi1@offfline.in' : 'distributor@bluedart.com';
      const demoPass = 'password123';

      // 1. Direct login with production demo credentials
      const directRes = await signIn(demoEmail, demoPass, targetRole);
      if (directRes.success) {
        return { success: true };
      }

      // 2. Fallback to /auth/demo-login endpoint
      const res = await authApi.demoLogin(targetRole);
      if (res.data?.token && res.data?.user) {
        const u = res.data.user;
        const normalized = normalizeRole(u.role || targetRole);

        await SecureStorage.setToken(res.data.token);
        if (res.data.refreshToken || res.data.refresh_token) {
          await SecureStorage.setRefreshToken(res.data.refreshToken || res.data.refresh_token);
        }
        await SecureStorage.setUser(u);

        setToken(res.data.token);
        setUser(u);
        setRole(normalized);
        return { success: true };
      }
      return { success: false, message: 'Demo login failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Demo login failed';
      return { success: false, message: msg };
    } finally {
      isAuthenticatingRef.current = false;
    }
  }, [signIn]);

  const updateProfile = useCallback(async (data: any): Promise<boolean> => {
    try {
      const res = await authApi.updateProfile(data);
      if (res.data?.user || res.data?.profile) {
        const updated = res.data.user || res.data.profile;
        setUser(updated);
        await SecureStorage.setUser(updated);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authApi.me();
      if (res.data?.user || res.data?.profile) {
        const fetched = res.data.user || res.data.profile;
        setUser(fetched);
        await SecureStorage.setUser(fetched);
      }
    } catch (e) {}
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      role,
      loading,
      signIn,
      demoLogin,
      signOut,
      updateProfile,
      refreshProfile,
    }),
    [user, token, role, loading, signIn, demoLogin, signOut, updateProfile, refreshProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
