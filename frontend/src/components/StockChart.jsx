import { useEffect, useRef, useState } from 'react';

export default function StockChart({ data = [], ticker, height = 320 }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });

  const chartData = data?.length ? data : Array.from({ length: 30 }, (_, i) => {
    const base = 500;
    const val = base + Math.sin(i * 0.4) * 15 + i * 0.8;
    return {
      date: `2026-08-${i + 1}`,
      open: val - 2,
      high: val + 5,
      low: val - 4,
      close: val,
      volume: 1000000,
    };
  });

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [height]);

  useEffect(() => {
    if (!canvasRef.current || !chartData.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height: h } = dimensions;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 16, bottom: 40, left: 60 };
    const plotW = width - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    const closes = chartData.map(d => d.close);
    const highs = chartData.map(d => d.high);
    const lows = chartData.map(d => d.low);
    const minPrice = Math.min(...lows) * 0.998;
    const maxPrice = Math.max(...highs) * 1.002;

    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const isUp = closes[closes.length - 1] >= closes[0];
    const mainColor = isUp ? (isDarkMode ? '#8EB69B' : '#163832') : (isDarkMode ? '#f87171' : '#c24141');
    const glowColor = isUp
      ? (isDarkMode ? 'rgba(142, 182, 155, 0.25)' : 'rgba(22, 56, 50, 0.12)')
      : (isDarkMode ? 'rgba(248, 113, 113, 0.25)' : 'rgba(194, 65, 65, 0.12)');

    const xScale = (i) => padding.left + (i / (chartData.length - 1)) * plotW;
    const yScale = (price) => padding.top + ((maxPrice - price) / (maxPrice - minPrice)) * plotH;

    ctx.clearRect(0, 0, width, h);

    // Grid lines
    ctx.strokeStyle = isDarkMode ? 'rgba(142, 182, 155, 0.12)' : 'rgba(35, 83, 71, 0.08)';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * plotH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotW, y);
      ctx.stroke();

      const price = maxPrice - (i / gridLines) * (maxPrice - minPrice);
      ctx.fillStyle = isDarkMode ? '#8EB69B' : '#5E8570';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`₹${price.toFixed(0)}`, padding.left - 6, y + 4);
    }

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + plotH);
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    chartData.forEach((d, i) => {
      const x = xScale(i);
      const y = yScale(d.close);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    const lastX = xScale(chartData.length - 1);
    const baseY = padding.top + plotH;
    ctx.lineTo(lastX, baseY);
    ctx.lineTo(padding.left, baseY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Price line
    ctx.beginPath();
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    chartData.forEach((d, i) => {
      const x = xScale(i);
      const y = yScale(d.close);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Last price dot
    const lastClose = closes[closes.length - 1];
    const lastY = yScale(lastClose);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = mainColor;
    ctx.fill();

    // Date labels
    const labelCount = Math.min(6, chartData.length);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < labelCount; i++) {
      const idx = Math.floor((i / (labelCount - 1)) * (chartData.length - 1));
      const x = xScale(idx);
      const label = chartData[idx].date.substring(0, 10);
      ctx.fillText(label, x, h - 8);
    }

  }, [chartData, dimensions, height]);

  const handleMouseMove = (e) => {
    if (!canvasRef.current || !chartData.length) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const padding = { left: 60, right: 16 };
    const plotW = dimensions.width - padding.left - padding.right;
    const idx = Math.round(((mouseX - padding.left) / plotW) * (chartData.length - 1));
    const clampedIdx = Math.max(0, Math.min(chartData.length - 1, idx));
    setTooltip({ x: mouseX, y: e.clientY - rect.top, point: chartData[clampedIdx] });
  };

  const isUp = chartData[chartData.length - 1].close >= chartData[0].close;



  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        style={{ display: 'block', cursor: 'crosshair' }}
      />
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: Math.min(tooltip.x + 12, dimensions.width - 160),
          top: Math.max(tooltip.y - 60, 8),
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '10px 14px',
          fontSize: 12,
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
            {tooltip.point.date.substring(0, 10)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
            {['open','high','low','close'].map(k => (
              <div key={k} style={{ display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k}</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: k === 'close' ? (isUp ? 'var(--green-light)' : 'var(--red-light)') : 'var(--text-primary)' }}>
                  ₹{tooltip.point[k]?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
