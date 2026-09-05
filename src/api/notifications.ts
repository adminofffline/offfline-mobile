import api from './client';
import apiCache from './cache';

export const notificationsApi = {
  getNotifications: (params?: { page?: number; limit?: number; unread_only?: boolean }, forceRefresh = false) =>
    apiCache.fetchWithCache(
      `notifications_${JSON.stringify(params || {})}`,
      () => api.get('/notifications', { params }),
      { ttlMs: 15000, forceRefresh }
    ),

  getUnreadCount: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'notifications_unread_count',
      () => api.get('/notifications/unread-count'),
      { ttlMs: 15000, forceRefresh }
    ),

  markAsRead: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/read`);
    apiCache.invalidate(/notifications/);
    return res;
  },

  markAllAsRead: async () => {
    const res = await api.post('/notifications/mark-all-read');
    apiCache.invalidate(/notifications/);
    return res;
  },
};

export default notificationsApi;
