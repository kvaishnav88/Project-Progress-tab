"use client";

import { motion } from 'framer-motion';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Connection badge — live WebSocket status indicator                  */
/* ------------------------------------------------------------------ */

type ConnectionBadgeProps = {
  status: 'connected' | 'connecting' | 'disconnected';
};

const statusConfig = {
  connected: {
    label: 'Live telemetry connected',
    icon: Wifi,
    dotClass: 'bg-emerald-400 pulse-dot pulse-dot-green',
    textClass: 'text-emerald-300',
    bgClass: 'border-emerald-500/20 bg-emerald-500/10',
  },
  connecting: {
    label: 'Connecting to telemetry...',
    icon: Loader2,
    dotClass: 'bg-amber-400 pulse-dot pulse-dot-amber',
    textClass: 'text-amber-300',
    bgClass: 'border-amber-500/20 bg-amber-500/10',
  },
  disconnected: {
    label: 'Telemetry disconnected',
    icon: WifiOff,
    dotClass: 'bg-red-400',
    textClass: 'text-red-300',
    bgClass: 'border-red-500/20 bg-red-500/10',
  },
};

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2.5 rounded-2xl border ${config.bgClass} px-4 py-2.5 text-sm`}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2.5 w-2.5">
        <span className={`absolute inline-flex h-full w-full rounded-full ${config.dotClass}`} />
      </span>

      <Icon
        size={14}
        className={`${config.textClass} ${status === 'connecting' ? 'animate-spin' : ''}`}
      />

      <span className={config.textClass}>{config.label}</span>
    </motion.div>
  );
}
