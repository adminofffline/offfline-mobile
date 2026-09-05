import api from './client';
import apiCache from './cache';

export const paymentsApi = {
  getSettlements: (params?: any, forceRefresh = false) =>
    apiCache.fetchWithCache(
      `payments_settlements_${JSON.stringify(params || {})}`,
      () => api.get('/payments/settlements', { params }),
      { ttlMs: 30000, forceRefresh }
    ),
  getPlantSettlements: (params?: any, forceRefresh = false) =>
    apiCache.fetchWithCache(
      `payments_plant_settlements_${JSON.stringify(params || {})}`,
      () => api.get("/payments/settlements/plant", { params }),
      { ttlMs: 30000, forceRefresh }
    ),
  getDistributorSettlements: (params?: any, forceRefresh = false) =>
    apiCache.fetchWithCache(
      `payments_distributor_settlements_${JSON.stringify(params || {})}`,
      () => api.get("/payments/settlements/distributor", { params }),
      { ttlMs: 30000, forceRefresh }
    ),
  getPressSettlements: (params?: any, forceRefresh = false) =>
    apiCache.fetchWithCache(
      `payments_press_settlements_${JSON.stringify(params || {})}`,
      () => api.get("/payments/settlements/press", { params }),
      { ttlMs: 30000, forceRefresh }
    ),
  getSummary: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'payments_admin_summary',
      () => api.get("/payments/admin/settlements/summary"),
      { ttlMs: 30000, forceRefresh }
    ),
  getPendingSettlements: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'payments_admin_pending',
      () => api.get("/payments/admin/settlements/pending"),
      { ttlMs: 15000, forceRefresh }
    ),
  getPaidSettlements: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'payments_admin_paid',
      () => api.get("/payments/admin/settlements/paid"),
      { ttlMs: 30000, forceRefresh }
    ),
  getPaymentRequests: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'payments_admin_requests',
      () => api.get("/payments/admin/settlements/payment-requests"),
      { ttlMs: 15000, forceRefresh }
    ),
  getCurrentSettlement: (params?: any, forceRefresh = false) =>
    apiCache.fetchWithCache(
      `payments_current_${JSON.stringify(params || {})}`,
      () => api.get("/payments/settlements/current", { params }),
      { ttlMs: 15000, forceRefresh }
    ),
  getSettlementHistory: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'payments_history',
      () => api.get("/payments/settlements/history"),
      { ttlMs: 30000, forceRefresh }
    ),
  getSettlementDetails: (settlementId: string, forceRefresh = false) =>
    apiCache.fetchWithCache(
      `payments_detail_${settlementId}`,
      () => api.get(`/payments/settlements/${settlementId}`),
      { ttlMs: 60000, forceRefresh }
    ),
  requestPayment: async (settlementId: string) => {
    const res = await api.post(`/payments/settlements/${settlementId}/payment-request`);
    apiCache.invalidate(/payments/);
    return res;
  },
  getTransactions: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'payments_transactions',
      () => api.get("/payments/transactions"),
      { ttlMs: 30000, forceRefresh }
    ),
  getConfig: (forceRefresh = false) =>
    apiCache.fetchWithCache(
      'payments_config',
      () => api.get("/payments/config"),
      { ttlMs: 60000, forceRefresh }
    ),
  generateDailySettlement: async (data: { date?: string }) => {
    const res = await api.post("/payments/settlements/generate-daily", data);
    apiCache.invalidate(/payments/);
    return res;
  },
};

export default paymentsApi;
