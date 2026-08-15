import { useState } from 'react';
import { explainMetric } from '../lib/api';

function formatValue(value, format = 'number', suffix = '') {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string') return value;
  switch (format) {
    case 'pct': return `${(value * 100).toFixed(1)}%`;
    case 'cr': return `₹${(value / 1e7).toFixed(0)} Cr`;
    case 'number': return value.toFixed(2) + suffix;
    default: return String(value) + suffix;
  }
}

export default function MetricCard({ label, value, suffix, sector, format, highlight }) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClick = async () => {
    if (value === null || value === undefined) return;
    setOpen(true);
    if (explanation) return;
    setLoading(true);
    try {
      const numVal = typeof value === 'number' ? value : parseFloat(String(value));
      const data = await explainMetric(label, numVal, sector);
      setExplanation(data.explanation);
    } catch {
      setExplanation('Could not load explanation. Please check your API configuration.');
    }
    setLoading(false);
  };

  const colorClass = highlight === 'positive' ? 'text-green' : highlight === 'negative' ? 'text-red' : '';

  return (
    <>
      <div className="metric-chip" onClick={handleClick} title="Click to explain this metric">
        <div className="metric-chip-label">{label}</div>
        <div className={`metric-chip-value ${colorClass}`}>
          {formatValue(value, format, suffix)}
        </div>
        <div className="text-xs text-muted" style={{ marginTop: 4 }}>click to explain</div>
      </div>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, backdropFilter: 'blur(4px)',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            className="card animate-fade-in"
            style={{ maxWidth: 520, width: '90%', padding: 24 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div className="card-title">{label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', marginTop: 4 }}>
                  {formatValue(value, format, suffix)}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} style={{ padding: '6px 8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="spinner" />
                <span className="text-muted text-sm">Generating explanation…</span>
              </div>
            ) : (
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                {explanation}
              </p>
            )}
            <div className="disclaimer" style={{ marginTop: 16 }}>
              Notice: For educational purposes only. Not investment advice.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
