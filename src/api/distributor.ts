import api from './client';
import apiCache from './cache';

export const distributorApi = {
  getDashboard: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'distributor_dashboard',
      () => api.get('/distributor/dashboard'),
      { ttlMs: 15000, forceRefresh }
    ),

  getDeliveries: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'distributor_deliveries',
      () => api.get('/distributor/deliveries'),
      { ttlMs: 15000, forceRefresh }
    ),

  getScans: (params?: { limit?: number; today_only?: boolean }, forceRefresh = false) =>
    apiCache.fetchWithCache(
      `distributor_scans_${params?.limit || ''}_${params?.today_only ? '1' : '0'}`,
      () => api.get('/distributor/scans', { params }),
      { ttlMs: 15000, forceRefresh }
    ),

  getTodayScans: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'distributor_today_scans',
      () => api.get('/distributor/scans/today'),
      { ttlMs: 15000, forceRefresh }
    ),

  scanQr: async (data: {
    qr_id: string;
    campaign_id?: string;
    batch_id?: string;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  }) => {
    const res = await api.post('/distributor/qr/scan', data);
    apiCache.invalidate(/distributor_scans|distributor_dashboard|distributor_today_scans/);
    return res;
  },

  completeDistribution: async (data: { campaign_id: string }) => {
    const res = await api.post('/distributor/qr/complete', data);
    apiCache.invalidate(/distributor/);
    return res;
  },

  getSettlements: (params?: { distributor_id?: string; date?: string }, forceRefresh = false) =>
    apiCache.fetchWithCache(
      `distributor_settlements_${params?.distributor_id || ''}_${params?.date || ''}`,
      () => api.get('/distributor/settlements', { params }),
      { ttlMs: 30000, forceRefresh }
    ),

  bulkSimulateScans: async (campaignId: string, count: number) => {
    const res = await api.post('/distributor/qr/bulk-simulate', { campaign_id: campaignId, count });
    apiCache.invalidate(/distributor_scans|distributor_dashboard|distributor_today_scans/);
    return res;
  },
};

export default distributorApi;
