/**
 * Global AI Insights Persistence & Background Request Manager
 * - Persists all generated AI insights in localStorage across page transitions
 * - Keeps in-flight AI requests alive in background even if user navigates away
 * - Notifies active components when background requests complete
 */

const STORAGE_PREFIX = 'iq_ai_insight_';
const inFlightPromises = new Map();
const listeners = new Set();

function makeKey(type, params) {
  const paramStr = typeof params === 'object' ? JSON.stringify(params) : String(params);
  return `${STORAGE_PREFIX}${type}_${paramStr.toUpperCase()}`;
}

export const aiStorage = {
  /**
   * Synchronously get cached AI insight from localStorage
   */
  get(type, params) {
    try {
      const key = makeKey(type, params);
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  /**
   * Save AI insight to localStorage and notify listeners
   */
  set(type, params, data) {
    try {
      const key = makeKey(type, params);
      const payload = {
        data,
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(payload));
      aiStorage.notify(type, params, data);
    } catch (e) {
      console.warn('Failed to save AI insight to localStorage:', e);
    }
  },

  /**
   * Check if a generation request is currently running in the background
   */
  isLoading(type, params) {
    const key = makeKey(type, params);
    return inFlightPromises.has(key);
  },

  /**
   * Execute an AI fetcher with background persistence
   * Even if component unmounts, this promise continues, saves to storage, and notifies listeners.
   */
  async execute(type, params, fetcher) {
    const key = makeKey(type, params);

    // If an identical request is already running in background, attach to it
    if (inFlightPromises.has(key)) {
      return inFlightPromises.get(key);
    }

    const promise = (async () => {
      try {
        const result = await fetcher();
        if (result) {
          aiStorage.set(type, params, result);
        }
        return result;
      } finally {
        inFlightPromises.delete(key);
        aiStorage.notify(type, params, null, false);
      }
    })();

    inFlightPromises.set(key, promise);
    aiStorage.notify(type, params, null, true);
    return promise;
  },

  /**
   * Subscribe to background updates
   */
  subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  /**
   * Notify subscribers of data updates or loading state changes
   */
  notify(type, params, data, loading = false) {
    listeners.forEach((cb) => {
      try {
        cb({ type, params, data, loading });
      } catch (e) {
        console.error('AI Storage subscriber error:', e);
      }
    });
  },

  /**
   * Clear cache for a specific insight or all
   */
  clear(type, params) {
    if (type && params) {
      const key = makeKey(type, params);
      localStorage.removeItem(key);
      aiStorage.notify(type, params, null, false);
    } else {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
      listeners.forEach((cb) => {
        try {
          cb({ type: 'ALL', params: null, data: null, loading: false });
        } catch { /* handle */ }
      });
    }
  },
};
