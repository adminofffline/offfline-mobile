/**
 * In-memory API Cache & Request Deduplication for Mobile
 * Provides 0ms instant cached data retrieval with stale-while-revalidate background refresh.
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ApiCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private inFlightRequests: Map<string, Promise<any>> = new Map();

  /**
   * Default TTL: 30 seconds for dashboard data
   */
  private defaultTTL = 30 * 1000;

  /**
   * Get cached data if valid
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      // Stale-while-revalidate: Still return stale data for 0ms UI rendering, but caller can revalidate
      return entry.data;
    }
    return entry.data;
  }

  /**
   * Check if cache entry is fresh (not stale)
   */
  isFresh(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp <= entry.ttl;
  }

  /**
   * Store data in cache
   */
  set<T = any>(key: string, data: T, ttlMs?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs ?? this.defaultTTL,
    });
  }

  /**
   * In-Flight Request Deduplication:
   * If an identical network request is already running, return the existing Promise
   * rather than dispatching a duplicate concurrent HTTP request.
   */
  async deduplicate<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const existing = this.inFlightRequests.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = (async () => {
      try {
        const result = await fetcher();
        this.set(key, result);
        return result;
      } finally {
        this.inFlightRequests.delete(key);
      }
    })();

    this.inFlightRequests.set(key, promise);
    return promise;
  }

  /**
   * Fetch with automatic caching & in-flight deduplication:
   * Returns fresh cached data immediately if available; otherwise runs fetcher with deduplication.
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { ttlMs?: number; forceRefresh?: boolean }
  ): Promise<T> {
    const { ttlMs, forceRefresh = false } = options || {};
    if (!forceRefresh && this.isFresh(key)) {
      const cached = this.get<T>(key);
      if (cached !== null && cached !== undefined) {
        return cached;
      }
    }
    return this.deduplicate(key, async () => {
      const res = await fetcher();
      this.set(key, res, ttlMs);
      return res;
    });
  }

  /**
   * Invalidate specific keys or patterns (e.g. after scan or mutation)
   */
  invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.inFlightRequests.clear();
  }
}

export const apiCache = new ApiCacheService();
export default apiCache;
