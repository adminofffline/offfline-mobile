import api from './client';

export const plantApi = {
  getProfile: (plant_id?: string) =>
    api.get('/plant/profile', { params: { plant_id } }),

  updateProfile: (data: any) =>
    api.put('/plant/profile', data),

  getRequests: () =>
    api.get('/plant/requests'),

  acceptRequest: (id: string, info?: any) =>
    api.post(`/plant/requests/${id}/accept`, info),

  rejectRequest: (id: string, reason?: string) =>
    api.post(`/plant/requests/${id}/reject`, { reason }),

  updateStatus: (id: string, status: string, title?: string) =>
    api.put(`/plant/orders/${id}/status`, { status, title }),

  scanQr: (data: {
    qr_id: string;
    campaign_id?: string;
    plant_id?: string;
    plant_name?: string;
    location_name?: string;
    batch_id?: string;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  }) => api.post('/plant/qr/scan', data),

  completeBottling: (data: { campaign_id: string; plant_id?: string; location_name?: string }) =>
    api.post('/plant/qr/complete', data),

  getStats: (params?: { campaign_id?: string; plant_id?: string }) =>
    api.get('/plant/qr/stats', { params }),

  getSettlements: (params?: { plant_id?: string; date?: string }) =>
    api.get('/plant/settlements', { params }),

  bulkSimulateScans: (campaignId: string, count: number) =>
    api.post('/plant/qr/bulk-simulate', { campaign_id: campaignId, count }),

  getBatches: () =>
    api.get('/manufacturer/batches'),

  getOutput: () =>
    api.get('/manufacturer/daily-output'),

  saveOutput: (data: {
    date: string;
    cans_filled: number;
    stickers_applied: number;
    batch_notes?: string | null;
  }) => api.post('/manufacturer/daily-output', data),

  saveCapacity: (data: {
    min_capacity: number;
    max_capacity: number;
    has_inhouse_printer: boolean;
    city?: string;
  }) => api.put('/manufacturer/capacity', data),
};

export default plantApi;
