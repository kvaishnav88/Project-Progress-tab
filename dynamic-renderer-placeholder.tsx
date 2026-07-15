"use client";

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function DynamicRendererPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-dashed border-brand-500/30 bg-brand-500/10 p-6"
    >
      <div className="flex items-center gap-3 text-brand-100">
        <Sparkles size={18} />
        <span className="text-sm font-medium">Dynamic renderer placeholder</span>
      </div>
      <p className="mt-3 text-sm text-slate-300">
        This shell is ready to host AI-generated UI components as soon as the backend stream is connected.
      </p>
    </motion.div>
  );
}
