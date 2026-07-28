"use client";

import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Skeleton card — animated placeholder for dashboard cards           */
/* ------------------------------------------------------------------ */

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-3xl border border-white/10 bg-slate-950/70 p-5 ${className}`}
    >
      <div className="skeleton-shimmer mb-3 h-4 w-24 rounded-lg" />
      <div className="skeleton-shimmer mb-2 h-8 w-20 rounded-lg" />
      <div className="skeleton-shimmer h-3 w-36 rounded-lg" />
    </motion.div>
  );
}

/** Wide skeleton for the chart area */
export function SkeletonChart({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-3xl border border-white/10 bg-slate-950/70 p-6 ${className}`}
    >
      <div className="skeleton-shimmer mb-4 h-4 w-32 rounded-lg" />
      <div className="skeleton-shimmer mb-3 h-40 w-full rounded-2xl" />
      <div className="flex gap-4">
        <div className="skeleton-shimmer h-3 w-20 rounded-lg" />
        <div className="skeleton-shimmer h-3 w-16 rounded-lg" />
        <div className="skeleton-shimmer h-3 w-24 rounded-lg" />
      </div>
    </motion.div>
  );
}

/** Small inline skeleton for individual lines */
export function SkeletonLine({ width = 'w-full' }: { width?: string }) {
  return <div className={`skeleton-shimmer h-3 ${width} rounded-lg`} />;
}
