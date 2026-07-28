"use client";

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FrictionChartProps = {
  data: number[];
  label?: string;
  height?: number;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FrictionChart({
  data,
  label = 'Friction trend',
  height = 160,
}: FrictionChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { path, areaPath, points, maxVal, minVal } = useMemo(() => {
    if (data.length === 0) {
      return { path: '', areaPath: '', points: [], maxVal: 100, minVal: 0 };
    }

    const padding = 24;
    const width = 500;
    const h = height;
    const max = Math.max(...data, 50);
    const min = Math.min(...data, 0);
    const range = max - min || 1;

    const pts = data.map((val, i) => ({
      x: padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2),
      y: padding + (1 - (val - min) / range) * (h - padding * 2),
      value: val,
    }));

    // Smooth curve using cubic bezier
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    // Area fill path
    const last = pts[pts.length - 1];
    const first = pts[0];
    const area = `${d} L ${last.x} ${h - padding} L ${first.x} ${h - padding} Z`;

    return { path: d, areaPath: area, points: pts, maxVal: max, minVal: min };
  }, [data, height]);

  return (
    <motion.div variants={fadeInUp} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-full bg-brand-500/10 px-3 py-1 text-sm text-brand-100"
          >
            {points[hoveredIndex]?.value}%
          </motion.div>
        )}
      </div>

      <svg
        viewBox={`0 0 500 ${height}`}
        className="w-full"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <linearGradient id="friction-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(91, 124, 255, 0.3)" />
            <stop offset="100%" stopColor="rgba(91, 124, 255, 0)" />
          </linearGradient>
          <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5b7cff" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((pct) => (
          <line
            key={pct}
            x1="24"
            y1={24 + pct * (height - 48)}
            x2="476"
            y2={24 + pct * (height - 48)}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
        ))}

        {/* Area fill */}
        {areaPath && (
          <motion.path
            d={areaPath}
            fill="url(#friction-gradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        )}

        {/* Line */}
        {path && (
          <motion.path
            d={path}
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        )}

        {/* Interactive points */}
        {points.map((pt, i) => (
          <g key={i} onMouseEnter={() => setHoveredIndex(i)}>
            {/* Invisible larger hit area */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={16}
              fill="transparent"
            />
            {/* Visible dot */}
            <motion.circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIndex === i ? 5 : 3}
              fill={hoveredIndex === i ? '#a78bfa' : '#5b7cff'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + i * 0.05 }}
            />
            {/* Tooltip */}
            {hoveredIndex === i && (
              <g>
                <line
                  x1={pt.x}
                  y1={pt.y + 6}
                  x2={pt.x}
                  y2={height - 24}
                  stroke="rgba(167, 139, 250, 0.3)"
                  strokeDasharray="3 3"
                />
              </g>
            )}
          </g>
        ))}
      </svg>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Min: {Math.round(minVal)}%</span>
        <span>{data.length} data points</span>
        <span>Max: {Math.round(maxVal)}%</span>
      </div>
    </motion.div>
  );
}
