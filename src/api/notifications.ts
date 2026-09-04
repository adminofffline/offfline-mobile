import api from './client';

export const notificationsApi = {
  getNotifications: (params?: { page?: number; limit?: number; unread_only?: boolean }) =>
    api.get('/notifications', { params }),

  getUnreadCount: () =>
    api.get('/notifications/unread-count'),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.post('/notifications/mark-all-read'),
};

export default notificationsApi;
