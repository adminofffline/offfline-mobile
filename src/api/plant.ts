import api from './client';
import apiCache from './cache';

export const plantApi = {
  getProfile: (plant_id?: string, forceRefresh = false) =>
    apiCache.fetchWithCache(
      `plant_profile_${plant_id || 'me'}`,
      () => api.get('/plant/profile', { params: { plant_id } }),
      { ttlMs: 60000, forceRefresh }
    ),

  updateProfile: async (data: any) => {
    const res = await api.put('/plant/profile', data);
    apiCache.invalidate(/plant_profile/);
    return res;
  },

  getRequests: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'plant_requests',
      () => api.get('/plant/requests'),
      { ttlMs: 15000, forceRefresh }
    ),

  acceptRequest: async (id: string, info?: any) => {
    const res = await api.post(`/plant/requests/${id}/accept`, info);
    apiCache.invalidate(/plant_requests/);
    return res;
  },

  rejectRequest: async (id: string, reason?: string) => {
    const res = await api.post(`/plant/requests/${id}/reject`, { reason });
    apiCache.invalidate(/plant_requests/);
    return res;
  },

  updateStatus: async (id: string, status: string, title?: string) => {
    const res = await api.put(`/plant/orders/${id}/status`, { status, title });
    apiCache.invalidate(/plant_requests/);
    return res;
  },

  scanQr: async (data: {
    qr_id: string;
    campaign_id?: string;
    plant_id?: string;
    plant_name?: string;
    location_name?: string;
    batch_id?: string;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  }) => {
    const res = await api.post('/plant/qr/scan', data);
    apiCache.invalidate(/plant_requests|plant_stats/);
    return res;
  },

  completeBottling: async (data: { campaign_id: string; plant_id?: string; location_name?: string }) => {
    const res = await api.post('/plant/qr/complete', data);
    apiCache.invalidate(/plant_requests|plant_stats/);
    return res;
  },

  getStats: (params?: { campaign_id?: string; plant_id?: string }, forceRefresh = false) =>
    apiCache.fetchWithCache(
      `plant_stats_${params?.campaign_id || ''}_${params?.plant_id || ''}`,
      () => api.get('/plant/qr/stats', { params }),
      { ttlMs: 15000, forceRefresh }
    ),

  getSettlements: (params?: { plant_id?: string; date?: string }, forceRefresh = false) =>
    apiCache.fetchWithCache(
      `plant_settlements_${params?.plant_id || ''}_${params?.date || ''}`,
      () => api.get('/plant/settlements', { params }),
      { ttlMs: 30000, forceRefresh }
    ),

  bulkSimulateScans: async (campaignId: string, count: number) => {
    const res = await api.post('/plant/qr/bulk-simulate', { campaign_id: campaignId, count });
    apiCache.invalidate(/plant_requests|plant_stats/);
    return res;
  },

  getBatches: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'manufacturer_batches',
      () => api.get('/manufacturer/batches'),
      { ttlMs: 30000, forceRefresh }
    ),

  getOutput: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'manufacturer_output',
      () => api.get('/manufacturer/daily-output'),
      { ttlMs: 30000, forceRefresh }
    ),

  saveOutput: async (data: {
    date: string;
    cans_filled: number;
    stickers_applied: number;
    batch_notes?: string | null;
  }) => {
    const res = await api.post('/manufacturer/daily-output', data);
    apiCache.invalidate(/manufacturer_output/);
    return res;
  },

  saveCapacity: async (data: {
    min_capacity: number;
    max_capacity: number;
    has_inhouse_printer: boolean;
    city?: string;
  }) => {
    const res = await api.put('/manufacturer/capacity', data);
    apiCache.invalidate(/plant_profile/);
    return res;
  },
};

export default plantApi;
