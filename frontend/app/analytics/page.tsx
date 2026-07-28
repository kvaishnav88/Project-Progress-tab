"use client";

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Zap } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { useTelemetry } from '@/context/telemetry-context';
import { SkeletonCard } from '@/components/skeleton-card';
import { staggerContainer, fadeInUp } from '@/lib/animations';

/* ------------------------------------------------------------------ */
/*  Animated bar — fills on mount                                      */
/* ------------------------------------------------------------------ */

function AnimatedBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm text-slate-400">
        <span>{label}</span>
        <span className="tabular-nums text-white">{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-800">
        <motion.div
          className="h-2.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Analytics page                                                     */
/* ------------------------------------------------------------------ */

export default function AnalyticsPage() {
  const { metrics, loading } = useTelemetry();

  if (loading || !metrics) {
    return (
      <AppShell>
        <div className="space-y-6">
          <SkeletonCard />
          <div className="grid gap-4 lg:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          className="rounded-3xl border border-white/10 bg-slate-950/70 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-600/20 p-2 text-brand-100">
              <BarChart3 size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Analytics</p>
              <h1 className="text-2xl font-semibold text-white">
                Cognitive friction trends
              </h1>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid gap-4 lg:grid-cols-2"
        >
          {/* Signal strength bars */}
          <motion.div
            variants={fadeInUp}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-6"
          >
            <div className="mb-4 flex items-center gap-2 text-brand-100">
              <TrendingUp size={18} />
              <span className="text-sm">Signal strength</span>
            </div>
            <div className="space-y-4">
              {metrics.signalStrengths.map((signal) => (
                <AnimatedBar
                  key={signal.label}
                  label={signal.label}
                  value={signal.value}
                />
              ))}
            </div>
          </motion.div>

          {/* AI insights */}
          <motion.div
            variants={fadeInUp}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-6"
          >
            <div className="mb-4 flex items-center gap-2 text-emerald-300">
              <Zap size={18} />
              <span className="text-sm">AI response</span>
            </div>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Average hesitation time is{' '}
                {Math.round(metrics.averageHesitationMs)}ms across the observed
                sessions.
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
              >
                Average click error rate is{' '}
                {metrics.averageClickErrorRate.toFixed(2)} and correction count
                is {metrics.averageCorrectionCount.toFixed(1)}.
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                Top intervention is{' '}
                {metrics.topAction.replace(/_/g, ' ')} for{' '}
                {metrics.topField}.
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Extra metrics row */}
        <motion.div
          variants={staggerContainer}
          className="grid gap-4 md:grid-cols-3"
        >
          {[
            {
              label: 'Avg. Hesitation',
              value: `${Math.round(metrics.averageHesitationMs)}ms`,
              color: 'text-amber-400',
            },
            {
              label: 'Click Error Rate',
              value: `${(metrics.averageClickErrorRate * 100).toFixed(1)}%`,
              color: 'text-red-400',
            },
            {
              label: 'Correction Count',
              value: metrics.averageCorrectionCount.toFixed(1),
              color: 'text-brand-100',
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 transition-colors hover:border-white/20"
            >
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${stat.color}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
