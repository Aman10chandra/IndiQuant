import { useEffect, useRef, useState } from 'react';
import {
  getHistory,
  REAL_NIFTY_SERIES,
  REAL_SENSEX_SERIES,
  REAL_NIFTY_1Y_SERIES,
  REAL_SENSEX_1Y_SERIES
} from '../lib/api';
import { useMarketStatus } from '../lib/marketStatus';

export { REAL_NIFTY_SERIES, REAL_SENSEX_SERIES, REAL_NIFTY_1Y_SERIES, REAL_SENSEX_1Y_SERIES };

export default function IndexMiniChart({
  symbol,
  name,
  exchange,
  price,
  change,
  changePct,
  defaultPeriod = '1mo'
}) {
  const marketStatus = useMarketStatus();
  const [period, setPeriod] = useState(defaultPeriod);
  const isSensex = symbol.includes('BSESN') || symbol.includes('SENSEX');
  const [data, setData] = useState(() => {
    if (defaultPeriod === '1y') {
      return isSensex ? REAL_SENSEX_1Y_SERIES : REAL_NIFTY_1Y_SERIES;
    }
    return isSensex ? REAL_SENSEX_SERIES : REAL_NIFTY_SERIES;
  });
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 340, height: 130 });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Immediately set appropriate baseline series
    if (period === '1y') {
      setData(isSensex ? REAL_SENSEX_1Y_SERIES : REAL_NIFTY_1Y_SERIES);
    } else if (period === '1mo') {
      setData(isSensex ? REAL_SENSEX_SERIES : REAL_NIFTY_SERIES);
    }

    getHistory(symbol, period)
      .then(res => {
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length >= 5) {
          const sampleClose = res.data[res.data.length - 1]?.close || 0;
          // Validate that the returned candles match real index scale (>15k for NIFTY, >50k for SENSEX)
          const isValidIndexScale = isSensex ? (sampleClose > 50000 && sampleClose < 120000) : (sampleClose > 15000 && sampleClose < 40000);
          if (isValidIndexScale) {
            setData(res.data);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [symbol, period, isSensex]);


  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: 130 });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height: h } = dimensions;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const padding = { top: 12, right: 12, bottom: 20, left: 12 };
    const plotW = Math.max(10, width - padding.left - padding.right);
    const plotH = Math.max(10, h - padding.top - padding.bottom);

    const closes = data.map(d => d.close);
    const minPrice = Math.min(...closes) * 0.998;
    const maxPrice = Math.max(...closes) * 1.002;
    const range = maxPrice - minPrice || 1;

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const isUp = closes[closes.length - 1] >= closes[0];
    const lineColor = isUp ? '#10b981' : '#ef4444';
    const gradientColor = isUp
      ? (isDarkMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)')
      : (isDarkMode ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.12)');

    const xScale = (i) => padding.left + (i / (data.length - 1)) * plotW;
    const yScale = (val) => padding.top + ((maxPrice - val) / range) * plotH;

    ctx.clearRect(0, 0, width, h);

    // Subtle background grid
    ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = padding.top + (i / 4) * plotH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotW, y);
      ctx.stroke();
    }

    // Gradient Fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + plotH);
    gradient.addColorStop(0, gradientColor);
    gradient.addColorStop(1, isDarkMode ? 'rgba(16, 18, 26, 0)' : 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    data.forEach((d, i) => {
      const x = xScale(i);
      const y = yScale(d.close);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + plotW, padding.top + plotH);
    ctx.lineTo(padding.left, padding.top + plotH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line Path
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    data.forEach((d, i) => {
      const x = xScale(i);
      const y = yScale(d.close);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Pulse dot at the end
    const lastX = xScale(data.length - 1);
    const lastY = yScale(data[data.length - 1].close);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();

  }, [data, dimensions]);

  const handleMouseMove = (e) => {
    if (!canvasRef.current || !data.length) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const padding = { left: 12, right: 12 };
    const plotW = dimensions.width - padding.left - padding.right;
    const idx = Math.round(((mouseX - padding.left) / plotW) * (data.length - 1));
    const clampedIdx = Math.max(0, Math.min(data.length - 1, idx));
    setTooltip({ x: mouseX, y: e.clientY - rect.top, point: data[clampedIdx] });
  };

  const firstClose = data.length ? data[0].close : (price || 1);
  const lastClose = data.length ? data[data.length - 1].close : (price || 1);
  const periodChange = lastClose - firstClose;
  const periodChangePct = firstClose ? (periodChange / firstClose) * 100 : 0;

  const displayChange = period === '1d' ? (change ?? 0) : periodChange;
  const displayChangePct = period === '1d' ? (changePct ?? 0) : periodChangePct;
  const isBullish = displayChangePct >= 0;

  const allHighs = data.map(d => d.high || d.close);
  const allLows = data.map(d => d.low || d.close);
  const periodHigh = allHighs.length ? Math.max(...allHighs) : (price * 1.01);
  const periodLow = allLows.length ? Math.min(...allLows) : (price * 0.99);

  return (
    <div
      className="card"
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        borderRadius: 24,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{name}</span>
            <span className={`badge ${exchange === 'NSE' ? 'badge-cyan' : 'badge-purple'}`} style={{ fontSize: 10 }}>
              {exchange}
            </span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', marginTop: 4, color: 'var(--text-primary)' }}>
            ₹{price?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) ?? '—'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div className={`price-change ${isBullish ? 'positive' : 'negative'}`} style={{ fontSize: 12 }}>
            {isBullish ? '+' : ''}{displayChange.toFixed(2)} ({isBullish ? '+' : ''}{displayChangePct.toFixed(2)}%)
          </div>

          {/* Timeframe pill selector */}
          <div className="period-selector" style={{ padding: 2, background: 'var(--bg-muted)' }}>
            {['1d', '1mo', '1y'].map(p => (
              <button
                key={p}
                className={`period-btn ${period === p ? 'active' : ''}`}
                style={{ padding: '2px 8px', fontSize: 10 }}
                onClick={() => setPeriod(p)}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: 130, marginTop: 4 }}>
        {loading && !data.length ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setTooltip(null)}
              style={{ display: 'block', cursor: 'crosshair' }}
            />
            {tooltip && tooltip.point && (
              <div style={{
                position: 'absolute',
                left: Math.min(tooltip.x + 8, dimensions.width - 130),
                top: Math.max(tooltip.y - 45, 0),
                background: 'var(--bg-dark)',
                color: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 10,
              }}>
                <div style={{ fontSize: 9, opacity: 0.7, color: '#cbd5e1' }}>{tooltip.point.date}</div>
                <div style={{ fontWeight: 700 }}>₹{tooltip.point.close?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTop: '1px solid var(--border-subtle)',
        fontSize: 11,
        color: 'var(--text-secondary)',
      }}>
        <span>High ({period.toUpperCase()}): <strong style={{ color: 'var(--text-primary)' }}>₹{periodHigh.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</strong></span>
        <span>Low ({period.toUpperCase()}): <strong style={{ color: 'var(--text-primary)' }}>₹{periodLow.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</strong></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: marketStatus.badgeType === 'open' ? 'var(--green)' : marketStatus.badgeType === 'pre-open' ? 'var(--amber)' : 'var(--text-muted)',
              boxShadow: marketStatus.badgeType === 'open' ? '0 0 6px rgba(16, 185, 129, 0.6)' : 'none',
              display: 'inline-block',
            }}
          />
          <span style={{
            fontWeight: 700,
            color: marketStatus.badgeType === 'open' ? 'var(--green-text)' : marketStatus.badgeType === 'pre-open' ? 'var(--amber-text)' : 'var(--text-secondary)'
          }}>
            {marketStatus.status}
          </span>
        </div>
      </div>
    </div>
  );
}
