'use client';

// ---------------------------------------------------------------------------
// OrderKar hand-rolled SVG charts — zero dependencies.
// All charts are theme-aware (CSS variables) and responsive via viewBox.
// ---------------------------------------------------------------------------

import { useId, useMemo } from 'react';

const AREA_PAD = { l: 8, r: 8, t: 12, b: 26 };

// ------------------------------------------------------- revenue area chart ---

export function AreaChart({
  points,
  labels,
  height = 180,
  formatY,
}: {
  points: number[];
  labels: string[];
  height?: number;
  formatY?: (v: number) => string;
}) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const W = 720;
  const H = height;
  
  const max = Math.max(1, ...points);
  const n = points.length;

  const path = useMemo(() => {
    if (n === 0) return '';
    const x = (i: number) => AREA_PAD.l + (i / Math.max(1, n - 1)) * (W - AREA_PAD.l - AREA_PAD.r);
    const y = (v: number) => AREA_PAD.t + (1 - v / max) * (H - AREA_PAD.t - AREA_PAD.b);
    let d = `M ${x(0).toFixed(1)} ${y(points[0]).toFixed(1)}`;
    for (let i = 1; i < n; i++) d += ` L ${x(i).toFixed(1)} ${y(points[i]).toFixed(1)}`;
    return { line: d, area: `${d} L ${x(n - 1).toFixed(1)} ${(H - AREA_PAD.b).toFixed(1)} L ${x(0).toFixed(1)} ${(H - AREA_PAD.b).toFixed(1)} Z`, x, y };
  }, [points, n, max, H, W]);

  if (n === 0 || !path) return null;
  const { x, y } = path as { x: (i: number) => number; y: (v: number) => number };
  const step = Math.max(1, Math.ceil(n / 8));
  const last = points[n - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Revenue trend">
      <defs>
        <linearGradient id={`ag-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#006EF5" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#006EF5" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={AREA_PAD.l}
          x2={W - AREA_PAD.r}
          y1={AREA_PAD.t + f * (H - AREA_PAD.t - AREA_PAD.b)}
          y2={AREA_PAD.t + f * (H - AREA_PAD.t - AREA_PAD.b)}
          className="chart-grid"
          strokeDasharray="3 4"
        />
      ))}
      <path d={(path as { area: string }).area} fill={`url(#ag-${gid})`} />
      <path d={(path as { line: string }).line} fill="none" stroke="#006EF5" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(n - 1)} cy={y(last)} r="4.5" fill="#006EF5" stroke="var(--c-surface)" strokeWidth="2" />
      {labels.map((l, i) =>
        i % step === 0 ? (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10.5" fill="var(--c-muted)" fontWeight="600">
            {l}
          </text>
        ) : null,
      )}
      {formatY && (
        <text x={W - AREA_PAD.r} y={y(last) - 10} textAnchor="end" fontSize="12" fill="var(--c-ink)" fontWeight="800">
          {formatY(last)}
        </text>
      )}
    </svg>
  );
}

// ------------------------------------------------- rush-hour heatmap (24h) ---

export function RushHeatmap({ hours }: { hours: number[] }) {
  const max = Math.max(1, ...hours);
  const labels = ['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p'];
  return (
    <div>
      <div className="grid grid-cols-12 gap-1 sm:grid-cols-[repeat(24,minmax(0,1fr))]">
        {hours.map((v, h) => {
          const t = v / max;
          return (
            <div
              key={h}
              title={`${h}:00 — ${v} orders`}
              className="flex aspect-square items-center justify-center rounded-[6px] text-[9px] font-bold transition-transform hover:scale-110"
              style={{
                backgroundColor: t === 0 ? 'var(--c-soft)' : `rgba(0, 110, 245, ${0.12 + t * 0.88})`,
                color: t > 0.55 ? '#fff' : 'var(--c-muted)',
                border: '1px solid var(--c-line)',
              }}
            >
              {v > 0 ? v : ''}
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[10.5px] font-semibold text-muted">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------- weekday bars ---

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeekdayBars({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  const best = values.indexOf(max);
  return (
    <div className="flex h-36 items-end gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[11px] font-bold text-body">{v}</span>
          <div
            className="w-full rounded-t-[8px] transition-all"
            style={{
              height: `${Math.max(6, (v / max) * 100)}%`,
              backgroundColor: i === best ? '#006EF5' : 'rgba(0,110,245,0.22)',
              border: i === best ? 'none' : '1px solid var(--c-line)',
            }}
            title={`${WD[i]}: ${v} orders`}
          />
          <span className={`text-[11px] font-bold ${i === best ? 'text-brand' : 'text-muted'}`}>{WD[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------- top items (h-bars) ---

export function TopBars({
  rows,
  formatValue,
}: {
  rows: { label: string; value: number; sub?: string }[];
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={r.label}>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="truncate text-[13px] font-semibold text-body">
              <span className="mr-1.5 font-display font-extrabold text-muted">{i + 1}</span>
              {r.label}
            </span>
            <span className="shrink-0 text-[13px] font-bold text-ink">
              {formatValue ? formatValue(r.value) : r.value}
              {r.sub && <span className="ml-1 font-medium text-muted">{r.sub}</span>}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-soft">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(r.value / max) * 100}%`,
                backgroundColor: i === 0 ? '#006EF5' : i < 3 ? '#4D94FF' : '#DE6A50',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------- donut ---

const DONUT_COLORS = ['#006EF5', '#4D94FF', '#DE6A50', '#F2A413', '#16A34A', '#8B5CF6', '#0EA5E9', '#64748B'];

export function Donut({
  slices,
  size = 168,
}: {
  slices: { label: string; value: number }[];
  size?: number;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const R = 62;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox="0 0 160 160" className="shrink-0">
        <circle cx="80" cy="80" r={R} fill="none" stroke="var(--c-soft)" strokeWidth="22" />
        {slices.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * C;
          const off = -acc * C;
          acc += frac;
          return (
            <circle
              key={s.label}
              cx="80"
              cy="80"
              r={R}
              fill="none"
              stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
              strokeWidth="22"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={off}
              transform="rotate(-90 80 80)"
              strokeLinecap="butt"
            >
              <title>
                {s.label}: {Math.round(frac * 100)}%
              </title>
            </circle>
          );
        })}
        <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--c-ink)" fontFamily="Manrope, sans-serif">
          {slices.length}
        </text>
        <text x="80" y="96" textAnchor="middle" fontSize="11" fill="var(--c-muted)" fontWeight="600">
          categories
        </text>
      </svg>
      <div className="min-w-0 flex-1 space-y-1.5">
        {slices.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 text-[12.5px]">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[4px]"
              style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            <span className="truncate font-medium text-body">{s.label}</span>
            <span className="ml-auto font-bold text-ink">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------- tiny sparkline ---

export function Sparkline({ points, w = 120, h = 36 }: { points: number[]; w?: number; h?: number }) {
  const max = Math.max(1, ...points);
  const min = Math.min(...points);
  const span = Math.max(1, max - min);
  const n = points.length;
  const d =
    n < 2
      ? ''
      : points
          .map((v, i) => `${((i / (n - 1)) * w).toFixed(1)},${(h - 4 - ((v - min) / span) * (h - 10)).toFixed(1)}`)
          .join(' L ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      {d && <polyline points={d} fill="none" stroke="#006EF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

