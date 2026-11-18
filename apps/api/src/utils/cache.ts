interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleMemoryCache {
  private store = new Map<string, CacheEntry<any>>();

  /**
   * Retrieve item from cache if not expired.
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  /**
   * Store item with TTL in seconds (default 60s).
   */
  set<T>(key: string, value: T, ttlSeconds: number = 60): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete single key.
   */
  del(key: string): void {
    this.store.delete(key);
  }

  /**
   * Delete all keys starting with prefix.
   */
  delPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get cached value or compute and store if missing.
   */
  async getOrSet<T>(key: string, fn: () => Promise<T>, ttlSeconds: number = 60): Promise<T> {
    const existing = this.get<T>(key);
    if (existing !== undefined) {
      return existing;
    }
    const fresh = await fn();
    this.set<T>(key, fresh, ttlSeconds);
    return fresh;
  }

  /**
   * Clear all cache.
   */
  clear(): void {
    this.store.clear();
  }
}

export const memoryCache = new SimpleMemoryCache();
