"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  AI overlay — slide-in panel with glow pulse                        */
/* ------------------------------------------------------------------ */

export function AiOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative overflow-hidden rounded-3xl border border-brand-500/20 bg-brand-500/10 p-4"
        >
          {/* Subtle glow pulse */}
          <motion.div
            className="pointer-events-none absolute -inset-1 rounded-3xl"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(91, 124, 255, 0)',
                '0 0 20px 4px rgba(91, 124, 255, 0.15)',
                '0 0 0 0 rgba(91, 124, 255, 0)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-2 text-brand-100">
              <Bot size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">AI overlay</p>
              <p className="text-sm text-slate-300">
                A guided wizard is being prepared for this flow.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative mt-3 flex items-center gap-2 text-sm text-brand-100"
          >
            <Sparkles size={16} />
            <span>Live adaptation is active</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
