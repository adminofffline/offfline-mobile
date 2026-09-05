import api from './client';
import apiCache from './cache';

export const paymentsApi = {
  getSettlements: (params?: any, forceRefresh = false) =>
    apiCache.fetchWithCache(
      `payments_settlements_${JSON.stringify(params || {})}`,
      () => api.get('/payments/settlements', { params }),
      { ttlMs: 30000, forceRefresh }
    ),
  getPlantSettlements: (params?: any) => api.get("/payments/settlements/plant", { params }),
  getDistributorSettlements: (params?: any) => api.get("/payments/settlements/distributor", { params }),
  getPressSettlements: (params?: any) => api.get("/payments/settlements/press", { params }),
  getSummary: () => api.get("/payments/admin/settlements/summary"),
  getPendingSettlements: () => api.get("/payments/admin/settlements/pending"),
  getPaidSettlements: () => api.get("/payments/admin/settlements/paid"),
  getPaymentRequests: () => api.get("/payments/admin/settlements/payment-requests"),
  getCurrentSettlement: (params?: any) => api.get("/payments/settlements/current", { params }),
  getSettlementHistory: () => api.get("/payments/settlements/history"),
  getSettlementDetails: (settlementId: string) => api.get(`/payments/settlements/${settlementId}`),
  requestPayment: (settlementId: string) => api.post(`/payments/settlements/${settlementId}/payment-request`),
  getTransactions: () => api.get("/payments/transactions"),
  getConfig: () => api.get("/payments/config"),
  generateDailySettlement: (data: { date?: string }) => api.post("/payments/settlements/generate-daily", data),
};

export default paymentsApi;
