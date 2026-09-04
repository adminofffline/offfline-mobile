import api from './client';

export const distributorApi = {
  getDashboard: () =>
    api.get('/distributor/dashboard'),

  getDeliveries: () =>
    api.get('/distributor/deliveries'),

  getScans: (params?: { limit?: number; today_only?: boolean }) =>
    api.get('/distributor/scans', { params }),

  getTodayScans: () =>
    api.get('/distributor/scans/today'),

  scanQr: (data: {
    qr_id: string;
    campaign_id?: string;
    batch_id?: string;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  }) => api.post('/distributor/qr/scan', data),

  completeDistribution: (data: { campaign_id: string }) =>
    api.post('/distributor/qr/complete', data),

  getSettlements: (params?: { distributor_id?: string; date?: string }) =>
    api.get('/distributor/settlements', { params }),

  bulkSimulateScans: (campaignId: string, count: number) =>
    api.post('/distributor/qr/bulk-simulate', { campaign_id: campaignId, count }),
};

export default distributorApi;
