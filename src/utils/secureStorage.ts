import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_SERVICE = 'in.offfline.waterads.auth';
const REFRESH_TOKEN_SERVICE = 'in.offfline.waterads.refresh';
const USER_KEY = 'waterads_user_data';
const ROLE_KEY = 'waterads_user_role';

// High-speed in-memory cache to eliminate 50-300ms hardware Keychain IPC latency on every network request
let _inMemoryToken: string | null = null;
let _inMemoryRefreshToken: string | null = null;
let _inMemoryUser: any | null = null;
let _inMemoryRole: string | null = null;
let _isInitialized = false;

export const SecureStorage = {
  // Synchronous 0.00ms token lookup for Axios interceptors
  getCachedToken(): string | null {
    return _inMemoryToken;
  },

  getCachedUser(): any | null {
    return _inMemoryUser;
  },

  getCachedRole(): string | null {
    return _inMemoryRole;
  },

  async init(): Promise<void> {
    if (_isInitialized) return;
    try {
      const [token, refreshToken, userStr, roleStr] = await Promise.all([
        this.getToken(),
        this.getRefreshToken(),
        AsyncStorage.getItem(USER_KEY).catch(() => null),
        AsyncStorage.getItem(ROLE_KEY).catch(() => null),
      ]);
      _inMemoryToken = token;
      _inMemoryRefreshToken = refreshToken;
      if (userStr) {
        try {
          _inMemoryUser = JSON.parse(userStr);
        } catch {}
      }
      _inMemoryRole = roleStr;
      _isInitialized = true;
    } catch {
      _isInitialized = true;
    }
  },

  async setToken(token: string): Promise<void> {
    _inMemoryToken = token;
    try {
      await Keychain.setGenericPassword('auth_token', token, { service: TOKEN_SERVICE });
    } catch (e) {
      await AsyncStorage.setItem('waterads_auth_token_fallback', token);
    }
  },

  async getToken(): Promise<string | null> {
    if (_inMemoryToken) return _inMemoryToken;
    try {
      const credentials = await Keychain.getGenericPassword({ service: TOKEN_SERVICE });
      if (credentials && credentials.password) {
        _inMemoryToken = credentials.password;
        return credentials.password;
      }
      const fallback = await AsyncStorage.getItem('waterads_auth_token_fallback');
      _inMemoryToken = fallback;
      return fallback;
    } catch (e) {
      const fallback = await AsyncStorage.getItem('waterads_auth_token_fallback');
      _inMemoryToken = fallback;
      return fallback;
    }
  },

  async setRefreshToken(refreshToken: string): Promise<void> {
    _inMemoryRefreshToken = refreshToken;
    try {
      await Keychain.setGenericPassword('refresh_token', refreshToken, { service: REFRESH_TOKEN_SERVICE });
    } catch (e) {
      await AsyncStorage.setItem('waterads_refresh_token_fallback', refreshToken);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    if (_inMemoryRefreshToken) return _inMemoryRefreshToken;
    try {
      const credentials = await Keychain.getGenericPassword({ service: REFRESH_TOKEN_SERVICE });
      if (credentials && credentials.password) {
        _inMemoryRefreshToken = credentials.password;
        return credentials.password;
      }
      const fallback = await AsyncStorage.getItem('waterads_refresh_token_fallback');
      _inMemoryRefreshToken = fallback;
      return fallback;
    } catch (e) {
      const fallback = await AsyncStorage.getItem('waterads_refresh_token_fallback');
      _inMemoryRefreshToken = fallback;
      return fallback;
    }
  },

  async setUser(user: any): Promise<void> {
    _inMemoryUser = user;
    if (user?.role) _inMemoryRole = user.role;
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      if (user?.role) {
        await AsyncStorage.setItem(ROLE_KEY, user.role);
      }
    } catch (e) {}
  },

  async getUser(): Promise<any | null> {
    if (_inMemoryUser) return _inMemoryUser;
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      if (data) {
        _inMemoryUser = JSON.parse(data);
        return _inMemoryUser;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async clearSession(): Promise<void> {
    _inMemoryToken = null;
    _inMemoryRefreshToken = null;
    _inMemoryUser = null;
    _inMemoryRole = null;
    try {
      await Keychain.resetGenericPassword({ service: TOKEN_SERVICE }).catch(() => {});
      await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE }).catch(() => {});
      await AsyncStorage.multiRemove([
        USER_KEY,
        ROLE_KEY,
        'waterads_auth_token_fallback',
        'waterads_refresh_token_fallback',
      ]);
    } catch (e) {}
  },
};

export default SecureStorage;
