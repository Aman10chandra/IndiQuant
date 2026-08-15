import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { getQuote } from '../lib/api';

const ALL_STOCKS = [
  { ticker: 'TCS', name: 'Tata Consultancy Services Ltd.', sector: 'Technology', sectorCode: 'TECH', price: 2361.00, change_pct: -0.59, pe: 31.4, mcap: '₹15.1L Cr' },
  { ticker: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy', sectorCode: 'ENERGY', price: 1310.00, change_pct: -0.53, pe: 24.5, mcap: '₹17.7L Cr' },
  { ticker: 'INFY', name: 'Infosys Limited', sector: 'Technology', sectorCode: 'TECH', price: 1169.20, change_pct: -0.49, pe: 28.2, mcap: '₹7.6L Cr' },
  { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Financials', sectorCode: 'FINANCE', price: 1640.10, change_pct: 0.50, pe: 19.8, mcap: '₹12.5L Cr' },
  { ticker: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Financials', sectorCode: 'FINANCE', price: 1195.40, change_pct: 0.79, pe: 17.8, mcap: '₹8.4L Cr' },
  { ticker: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'Financials', sectorCode: 'FINANCE', price: 6850.00, change_pct: 0.74, pe: 34.2, mcap: '₹4.2L Cr' },
  { ticker: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Automotive', sectorCode: 'AUTO', price: 985.00, change_pct: 0.72, pe: 16.5, mcap: '₹3.3L Cr' },
  { ticker: 'SBIN', name: 'State Bank of India', sector: 'Financials', sectorCode: 'FINANCE', price: 845.30, change_pct: 0.63, pe: 10.4, mcap: '₹7.5L Cr' },
  { ticker: 'WIPRO', name: 'Wipro Limited', sector: 'Technology', sectorCode: 'TECH', price: 520.40, change_pct: 0.46, pe: 22.4, mcap: '₹2.7L Cr' },
  { ticker: 'HCLTECH', name: 'HCL Technologies Ltd.', sector: 'Technology', sectorCode: 'TECH', price: 1640.80, change_pct: 1.41, pe: 25.2, mcap: '₹4.4L Cr' },
  { ticker: 'ONGC', name: 'Oil & Natural Gas Corporation', sector: 'Energy', sectorCode: 'ENERGY', price: 236.40, change_pct: -1.46, pe: 7.8, mcap: '₹3.0L Cr' },
  { ticker: 'POWERGRID', name: 'Power Grid Corporation of India', sector: 'Energy', sectorCode: 'ENERGY', price: 342.10, change_pct: 0.77, pe: 18.2, mcap: '₹3.1L Cr' },
  { ticker: 'M&M', name: 'Mahindra & Mahindra Ltd.', sector: 'Automotive', sectorCode: 'AUTO', price: 2740.00, change_pct: 1.86, pe: 28.4, mcap: '₹3.4L Cr' },
  { ticker: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Automotive', sectorCode: 'AUTO', price: 12350.00, change_pct: 1.06, pe: 28.4, mcap: '₹3.9L Cr' },
  { ticker: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'FMCG', sectorCode: 'FMCG', price: 2740.00, change_pct: 0.37, pe: 58.4, mcap: '₹6.4L Cr' },
  { ticker: 'ITC', name: 'ITC Limited', sector: 'FMCG', sectorCode: 'FMCG', price: 492.50, change_pct: 0.51, pe: 28.6, mcap: '₹6.1L Cr' },
  { ticker: 'LT', name: 'Larsen & Toubro Ltd.', sector: 'Infrastructure', sectorCode: 'INFRA', price: 3620.00, change_pct: 0.61, pe: 32.1, mcap: '₹5.0L Cr' },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Telecom', sectorCode: 'TELECOM', price: 1480.20, change_pct: 1.25, pe: 42.0, mcap: '₹8.3L Cr' },
];

const MAIN_SECTORS = ['All Sectors', 'Technology', 'Financials', 'Energy'];
const MORE_SECTORS = ['Automotive', 'FMCG', 'Telecom', 'Infrastructure'];

export default function StocksList() {
  const navigate = useNavigate();
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [stocks, setStocks] = useState(ALL_STOCKS);

  useEffect(() => {
    // Attempt live quote updates for Indian NSE/BSE stocks
    stocks.slice(0, 6).forEach(async (s) => {
      try {
        const q = await getQuote(s.ticker);
        if (q && q.price) {
          setStocks(prev => prev.map(item => item.ticker === s.ticker ? { ...item, price: q.price, change_pct: q.change_pct } : item));
        }
      } catch { /* retain defaults */ }
    });
  }, []);

  const filteredStocks = stocks.filter(s => {
    if (selectedSector === 'All Sectors') return true;
    return s.sector === selectedSector;
  });

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>

        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Market Directory
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
            Real-time Indian NSE and BSE equity performance tracking across sectors. Select a sector to refine the view.
          </p>
        </div>

        {/* Sector Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {MAIN_SECTORS.map(sec => {
            const isActive = selectedSector === sec;
            return (
              <button
                key={sec}
                onClick={() => {
                  setSelectedSector(sec);
                  setShowMoreDropdown(false);
                }}
                style={{
                  padding: '7px 18px',
                  borderRadius: 24,
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  border: isActive ? 'none' : '1px solid var(--border-subtle)',
                  background: isActive ? '#8EB69B' : 'var(--bg-card)',
                  color: isActive ? '#0A0E0C' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 10px rgba(142, 182, 155, 0.25)' : 'none',
                }}
              >
                {sec}
              </button>
            );
          })}

          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 4px' }} />

          {/* More Sectors Dropdown / Pills */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMoreDropdown(prev => !prev)}
              style={{
                padding: '7px 16px',
                borderRadius: 24,
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                border: MORE_SECTORS.includes(selectedSector) ? '1px solid #8EB69B' : '1px solid var(--border-subtle)',
                background: MORE_SECTORS.includes(selectedSector) ? 'var(--bg-muted)' : 'transparent',
                color: MORE_SECTORS.includes(selectedSector) ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <span>{MORE_SECTORS.includes(selectedSector) ? selectedSector : 'More Sectors'}</span>
              <span style={{ fontSize: 10 }}>▾</span>
            </button>

            {showMoreDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 6,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 50,
                  minWidth: 160,
                  padding: '6px 0',
                }}
              >
                {MORE_SECTORS.map(sec => (
                  <div
                    key={sec}
                    onClick={() => {
                      setSelectedSector(sec);
                      setShowMoreDropdown(false);
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: selectedSector === sec ? '#8EB69B' : 'var(--text-primary)',
                      background: selectedSector === sec ? 'var(--bg-muted)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      if (selectedSector !== sec) e.currentTarget.style.background = 'var(--bg-muted)';
                    }}
                    onMouseLeave={e => {
                      if (selectedSector !== sec) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {sec}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3-Column Stock Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          {filteredStocks.map(stock => {
            const isUp = (stock.change_pct ?? 0) > 0;
            const isZero = (stock.change_pct ?? 0) === 0;

            return (
              <div
                key={stock.ticker}
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
                onClick={() => navigate(`/stock/${stock.ticker}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  {/* Top Row: Symbol, Name, Sector Tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{
                        fontSize: 22,
                        fontWeight: 800,
                        fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.3px',
                      }}>
                        {stock.ticker}
                      </div>
                      <div style={{
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        marginTop: 3,
                        fontWeight: 500,
                      }}>
                        {stock.name}
                      </div>
                    </div>

                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: 'var(--text-secondary)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      paddingTop: 4,
                    }}>
                      {stock.sectorCode || 'EQUITY'}
                    </span>
                  </div>

                  {/* Price & Change Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 18,
                    marginBottom: 16,
                  }}>
                    <div style={{
                      fontSize: 24,
                      fontWeight: 800,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.5px',
                    }}>
                      {stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 9px',
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
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                        {isZero ? (
                          <line x1="5" y1="12" x2="19" y2="12" />
                        ) : isUp ? (
                          <>
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                            <polyline points="17 6 23 6 23 12" />
                          </>
                        ) : (
                          <>
                            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                            <polyline points="17 18 23 18 23 12" />
                          </>
                        )}
                      </svg>
                      <span>{isUp ? '+' : ''}{stock.change_pct.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div style={{
                    height: 1,
                    background: 'var(--border-subtle)',
                    marginBottom: 12,
                    opacity: 0.8,
                  }} />

                  {/* Metrics Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: 'var(--text-secondary)',
                  }}>
                    <span>
                      P/E <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{stock.pe}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      MKT CAP <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{stock.mcap}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </AppShell>
  );
}
