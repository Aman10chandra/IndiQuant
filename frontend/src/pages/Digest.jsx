import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { getDigest } from '../lib/api';
import { aiStorage } from '../lib/aiStorage';

const DEFAULT_TICKERS = ['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'WIPRO', 'BAJFINANCE'];

const SEARCHABLE_INDIAN_STOCKS = [
  { ticker: 'TCS', name: 'Tata Consultancy Services Ltd.', sector: 'Technology' },
  { ticker: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy & Retail' },
  { ticker: 'INFY', name: 'Infosys Limited', sector: 'Technology' },
  { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Financials' },
  { ticker: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Financials' },
  { ticker: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'Financials' },
  { ticker: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Automotive' },
  { ticker: 'SBIN', name: 'State Bank of India', sector: 'Financials' },
  { ticker: 'WIPRO', name: 'Wipro Limited', sector: 'Technology' },
  { ticker: 'HCLTECH', name: 'HCL Technologies Ltd.', sector: 'Technology' },
  { ticker: 'ONGC', name: 'Oil & Natural Gas Corp.', sector: 'Energy' },
  { ticker: 'POWERGRID', name: 'Power Grid Corp. of India', sector: 'Energy' },
  { ticker: 'M&M', name: 'Mahindra & Mahindra Ltd.', sector: 'Automotive' },
  { ticker: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Automotive' },
  { ticker: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'FMCG' },
  { ticker: 'ITC', name: 'ITC Limited', sector: 'FMCG' },
  { ticker: 'LT', name: 'Larsen & Toubro Ltd.', sector: 'Infrastructure' },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Telecom' },
  { ticker: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Financials' },
  { ticker: 'AXISBANK', name: 'Axis Bank Ltd.', sector: 'Financials' },
  { ticker: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries', sector: 'Healthcare' },
  { ticker: 'TITAN', name: 'Titan Company Ltd.', sector: 'Consumer' },
  { ticker: 'NTPC', name: 'NTPC Limited', sector: 'Energy' },
  { ticker: 'ADANIENT', name: 'Adani Enterprises Ltd.', sector: 'Diversified' },
  { ticker: 'COALINDIA', name: 'Coal India Ltd.', sector: 'Energy' },
];

const STOCK_FALLBACK_INFO = {
  TCS: { price: 4180.50, sector: 'INFORMATION TECHNOLOGY', change_pct: 1.20 },
  RELIANCE: { price: 2980.20, sector: 'ENERGY / RETAIL', change_pct: -0.50 },
  INFY: { price: 1820.00, sector: 'INFORMATION TECHNOLOGY', change_pct: 0.50 },
  HDFCBANK: { price: 1640.10, sector: 'BANKING & FINANCE', change_pct: 0.50 },
  WIPRO: { price: 520.40, sector: 'INFORMATION TECHNOLOGY', change_pct: 0.00 },
  BAJFINANCE: { price: 6850.00, sector: 'FINANCIAL SERVICES', change_pct: 0.70 },
  ICICIBANK: { price: 1195.40, sector: 'BANKING & FINANCE', change_pct: 0.80 },
  TATAMOTORS: { price: 985.00, sector: 'AUTOMOTIVE', change_pct: -1.40 },
  SBIN: { price: 845.30, sector: 'BANKING & FINANCE', change_pct: -0.40 },
  HCLTECH: { price: 1640.80, sector: 'INFORMATION TECHNOLOGY', change_pct: 1.40 },
};

export default function DigestPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('1d');

  const [digest, setDigest] = useState(() => aiStorage.get('digest', '1d')?.data || null);
  const [digestMeta, setDigestMeta] = useState(() => aiStorage.get('digest', '1d')?.cachedAt || null);
  const [loading, setLoading] = useState(() => aiStorage.isLoading('digest', '1d'));
  const [isCleared, setIsCleared] = useState(false);

  const [selectedTickers, setSelectedTickers] = useState(() => {
    try {
      const saved = localStorage.getItem('indiquant_digest_tickers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    const cached = aiStorage.get('digest', '1d')?.data;
    if (cached?.items?.length) {
      return cached.items.map(it => it.ticker);
    }
    return DEFAULT_TICKERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Persist selectedTickers to localStorage
  useEffect(() => {
    try {
      if (selectedTickers && selectedTickers.length > 0) {
        localStorage.setItem('indiquant_digest_tickers', JSON.stringify(selectedTickers));
      }
    } catch { /* ignore */ }
  }, [selectedTickers]);

  // Sync when period changes
  useEffect(() => {
    const cached = aiStorage.get('digest', period);
    setDigest(cached?.data || null);
    setDigestMeta(cached?.cachedAt || null);
    setLoading(aiStorage.isLoading('digest', period));
    setIsCleared(false);
    if (cached?.data?.items?.length) {
      setSelectedTickers(cached.data.items.map(it => it.ticker));
    }
  }, [period]);

  // Subscribe to background request completions
  useEffect(() => {
    const unsubscribe = aiStorage.subscribe(({ type, params, data, loading: isLoad }) => {
      if (type === 'digest' && params === period) {
        if (data) {
          setDigest(data);
          setDigestMeta(new Date().toISOString());
          setIsCleared(false);
          if (data.items?.length) {
            setSelectedTickers(data.items.map(it => it.ticker));
          }
        }
        setLoading(isLoad);
      }
    });
    return unsubscribe;
  }, [period]);

  const handleGenerate = async (tickersToAnalyze = selectedTickers) => {
    if (!tickersToAnalyze || !tickersToAnalyze.length) return;

    setLoading(true);
    setIsCleared(false);
    try {
      const data = await aiStorage.execute('digest', period, () => getDigest(tickersToAnalyze, period));
      setDigest(data);
      setDigestMeta(new Date().toISOString());
    } catch { /* handle */ }
    setLoading(false);
  };

  const handleClear = () => {
    aiStorage.clear('digest', period);
    setDigest(null);
    setDigestMeta(null);
    setIsCleared(true);
  };

  const handleAddStock = (tickerRaw) => {
    const t = tickerRaw.trim().toUpperCase();
    if (!t) return;
    if (!selectedTickers.includes(t)) {
      setSelectedTickers(prev => [...prev, t]);
    }
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleAddStock(searchQuery);
    }
  };

  const removeTicker = (ticker) => {
    if (selectedTickers.length > 1) {
      setSelectedTickers(prev => prev.filter(t => t !== ticker));
    }
  };

  const suggestions = searchQuery.trim()
    ? SEARCHABLE_INDIAN_STOCKS.filter(s =>
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const displayItems = digest?.items || [];

  return (
    <AppShell hideSearch={true}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>

        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Market Digest Overview
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            AI-powered technical analysis and market sentiment overview.
          </p>
        </div>

        {/* Watchlist & Search Controls Card */}
        <div
          className="card"
          style={{
            padding: '22px 24px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            background: 'var(--bg-card)',
          }}
        >
          {/* Top Bar inside Card: Title + Timeframe Switcher & Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.08em',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase'
              }}>
                CURRENT WATCHLIST
              </span>
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                ({selectedTickers.length} active)
              </span>
            </div>

            {/* Right Controls: Period Switch, Clear, and Re-analyze */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {/* Period Switcher Capsule */}
              <div
                style={{
                  display: 'flex',
                  background: 'var(--bg-muted)',
                  padding: 4,
                  borderRadius: 24,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {[
                  { id: '1d', label: 'Daily (24h)' },
                  { id: '1w', label: 'Weekly (7d)' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: 'JetBrains Mono, monospace',
                      border: 'none',
                      cursor: 'pointer',
                      background: period === p.id ? 'var(--bg-surface)' : 'transparent',
                      color: period === p.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                      boxShadow: period === p.id ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Clear Button */}
              <button
                onClick={handleClear}
                style={{
                  padding: '8px 18px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: '1px solid var(--border-subtle)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Clear
              </button>

              {/* Re-analyze / Generate Button */}
              <button
                onClick={() => handleGenerate(selectedTickers)}
                disabled={loading}
                style={{
                  padding: '8px 20px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  background: '#8EB69B',
                  color: '#0A0E0C',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 10px rgba(142, 182, 155, 0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0A0E0C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'spin-icon' : ''}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span>{loading ? 'Analyzing…' : digest ? 'Re-analyze' : 'Analyze Watchlist'}</span>
              </button>
            </div>
          </div>

          {/* Integrated Watchlist Search Input with Autocomplete */}
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 14, color: 'var(--text-secondary)', display: 'flex' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search stocks to add to watchlist (e.g. TCS, RELIANCE, INFY, TATAMOTORS, HDFCBANK)..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setShowSuggestions(true)}
                style={{
                  width: '100%',
                  padding: '11px 90px 11px 40px',
                  borderRadius: 12,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
              />
              {searchQuery.trim() && (
                <button
                  onClick={() => handleAddStock(searchQuery)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    padding: '6px 14px',
                    borderRadius: 8,
                    background: '#8EB69B',
                    color: '#0A0E0C',
                    fontSize: 11.5,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  + Add
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 6,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  maxHeight: 240,
                  overflowY: 'auto',
                  padding: '6px 0',
                }}
              >
                {suggestions.map(s => {
                  const isAdded = selectedTickers.includes(s.ticker);
                  return (
                    <div
                      key={s.ticker}
                      onClick={() => {
                        handleAddStock(s.ticker);
                      }}
                      style={{
                        padding: '10px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-muted)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div>
                        <strong style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', marginRight: 10 }}>
                          {s.ticker}
                        </strong>
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                          {s.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)' }}>
                          {s.sector}
                        </span>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: isAdded ? 'rgba(142, 182, 155, 0.15)' : 'var(--bg-muted)',
                          color: isAdded ? '#8EB69B' : 'var(--text-secondary)',
                        }}>
                          {isAdded ? 'Active' : '+ Add'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Ticker Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {selectedTickers.map(ticker => (
              <span
                key={ticker}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                }}
              >
                <span>{ticker}</span>
                {selectedTickers.length > 1 && (
                  <button
                    onClick={() => removeTicker(ticker)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: 13,
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={`Remove ${ticker} from watchlist`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Metadata Timestamp Line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--text-secondary)',
          paddingLeft: 2,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>
            Generated at {digestMeta ? new Date(digestMeta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:45 AM'}
          </span>
          <span>•</span>
          <span>Timeframe: {period === '1d' ? 'Daily (24h)' : 'Weekly (7d)'}</span>
        </div>

        {/* 3-Column Stock Digest Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {selectedTickers.map(t => (
              <div key={t} className="card" style={{ padding: 24, border: '1px solid var(--border-subtle)', borderRadius: 16, background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>{t}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>ANALYZING...</div>
                  </div>
                  <div className="spinner" />
                </div>
                <div className="skeleton" style={{ height: 100, borderRadius: 8 }} />
              </div>
            ))}
          </div>
        ) : displayItems && displayItems.length ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
          }}>
            {displayItems.map(item => {
              const info = STOCK_FALLBACK_INFO[item.ticker] || {};
              const price = item.price || info.price || 2450.00;
              const sector = item.sector || info.sector || 'EQUITY MARKET';
              const changePct = item.change_pct !== undefined ? item.change_pct : (info.change_pct || 0);
              const isUp = changePct > 0;
              const isZero = changePct === 0;

              return (
                <div
                  key={item.ticker}
                  className="card"
                  style={{
                    padding: '24px 26px',
                    borderRadius: 16,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 16,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => navigate(`/stock/${item.ticker}`)}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--border-accent)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Card Header Top */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      {/* Left: Ticker & Sector */}
                      <div>
                        <div style={{
                          fontSize: 20,
                          fontWeight: 800,
                          fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                          color: 'var(--text-primary)',
                          letterSpacing: '-0.3px'
                        }}>
                          {item.ticker}
                        </div>
                        <div style={{
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: 'JetBrains Mono, monospace',
                          color: 'var(--text-secondary)',
                          marginTop: 4,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase'
                        }}>
                          {sector}
                        </div>
                      </div>

                      {/* Right: Price & Badge */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <div style={{
                          fontSize: 18,
                          fontWeight: 800,
                          fontFamily: 'JetBrains Mono, monospace',
                          color: 'var(--text-primary)',
                        }}>
                          {price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>

                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: 'JetBrains Mono, monospace',
                            background: isZero
                              ? 'rgba(255, 255, 255, 0.05)'
                              : isUp
                              ? 'rgba(142, 182, 155, 0.12)'
                              : 'rgba(255, 107, 107, 0.12)',
                            color: isZero
                              ? 'var(--text-secondary)'
                              : isUp
                              ? '#8EB69B'
                              : '#FF6B6B',
                            border: `1px solid ${isZero ? 'var(--border-subtle)' : isUp ? 'rgba(142, 182, 155, 0.28)' : 'rgba(255, 107, 107, 0.28)'}`,
                          }}
                        >
                          <span>{isUp ? '+' : ''}{changePct.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Divider Line */}
                    <div style={{
                      height: 1,
                      background: 'var(--border-subtle)',
                      margin: '16px 0 14px 0',
                      opacity: 0.7
                    }} />

                    {/* Narrative Summary Body */}
                    <p style={{
                      fontSize: 13.5,
                      lineHeight: 1.65,
                      fontFamily: 'Inter, sans-serif',
                      color: 'var(--text-primary)',
                      opacity: 0.95,
                      margin: 0,
                    }}>
                      {item.summary}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="card"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              background: 'var(--bg-card)',
            }}
          >
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 460, lineHeight: 1.6 }}>
              Market digest is currently cleared. Click <strong>Re-analyze</strong> to generate an updated overview for your watchlist.
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                padding: '8px 24px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                background: '#8EB69B',
                color: '#0A0E0C',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(142, 182, 155, 0.25)',
              }}
            >
              Re-analyze Watchlist
            </button>
          </div>
        )}

      </div>
    </AppShell>
  );
}
