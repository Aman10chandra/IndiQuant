const API_BASE = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://indiquant-backend.onrender.com'
    : ''
);

async function apiFetch(path, options = {}) {
  let url = `${API_BASE}${path}`;
  let res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    // If we received an HTML fallback (e.g. index.html from SPA routing), attempt direct backend query
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      try {
        const directRes = await fetch(`https://indiquant-backend.onrender.com${path}`, {
          ...options,
          headers: { 'Content-Type': 'application/json', ...options.headers },
        });
        if (directRes.ok && (directRes.headers.get('content-type') || '').includes('application/json')) {
          return directRes.json();
        }
      } catch { /* ignore */ }
    }
    throw new Error(`Non-JSON response received from ${path}`);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'API error');
  }
  return res.json();
}

// Market Data
export const getQuote = (ticker) => apiFetch(`/api/market/quote/${ticker}`);
export const getBatchQuotes = (tickers) => apiFetch(`/api/market/quotes?tickers=${tickers.join(',')}`);
export const getHistory = (ticker, period = '3mo') => apiFetch(`/api/market/history/${ticker}?period=${period}`);
export const getFundamentals = (ticker) => apiFetch(`/api/market/fundamentals/${ticker}`);
export const getNews = (ticker, count = 5) => apiFetch(`/api/market/news/${ticker}?count=${count}`);
export const getIndicators = (ticker, indicator = 'ALL') => apiFetch(`/api/market/indicators/${ticker}?indicator=${indicator}`);
export const getWatchlist = () => apiFetch('/api/market/watchlist');
export const addToWatchlist = (ticker) => apiFetch('/api/market/watchlist', { method: 'POST', body: JSON.stringify({ ticker }) });
export const removeFromWatchlist = (ticker) => apiFetch(`/api/market/watchlist/${ticker}`, { method: 'DELETE' });
export const getMarketSummary = () => apiFetch('/api/market/market-summary');

// Normal AI
export const getFundamentalsSummary = (ticker) => apiFetch('/api/ai/fundamentals-summary', { method: 'POST', body: JSON.stringify({ ticker }) });
export const getTechnicalRead = (ticker, period = '3mo') => apiFetch('/api/ai/technical-read', { method: 'POST', body: JSON.stringify({ ticker, period }) });
export const getDigest = (tickers, period = '1d') => apiFetch('/api/ai/digest', { method: 'POST', body: JSON.stringify({ tickers, period }) });
export const explainMetric = (metric, value, sector) => apiFetch('/api/ai/explain-metric', { method: 'POST', body: JSON.stringify({ metric, value, sector }) });
