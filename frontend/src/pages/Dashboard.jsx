import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { getWatchlist, getMarketSummary } from '../lib/api';
import IndexMiniChart from '../components/IndexMiniChart';

const DEFAULT_WATCHLIST_ITEMS = [
  { id: '1', ticker: 'TCS', name: 'Tata Consultancy Services', price: 2361.00, change: -14.00, change_pct: -0.59, status: 'Process', sector: 'IT Services', time: '11 mins ago' },
  { id: '2', ticker: 'RELIANCE', name: 'Reliance Industries', price: 1310.00, change: -7.00, change_pct: -0.53, status: 'Process', sector: 'Energy & Retail', time: '32 mins ago' },
  { id: '3', ticker: 'INFY', name: 'Infosys Limited', price: 1169.20, change: -5.80, change_pct: -0.49, status: 'Process', sector: 'IT Services', time: '1 hour ago' },
  { id: '4', ticker: 'HDFCBANK', name: 'HDFC Bank Limited', price: 1640.10, change: 8.10, change_pct: 0.50, status: 'Bullish', sector: 'Banking', time: '3 hours ago' },
  { id: '5', ticker: 'WIPRO', name: 'Wipro Limited', price: 520.40, change: 2.40, change_pct: 0.46, status: 'Bullish', sector: 'IT Services', time: '5 hours ago' },
  { id: '6', ticker: 'BAJFINANCE', name: 'Bajaj Finance', price: 6850.00, change: 50.00, change_pct: 0.74, status: 'Bullish', sector: 'Financials', time: '1 day ago' },
];

const DEFAULT_MARKET = {
  NIFTY50: { value: 24366.00, change: -29.80, change_pct: -0.12 },
  SENSEX: { value: 78009.25, change: -70.75, change_pct: -0.09 },
};

const SECTORS_HEATMAP = [
  { id: 'it', name: 'IT Services', changePct: 1.35, code: 'NIFTY IT', count: '10 Equities' },
  { id: 'banking', name: 'Banking & Fin', changePct: 0.72, code: 'BANK NIFTY', count: '12 Equities' },
  { id: 'auto', name: 'Automotive', changePct: 1.10, code: 'NIFTY AUTO', count: '8 Equities' },
  { id: 'energy', name: 'Energy & Oil', changePct: -0.48, code: 'NIFTY ENERGY', count: '9 Equities' },
  { id: 'fmcg', name: 'FMCG / Retail', changePct: 0.38, code: 'NIFTY FMCG', count: '6 Equities' },
  { id: 'infra', name: 'Infrastructure', changePct: 0.64, code: 'NIFTY INFRA', count: '5 Equities' },
  { id: 'telecom', name: 'Telecom', changePct: 0.95, code: 'NIFTY MEDIA', count: '4 Equities' },
  { id: 'pharma', name: 'Healthcare', changePct: -0.22, code: 'NIFTY PHARMA', count: '7 Equities' },
];

