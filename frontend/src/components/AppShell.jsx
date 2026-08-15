import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMarketStatus } from '../lib/marketStatus';

export default function AppShell({ children, onRefresh, hideSearch = false }) {
  const marketStatus = useMarketStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('iq_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('iq_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const ticker = searchQuery.trim().toUpperCase();
      navigate(`/stock/${ticker}`);
      setSearchQuery('');
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch { /* ignore */ }
    setTimeout(() => setRefreshing(false), 400);
  };

  const isDigestPage = location.pathname === '/digest';

  return (
    <div className="app-wrapper">
      <div className="app-frame">
        {/* Left Dark Dock Sidebar */}
        <aside className="dock-sidebar">
          <div className="dock-logo" onClick={() => navigate('/')} title="IndiQuant Home">
            IQ
          </div>

          <nav className="dock-nav">
            <button
              className={`dock-item ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => navigate('/')}
              title="IndiQuant Dashboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              </svg>
            </button>

            <button
              className={`dock-item ${location.pathname === '/digest' ? 'active' : ''}`}
              onClick={() => navigate('/digest')}
              title="IndiQuant AI Digest"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <line x1="9" y1="7" x2="15" y2="7"></line>
                <line x1="9" y1="11" x2="15" y2="11"></line>
              </svg>
            </button>

            <button
              className={`dock-item ${location.pathname.startsWith('/stock') ? 'active' : ''}`}
              onClick={() => navigate('/stocks')}
              title="IndiQuant Stocks Directory & Analytics"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </button>
          </nav>
        </aside>

        {/* Main Viewport */}
        <main className="main-viewport">
          {/* Top Header */}
          <header className="top-header">
            {/* Context Page Title: IndiQuant */}
            <div className="header-left">
              <div className="header-brand-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                  IndiQuant
                </span>
              </div>
            </div>

            {/* Slim Centered Search Bar - Hidden on Digest page */}
            {!hideSearch && !isDigestPage && (
              <div className="search-pill-container">
                <span className="search-icon-inside">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input
                  type="text"
                  className="search-pill"
                  placeholder="Search stocks (e.g. TCS, RELIANCE)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <span className="search-kbd-badge">↵</span>
              </div>
            )}

            {/* Sleek Right Action Controls */}
            <div className="header-actions">
              {/* Compact Market Status Pill with Tooltip */}
              <div className="market-status-pill" title={`${marketStatus.status} (${marketStatus.detail}) - ${marketStatus.istTime}`}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: marketStatus.badgeType === 'open' ? 'var(--green)' : marketStatus.badgeType === 'pre-open' ? 'var(--amber)' : 'var(--text-muted)',
                    boxShadow: marketStatus.badgeType === 'open' ? '0 0 8px rgba(16, 185, 129, 0.7)' : 'none',
                    display: 'inline-block',
                  }}
                />
                <span style={{
                  fontWeight: 700,
                  fontSize: 11,
                  color: marketStatus.badgeType === 'open' ? 'var(--green-text)' : marketStatus.badgeType === 'pre-open' ? 'var(--amber-text)' : 'var(--text-primary)',
                }}>
                  {marketStatus.status}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
                  IST
                </span>
              </div>

              {/* Dark / Light Mode Toggle Button */}
              <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                )}
              </button>

              {/* Manual Refresh Button */}
              <button
                className="refresh-pill"
                onClick={handleManualRefresh}
                disabled={refreshing}
                title="Refresh market data"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? 'spin-icon' : ''}>
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              </button>
            </div>
          </header>

          {/* Page Content */}
          {children}

          {/* Fixed Bottom Status & Disclaimer Bar - Only on Market Digest page */}
          {isDigestPage && (
            <footer className="fixed-bottom-bar">
              <div className="bottom-bar-left">
                <span>Disclaimer: Market data is delayed. Investment involves risk.</span>
              </div>
              <div className="bottom-bar-right">
                <a href="#terms" className="bottom-bar-link">Terms</a>
                <span className="bottom-bar-divider">•</span>
                <a href="#privacy" className="bottom-bar-link">Privacy</a>
              </div>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}
