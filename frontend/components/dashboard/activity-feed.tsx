"use client";

import { useRef, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, AlertTriangle, Brain, Info, MousePointer, Zap } from 'lucide-react';
import type { TelemetryEvent } from '@/context/telemetry-context';
import { fadeInUp } from '@/lib/animations';

/* ------------------------------------------------------------------ */
/*  Event type styling                                                 */
/* ------------------------------------------------------------------ */

const eventStyles: Record<
  TelemetryEvent['type'],
  { icon: typeof Activity; color: string; bg: string }
> = {
  friction: {
    icon: Brain,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  rage_click: {
    icon: MousePointer,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  hesitation: {
    icon: AlertTriangle,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  intervention: {
    icon: Zap,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  info: {
    icon: Info,
    color: 'text-brand-100',
    bg: 'bg-brand-500/10 border-brand-500/20',
  },
};

/* ------------------------------------------------------------------ */
/*  Time formatter                                                     */
/* ------------------------------------------------------------------ */

function timeAgo(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type ActivityFeedProps = {
  events: TelemetryEvent[];
  maxItems?: number;
};

export function ActivityFeed({ events, maxItems = 8 }: ActivityFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll to the top on new events (unless paused)
  useEffect(() => {
    if (!isPaused && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [events.length, isPaused]);

  const displayEvents = [...events].reverse().slice(0, maxItems);

  return (
    <motion.div variants={fadeInUp} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Recent AI actions</p>
          <h2 className="text-xl font-semibold text-white">Live activity</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Activity size={12} />
          {events.length} events
        </div>
      </div>

      <div
        ref={containerRef}
        className="max-h-72 space-y-2 overflow-y-auto pr-1"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="popLayout">
          {displayEvents.map((event) => {
            const style = eventStyles[event.type] || eventStyles.info;
            const Icon = style.icon;

            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`flex items-start gap-3 rounded-2xl border ${style.bg} p-3`}
              >
                <Icon size={14} className={`mt-0.5 shrink-0 ${style.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-300">{event.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{timeAgo(event.timestamp)}</p>
                </div>
                {event.value !== undefined && (
                  <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-xs tabular-nums text-slate-400">
                    {event.value}%
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {displayEvents.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-center text-sm text-slate-500">
            No events yet. Activity will appear here in real time.
          </div>
        )}
      </div>

      {isPaused && (
        <p className="mt-2 text-center text-xs text-slate-500">
          Auto-scroll paused — hover away to resume
        </p>
      )}
    </motion.div>
  );
}