const LIVE_MARKET_NEWS = [
  {
    ticker: '$TCS',
    sector: 'IT SERVICES',
    headline: 'TCS secures major multi-year digital transformation deal with European retail giant.',
    source: 'Reuters',
    icon: 'globe',
    time: '2m ago',
    url: 'https://www.reuters.com/technology',
  },
  {
    ticker: '$RELIANCE',
    sector: 'ENERGY',
    headline: 'Reliance Industries announces massive investment in green hydrogen ecosystem in Gujarat.',
    source: 'Bloomberg',
    icon: 'doc',
    time: '12m ago',
    url: 'https://www.bloomberg.com/asia',
  },
  {
    ticker: '$INFY',
    sector: 'IT SERVICES',
    headline: 'Infosys beats Q3 margin estimates, raises lower end of FY revenue guidance.',
    source: 'CNBC TV18',
    icon: 'doc',
    time: '24m ago',
    url: 'https://www.cnbctv18.com/market',
  },
  {
    ticker: '$HDFCBANK',
    sector: 'BANKING',
    headline: 'HDFC Bank reports 18% YoY growth in retail loan book, deposit growth remains strong.',
    source: 'Mint',
    icon: 'chart',
    time: '45m ago',
    url: 'https://www.livemint.com/market',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST_ITEMS);
  const [market, setMarket] = useState(DEFAULT_MARKET);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadData = useCallback(async () => {
    try {
      const [wlData, mData] = await Promise.all([
        getWatchlist().catch(() => null),
        getMarketSummary().catch(() => null),
      ]);
      if (wlData?.watchlist?.length) {
        setWatchlist(wlData.watchlist.map((item, idx) => ({
          ...item,
          status: (item.change_pct ?? 0) >= 0.5 ? 'Bullish' : (item.change_pct ?? 0) >= 0 ? 'Process' : 'Failed',
          sector: ['IT Services', 'Energy', 'Banking', 'Finance', 'FMCG', 'Automotive'][idx % 6],
          time: `${(idx + 1) * 15} mins ago`,
        })));
      }
      if (mData) {
        setMarket(mData);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredList = activeFilter === 'gainers'
    ? watchlist.filter(w => (w.change_pct ?? 0) > 0.5)
    : activeFilter === 'it'
    ? watchlist.filter(w => w.sector?.includes('IT') || ['TCS', 'INFY', 'WIPRO'].includes(w.ticker))
    : watchlist;

  const niftyVal = market?.NIFTY50?.value ?? 24395.85;
  const niftyChgPct = market?.NIFTY50?.change_pct ?? 0.52;
  const sensexVal = market?.SENSEX?.value ?? 79879.96;
  const sensexChgPct = market?.SENSEX?.change_pct ?? 0.48;

  return (
    <AppShell onRefresh={loadData}>
      <div className="dashboard-grid">
        {/* Left Main Column */}
        <div className="left-column">
          {/* Market Indices Charts Row */}
          <div>
            <div className="section-header">
              <div className="section-title">Market Indices</div>
              <span className="see-all-link" onClick={() => navigate('/stocks')}>All Stocks →</span>
            </div>

            <div className="cards-row">
              {/* NSE NIFTY 50 Live Chart */}
              <IndexMiniChart
                symbol="^NSEI"
                name="NIFTY 50"
                exchange="NSE"
                price={niftyVal}
                change={market?.NIFTY50?.change ?? 125.4}
                changePct={niftyChgPct}
              />

              {/* BSE SENSEX Live Chart */}
              <IndexMiniChart
                symbol="^BSESN"
                name="BSE SENSEX"
                exchange="BSE"
                price={sensexVal}
                change={market?.SENSEX?.change ?? 380.2}
                changePct={sensexChgPct}
              />
            </div>
          </div>

          {/* Quick Action Pills Row */}
          <div className="action-pills-row">
            <button
              className={`action-pill ${activeFilter === 'gainers' ? 'primary' : 'secondary'}`}
              onClick={() => setActiveFilter(activeFilter === 'gainers' ? 'all' : 'gainers')}
            >
              <span className="action-icon-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
              </span>
              <span>Top Gainers</span>
            </button>

            <button
              className="action-pill secondary"
              onClick={() => navigate('/digest')}
            >
              <span className="action-icon-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </span>
              <span>AI Digest</span>
            </button>

            <button
              className={`action-pill ${activeFilter === 'it' ? 'primary' : 'secondary'}`}
              onClick={() => setActiveFilter(activeFilter === 'it' ? 'all' : 'it')}
            >
              <span className="action-icon-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </span>
              <span>IT Stocks</span>
            </button>

            <button
              className={`action-pill ${activeFilter === 'all' ? 'primary' : 'secondary'}`}
              onClick={() => setActiveFilter('all')}
            >
              <span className="action-icon-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </span>
              <span>All Watchlist</span>
            </button>
          </div>

          {/* Recent Sales / Stock Movers Table */}
          <div className="sales-card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <div className="section-title">Recent Movers & Watchlist</div>
              <span className="see-all-link" onClick={() => navigate('/stocks')}>View Directory →</span>
            </div>

            <table className="sales-table">
              <thead>
                <tr>
                  <th>Sender / Ticker</th>
                  <th>Date & Sector</th>
                  <th>Status</th>
                  <th>Amount / LTP</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => {
                  const isBullish = (item.change_pct ?? 0) >= 0;
                  const statusClass = item.status === 'Bullish' ? 'success' : item.status === 'Process' ? 'process' : 'failed';
                  const initials = item.ticker.slice(0, 2);

                  return (
                    <tr
                      key={item.ticker}
                      className="sales-row"
                      onClick={() => navigate(`/stock/${item.ticker}`)}
                    >
                      <td>
                        <div className="sender-cell">
                          <div className="sender-avatar">
                            {initials}
                            <span className="sender-dot" />
                          </div>
                          <div>
                            <div className="sender-name">{item.name || item.ticker}</div>
                            <div className="sender-ticker">NSE: {item.ticker}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {item.sector || 'NSE Equity'}
                      </td>
                      <td>
                        <span className={`status-badge ${statusClass}`}>
                          <span className="status-dot" />
                          {item.status === 'Bullish' ? 'Success' : item.status === 'Process' ? 'Process' : 'Failed'}
                        </span>
                      </td>
                      <td>
                        <div className="amount-text">
                          ₹{item.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) ?? '—'}
                        </div>
                        <div style={{ fontSize: 11, color: isBullish ? '#8EB69B' : '#FF6B6B', fontWeight: 600 }}>
                          {isBullish ? '+' : ''}{(item.change_pct ?? 0).toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Two Vertical Sections (Live Market News & Sector Heatmap - Pixel Perfect Match) */}
        <aside className="dashboard-right-column">
          {/* Section 1: Live Market News */}
          <div className="live-news-section">
            <div className="live-news-header">
              <div className="live-news-title">Live Market News</div>
              <div className="live-news-badge">
                <span>NSE/BSE</span>
              </div>
            </div>

            <div className="live-news-list">
              {LIVE_MARKET_NEWS.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="live-news-item"
                  title="Open original article"
                >
                  <div className="live-news-tags-row">
                    <span className="ticker-tag-green">{item.ticker}</span>
                    <span className="sector-tag-gray">{item.sector}</span>
                  </div>
                  <div className="live-news-headline">{item.headline}</div>
                  <div className="live-news-meta-row">
                    <div className="live-news-source">
                      {item.icon === 'globe' && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="2" y1="12" x2="22" y2="12"></line>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                      )}
                      {item.icon === 'doc' && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                          <path d="M18 14h-8"></path>
                          <path d="M18 18h-8"></path>
                          <path d="M18 10h-8"></path>
                        </svg>
                      )}
                      {item.icon === 'chart' && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                      )}
                      <span>{item.source}</span>
                    </div>
                    <span className="live-news-timestamp">{item.time}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Section 2: Sector Heatmap */}
          <div className="sector-heatmap-section">
            <div className="heatmap-title-block">
              <div className="heatmap-main-title">Sector Heatmap</div>
              <div className="heatmap-subtitle">Live • Today</div>
            </div>

            <div className="heatmap-tiles-container">
              {/* Top full-width tile */}
              <div className="heatmap-tile-top">
                <div className="heatmap-tile-top-label">NIFTY IT</div>
                <div className="heatmap-tile-top-bottom">
                  <span className="heatmap-tile-value">35,420.50</span>
                  <span className="heatmap-tile-percent-large">+2.45%</span>
                </div>
              </div>

              {/* Bottom 2-col row */}
              <div className="heatmap-bottom-row">
                <div className="heatmap-tile-half positive">
                  <div className="heatmap-tile-label">AUTO</div>
                  <div className="heatmap-tile-percent">+1.20%</div>
                </div>

                <div className="heatmap-tile-half negative">
                  <div className="heatmap-tile-label">BANK NIFTY</div>
                  <div className="heatmap-tile-percent">-0.85%</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
