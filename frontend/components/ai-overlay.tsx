"use client";

import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

export function AiOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-brand-500/20 bg-brand-500/10 p-4"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white/10 p-2 text-brand-100">
          <Bot size={18} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">AI overlay</p>
          <p className="text-sm text-slate-300">A guided wizard is being prepared for this flow.</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm text-brand-100">
        <Sparkles size={16} />
        <span>Live adaptation is active</span>
      </div>
    </motion.div>
  );
}
