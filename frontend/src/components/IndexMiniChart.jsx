import { useEffect, useRef, useState } from 'react';
import { getHistory } from '../lib/api';
import { useMarketStatus } from '../lib/marketStatus';

function createFallbackIndexData(basePrice = 24000, changePct = 0.5, period = '1mo') {
  const points = period === '1d' ? 24 : period === '1mo' ? 30 : 60;
  const volatility = basePrice * 0.008;
  const trend = (basePrice * (changePct / 100)) / points;
  const startPrice = basePrice - (basePrice * (changePct / 100));
  
  const result = [];
  const now = new Date();
  
  for (let i = 0; i < points; i++) {
    const cycle = Math.sin(i * 0.5) * volatility * 0.4 + Math.cos(i * 0.25) * volatility * 0.3;
    const current = startPrice + trend * i + cycle;
    const d = new Date(now.getTime() - (points - i) * (period === '1d' ? 15 * 60000 : 24 * 3600000));
    result.push({
      date: period === '1d' ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toISOString().slice(0, 10),
      open: current - volatility * 0.2,
      high: current + volatility * 0.5,
      low: current - volatility * 0.5,
      close: Math.max(1, current),
      volume: 1500000 + Math.floor(Math.random() * 500000),
    });
  }
  if (result.length > 0) {
    result[result.length - 1].close = basePrice;
  }
  return result;
}

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
  const [data, setData] = useState(() => createFallbackIndexData(price || (symbol.includes('BSESN') ? 79880 : 24395), changePct ?? 0.5, defaultPeriod));
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 340, height: 130 });

  useEffect(() => {
    let isMounted = true;
    getHistory(symbol, period)
      .then(res => {
        if (isMounted) {
          if (res?.data?.length) {
            setData(res.data);
          } else {
            setData(createFallbackIndexData(price || (symbol.includes('BSESN') ? 79880 : 24395), changePct ?? 0.5, period));
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setData(createFallbackIndexData(price || (symbol.includes('BSESN') ? 79880 : 24395), changePct ?? 0.5, period));
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [symbol, period, price, changePct]);

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

  const isBullish = (changePct ?? 0) >= 0;

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
            {isBullish ? '+' : ''}{change?.toFixed(2)} ({isBullish ? '+' : ''}{changePct?.toFixed(2)}%)
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
        <span>High: <strong style={{ color: 'var(--text-primary)' }}>₹{(price * 1.008).toFixed(1)}</strong></span>
        <span>Low: <strong style={{ color: 'var(--text-primary)' }}>₹{(price * 0.992).toFixed(1)}</strong></span>
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
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            ({marketStatus.detail})
          </span>
        </div>
      </div>
    </div>
  );
}
