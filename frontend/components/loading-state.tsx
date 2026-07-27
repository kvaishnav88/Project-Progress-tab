"use client";

import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Loading state — skeleton shimmer with animated spinner             */
/* ------------------------------------------------------------------ */

export function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-slate-900/70 px-8 py-8">
      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent"
      />

      <p className="text-sm text-slate-300">Preparing adaptive interface...</p>

      {/* Skeleton rows */}
      <div className="mt-2 w-full max-w-xs space-y-3">
        <div className="skeleton-shimmer h-3 w-full rounded-lg" />
        <div className="skeleton-shimmer h-3 w-3/4 rounded-lg" />
        <div className="skeleton-shimmer h-3 w-5/6 rounded-lg" />
      </div>
    </div>
  );
}
