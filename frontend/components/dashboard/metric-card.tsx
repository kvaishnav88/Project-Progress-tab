"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { fadeInUp } from '@/lib/animations';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type MetricCardProps = {
  title: string;
  value: number;
  suffix?: string;
  detail: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'good' | 'warning' | 'critical';
  icon?: React.ReactNode;
};

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */

function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const startVal = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startVal + (target - startVal) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

/* ------------------------------------------------------------------ */
/*  Status colors                                                      */
/* ------------------------------------------------------------------ */

const statusGradients: Record<string, string> = {
  good: 'from-emerald-500/5 to-transparent',
  warning: 'from-amber-500/5 to-transparent',
  critical: 'from-red-500/5 to-transparent',
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColors = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  neutral: 'text-slate-400',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MetricCard({
  title,
  value,
  suffix = '',
  detail,
  trend = 'neutral',
  status = 'good',
  icon,
}: MetricCardProps) {
  const animatedValue = useAnimatedCounter(value);
  const TrendIcon = trendIcons[trend];
  const gradient = statusGradients[status] || statusGradients.good;

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${gradient} bg-slate-950/70 p-5 transition-colors hover:border-white/20`}
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">{title}</p>
          {icon && (
            <div className="rounded-xl bg-brand-600/20 p-1.5 text-brand-100">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-end gap-2">
          <p className="text-3xl font-semibold tabular-nums text-white">
            {animatedValue}
            {suffix}
          </p>
          <div className={`mb-1 flex items-center gap-1 ${trendColors[trend]}`}>
            <TrendIcon size={14} />
          </div>
        </div>

        <p className="mt-2 text-sm text-slate-500">{detail}</p>
      </div>
    </motion.div>
  );
}
