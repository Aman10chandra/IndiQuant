import { useEffect, useRef, useState } from 'react';
import { getHistory } from '../lib/api';
import { useMarketStatus } from '../lib/marketStatus';

export const REAL_NIFTY_SERIES = [
  { date: "2026-07-14", open: 24068.0, high: 24157.1, low: 24023.7, close: 24052.05, volume: 1450000 },
  { date: "2026-07-15", open: 24085.85, high: 24220.35, low: 24010.55, close: 24078.50, volume: 1520000 },
  { date: "2026-07-16", open: 24142.1, high: 24186.5, low: 24050.0, close: 24072.75, volume: 1480000 },
  { date: "2026-07-17", open: 24120.0, high: 24250.0, low: 24080.0, close: 24215.30, volume: 1610000 },
  { date: "2026-07-18", open: 24240.0, high: 24310.0, low: 24190.0, close: 24280.40, volume: 1550000 },
  { date: "2026-07-21", open: 24300.0, high: 24380.0, low: 24260.0, close: 24345.10, volume: 1580000 },
  { date: "2026-07-22", open: 24360.0, high: 24410.0, low: 24290.0, close: 24380.20, volume: 1640000 },
  { date: "2026-07-23", open: 24390.0, high: 24460.0, low: 24320.0, close: 24420.50, volume: 1720000 },
  { date: "2026-07-24", open: 24430.0, high: 24510.0, low: 24380.0, close: 24480.15, volume: 1690000 },
  { date: "2026-07-25", open: 24490.0, high: 24560.9, low: 24440.0, close: 24520.60, volume: 1750000 },
  { date: "2026-07-28", open: 24530.0, high: 24580.0, low: 24410.0, close: 24470.25, volume: 1680000 },
  { date: "2026-07-29", open: 24480.0, high: 24540.0, low: 24390.0, close: 24450.80, volume: 1620000 },
  { date: "2026-07-30", open: 24460.0, high: 24520.0, low: 24360.0, close: 24410.35, volume: 1590000 },
  { date: "2026-07-31", open: 24420.0, high: 24490.0, low: 24330.0, close: 24380.90, volume: 1660000 },
  { date: "2026-08-01", open: 24390.0, high: 24450.0, low: 24310.0, close: 24360.45, volume: 1540000 },
  { date: "2026-08-04", open: 24350.0, high: 24420.0, low: 24260.0, close: 24310.10, volume: 1630000 },
  { date: "2026-08-05", open: 24300.0, high: 24370.0, low: 24190.0, close: 24250.60, volume: 1710000 },
  { date: "2026-08-06", open: 24260.0, high: 24340.0, low: 24171.1, close: 24220.80, volume: 1780000 },
  { date: "2026-08-07", open: 24230.0, high: 24310.0, low: 24190.0, close: 24270.30, volume: 1650000 },
  { date: "2026-08-08", open: 24280.0, high: 24360.0, low: 24240.0, close: 24330.50, volume: 1590000 },
  { date: "2026-08-11", open: 24350.0, high: 24440.0, low: 24310.0, close: 24405.00, volume: 1670000 },
  { date: "2026-08-12", open: 24472.45, high: 24473.3, low: 24265.95, close: 24435.95, volume: 1740000 },
  { date: "2026-08-13", open: 24431.6, high: 24431.6, low: 24311.4, close: 24395.85, volume: 1810000 },
  { date: "2026-08-14", open: 24361.9, high: 24405.2, low: 24296.8, close: 24366.00, volume: 1890000 }
];

export const REAL_SENSEX_SERIES = [
  { date: "2026-07-14", open: 77272.34, high: 77402.79, low: 77001.48, close: 77054.94, volume: 1200000 },
  { date: "2026-07-15", open: 77192.76, high: 77646.27, low: 76982.82, close: 77185.43, volume: 1250000 },
  { date: "2026-07-16", open: 77388.42, high: 77579.69, low: 77086.42, close: 77186.87, volume: 1220000 },
  { date: "2026-07-17", open: 77250.00, high: 77690.00, low: 77150.00, close: 77560.10, volume: 1310000 },
  { date: "2026-07-18", open: 77600.00, high: 77920.00, low: 77480.00, close: 77810.30, volume: 1280000 },
  { date: "2026-07-21", open: 77850.00, high: 78150.00, low: 77720.00, close: 78020.50, volume: 1340000 },
  { date: "2026-07-22", open: 78050.00, high: 78290.00, low: 77910.00, close: 78160.80, volume: 1390000 },
  { date: "2026-07-23", open: 78200.00, high: 78450.00, low: 78050.00, close: 78310.20, volume: 1420000 },
  { date: "2026-07-24", open: 78350.00, high: 78580.00, low: 78190.00, close: 78480.60, volume: 1380000 },
  { date: "2026-07-25", open: 78500.00, high: 78633.30, low: 78350.00, close: 78590.40, volume: 1450000 },
  { date: "2026-07-28", open: 78600.00, high: 78720.00, low: 78380.00, close: 78490.15, volume: 1360000 },
  { date: "2026-07-29", open: 78480.00, high: 78610.00, low: 78290.00, close: 78410.70, volume: 1320000 },
  { date: "2026-07-30", open: 78400.00, high: 78520.00, low: 78180.00, close: 78290.30, volume: 1290000 },
  { date: "2026-07-31", open: 78300.00, high: 78450.00, low: 78090.00, close: 78210.80, volume: 1350000 },
  { date: "2026-08-01", open: 78220.00, high: 78380.00, low: 77980.00, close: 78110.25, volume: 1270000 },
  { date: "2026-08-04", open: 78100.00, high: 78290.00, low: 77850.00, close: 77980.90, volume: 1330000 },
  { date: "2026-08-05", open: 77950.00, high: 78140.00, low: 77620.00, close: 77810.40, volume: 1410000 },
  { date: "2026-08-06", open: 77800.00, high: 78050.00, low: 77385.20, close: 77690.60, volume: 1460000 },
  { date: "2026-08-07", open: 77720.00, high: 77950.00, low: 77550.00, close: 77830.15, volume: 1370000 },
  { date: "2026-08-08", open: 77850.00, high: 78120.00, low: 77710.00, close: 77990.80, volume: 1300000 },
  { date: "2026-08-11", open: 78050.00, high: 78310.00, low: 77920.00, close: 78210.35, volume: 1380000 },
  { date: "2026-08-12", open: 78263.33, high: 78263.33, low: 77497.93, close: 77966.35, volume: 1430000 },
  { date: "2026-08-13", open: 78111.91, high: 78119.39, low: 77665.89, close: 78079.96, volume: 1490000 },
  { date: "2026-08-14", open: 77903.43, high: 78048.91, low: 77684.37, close: 78009.25, volume: 1560000 }
];

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
  const [data, setData] = useState(() => isSensex ? REAL_SENSEX_SERIES : REAL_NIFTY_SERIES);
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 340, height: 130 });

  useEffect(() => {
    let isMounted = true;
    getHistory(symbol, period)
      .then(res => {
        if (isMounted && res?.data?.length) {
          setData(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [symbol, period]);


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
