import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
    setLoading(true);
    try {
      const savedToken = await SecureStorage.getToken();
      const savedUser = await SecureStorage.getUser();

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          const userRole = normalizeRole(savedUser.role);
          setUser(savedUser);
          setRole(userRole);
        }

        // Validate token with live backend
        try {
          const res = await authApi.me();
          if (res.data?.user || res.data?.profile) {
            const fetchedUser = res.data.user || res.data.profile;
            const fetchedRole = normalizeRole(fetchedUser.role);
            setUser(fetchedUser);
            setRole(fetchedRole);
            await SecureStorage.setUser(fetchedUser);
          }
        } catch (err: any) {
          if (err.response?.status === 401) {
            await signOut();
          }
        }
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

  const signIn = async (phoneOrEmail: string, password: string, selectedRole = 'WATER_PLANT') => {
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
    }
  };

  const demoLogin = async (targetRole: 'WATER_PLANT' | 'DISTRIBUTOR') => {
    try {
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
    }
  };

  const updateProfile = async (data: any): Promise<boolean> => {
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
  };

  const refreshProfile = async () => {
    try {
      const res = await authApi.me();
      if (res.data?.user || res.data?.profile) {
        const fetched = res.data.user || res.data.profile;
        setUser(fetched);
        await SecureStorage.setUser(fetched);
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        signIn,
        demoLogin,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
