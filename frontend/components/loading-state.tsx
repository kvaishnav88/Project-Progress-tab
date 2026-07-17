"use client";

import { motion } from 'framer-motion';

export function LoadingState() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="inline-block h-4 w-4 rounded-full border-2 border-brand-500 border-t-transparent"
      />
      Preparing adaptive interface...
    </div>
  );
}
