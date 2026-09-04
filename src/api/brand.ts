import api from './client';

export const brandApi = {
  getDashboard: () => api.get('/brand/dashboard'),
  getCampaigns: () => api.get('/brand/campaign-list'),
  createCampaign: (data: any) => api.post('/brand/campaigns', data),
  getAnalytics: () => api.get('/brand/campaign-analytics'),
  getPricing: () => api.get('/brand/pricing'),
  getDistributionTracking: (id: string) => api.get(`/brand/campaigns/${id}/distribution-tracking`),
  getCanHistory: (campaignId: string, qrId: string) => api.get(`/brand/campaigns/${campaignId}/can-history/${encodeURIComponent(qrId)}`),
  getWallet: () => api.get('/brand/wallet'),
  addWalletFunds: (data: { amount: number; reference?: string }) => api.post('/brand/wallet/add', data),
};

export default brandApi;
