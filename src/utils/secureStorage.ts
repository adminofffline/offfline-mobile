import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_SERVICE = 'in.offfline.waterads.auth';
const REFRESH_TOKEN_SERVICE = 'in.offfline.waterads.refresh';
const USER_KEY = 'waterads_user_data';
const ROLE_KEY = 'waterads_user_role';

export const SecureStorage = {
  async setToken(token: string): Promise<void> {
    try {
      await Keychain.setGenericPassword('auth_token', token, { service: TOKEN_SERVICE });
    } catch (e) {
      await AsyncStorage.setItem('waterads_auth_token_fallback', token);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: TOKEN_SERVICE });
      if (credentials && credentials.password) {
        return credentials.password;
      }
      return await AsyncStorage.getItem('waterads_auth_token_fallback');
    } catch (e) {
      return await AsyncStorage.getItem('waterads_auth_token_fallback');
    }
  },

  async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await Keychain.setGenericPassword('refresh_token', refreshToken, { service: REFRESH_TOKEN_SERVICE });
    } catch (e) {
      await AsyncStorage.setItem('waterads_refresh_token_fallback', refreshToken);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: REFRESH_TOKEN_SERVICE });
      if (credentials && credentials.password) {
        return credentials.password;
      }
      return await AsyncStorage.getItem('waterads_refresh_token_fallback');
    } catch (e) {
      return await AsyncStorage.getItem('waterads_refresh_token_fallback');
    }
  },

  async setUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      if (user?.role) {
        await AsyncStorage.setItem(ROLE_KEY, user.role);
      }
    } catch (e) {}
  },

  async getUser(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      if (data) return JSON.parse(data);
      return null;
    } catch (e) {
      return null;
    }
  },

  async clearSession(): Promise<void> {
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
