import api from './client';
import apiCache from './cache';

export const adminApi = {
  getUsers: (forceRefresh = false) =>
    apiCache.fetchWithCache('admin_users', () => api.get('/admin/users'), { ttlMs: 30000, forceRefresh }),
  approveUser: (id: string) => api.post(`/admin/users/${id}/approve`),
  rejectUser: (id: string, reason?: string) => api.post(`/admin/users/${id}/reject`, { reason }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getCampaigns: (forceRefresh = false) =>
    apiCache.fetchWithCache('admin_campaigns', () => api.get('/admin/platform-campaign-ledger'), { ttlMs: 15000, forceRefresh }),
  approveCampaign: (id: string) => api.post(`/admin/campaigns/${id}/approve`),
  rejectCampaign: (id: string, reason?: string) => api.post(`/admin/campaigns/${id}/reject`, { reason }),
  getAnalytics: (forceRefresh = false) =>
    apiCache.fetchWithCache('admin_analytics', () => api.get('/admin/analytics'), { ttlMs: 30000, forceRefresh }),
  getPricing: () => api.get('/admin/pricing'),
  updatePricing: (data: any) => api.put('/admin/pricing', data),
  getActivityLogs: (params?: any, forceRefresh = false) =>
    apiCache.fetchWithCache('admin_activity_logs', () => api.get('/admin/platform-activity-logs', { params }), { ttlMs: 15000, forceRefresh }),
  getPlantApprovals: (status = 'Pending') => api.get(`/admin/plant-approvals?status=${status}`),
  approvePlant: (id: string) => api.post(`/admin/plant-approvals/${id}/approve`),
  rejectPlant: (id: string, reason?: string) => api.post(`/admin/plant-approvals/${id}/reject`, { reason }),
  getManufacturers: () => api.get('/admin/manufacturers'),
  getPrintOrders: () => api.get('/admin/print-orders'),
  getSettlements: (params?: any) => api.get('/payments/settlements', { params }),
  getTransactions: () => api.get('/payments/transactions'),
};

export default adminApi;
