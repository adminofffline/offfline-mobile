import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { CONFIG } from '../constants/config';
import { SecureStorage } from '../utils/secureStorage';

export const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let onUnauthorizedCallback: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorizedCallback = fn;
}

// Request Interceptor: Attach Bearer token from secure storage or fallback bypass
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        config.headers.Authorization = 'Bearer dev_token_bypass_water_plant';
      }
    } catch (e) {
      config.headers.Authorization = 'Bearer dev_token_bypass_water_plant';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 and attempt automatic token renewal
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/demo-login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await SecureStorage.getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        await SecureStorage.clearSession();
        if (onUnauthorizedCallback) onUnauthorizedCallback();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${CONFIG.API_BASE_URL}/auth/refresh-token`, {
          refresh_token: refreshToken,
        });

        const newToken = refreshResponse.data?.token;
        if (newToken) {
          await SecureStorage.setToken(newToken);
          if (refreshResponse.data?.refresh_token) {
            await SecureStorage.setRefreshToken(refreshResponse.data.refresh_token);
          }
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        } else {
          throw new Error('No token returned from refresh');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await SecureStorage.clearSession();
        if (onUnauthorizedCallback) onUnauthorizedCallback();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
