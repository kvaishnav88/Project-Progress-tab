"use client";

import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Bot, Brain, MousePointer, Sparkles, Timer, Users } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { MetricCard } from '@/components/dashboard/metric-card';
import { FrictionChart } from '@/components/dashboard/friction-chart';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { ConnectionBadge } from '@/components/dashboard/connection-badge';
import { DynamicRenderer } from '@/components/dynamic-renderer';
import { SkeletonCard, SkeletonChart } from '@/components/skeleton-card';
import { useTelemetry } from '@/context/telemetry-context';
import { staggerContainer, fadeInUp } from '@/lib/animations';

/* ------------------------------------------------------------------ */
/*  Dashboard page                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const {
    metrics,
    events,
    connectionStatus,
    frictionScore,
    frictionHistory,
    liveSignals,
    loading,
  } = useTelemetry();

  /* ---- Loading skeleton ---- */
  if (loading || !metrics) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <div className="skeleton-shimmer h-6 w-48 rounded-lg" />
            <div className="skeleton-shimmer mt-2 h-8 w-72 rounded-lg" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <SkeletonChart /><SkeletonChart />
          </div>
        </div>
      </AppShell>
    );
  }

  /* ---- Derived values ---- */
  const cognitiveLoad    = Math.round(metrics.averageCognitiveLoad);
  const wizardAdoption   = Math.max(0, 100 - metrics.abandonmentRate);
  const interventionRate = metrics.interventionRate;
  const abandonmentRate  = metrics.abandonmentRate;

  const cognitiveStatus   = cognitiveLoad   > 70 ? 'critical' : cognitiveLoad   > 45 ? 'warning' : 'good';
  const abandonmentStatus = abandonmentRate > 50 ? 'critical' : abandonmentRate > 30 ? 'warning' : 'good';

  return (
    <AppShell>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* ---- Header ---- */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="text-sm text-brand-100">Overview</p>
            <h1 className="text-3xl font-semibold text-white">Self-healing UI workspace</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Monitor load, preview AI guidance, and observe adaptive experiences as they unfold.
            </p>
          </div>
          <ConnectionBadge status={connectionStatus} />
        </motion.div>

        {/* ---- Metric cards ---- */}
        <motion.div variants={staggerContainer} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Cognitive load" value={cognitiveLoad} suffix="%" detail="Derived from uploaded telemetry" trend={cognitiveLoad > 60 ? 'up' : 'down'} status={cognitiveStatus} icon={<Brain size={16} />} />
          <MetricCard title="Wizard adoption" value={wizardAdoption} suffix="%" detail="Inferred from session resilience" trend={wizardAdoption > 70 ? 'up' : 'down'} status="good" icon={<Users size={16} />} />
          <MetricCard title="AI interventions" value={interventionRate} suffix="%" detail="Adaptive actions in dataset" trend="up" status="good" icon={<Sparkles size={16} />} />
          <MetricCard title="Abandonment rate" value={abandonmentRate} suffix="%" detail="Sessions with drop-off risk" trend={abandonmentRate > 30 ? 'up' : 'down'} status={abandonmentStatus} icon={<AlertTriangle size={16} />} />
        </motion.div>

        {/* ---- Live signals row (YOUR real mouse/hesitation/rage-click data) ---- */}
        <motion.div variants={fadeInUp} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-sm font-medium text-white">Live signals — your current session</p>
            <span className="ml-auto text-xs text-slate-500">Updates in real time as you interact</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Mouse velocity */}
            <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MousePointer size={12} /> Mouse velocity
              </div>
              <p className="text-xl font-semibold tabular-nums text-white">
                {liveSignals.mouseVelocity}
                <span className="ml-1 text-xs font-normal text-slate-500">px/s</span>
              </p>
            </div>
            {/* Hesitation */}
            <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Timer size={12} /> Last hesitation
              </div>
              <p className="text-xl font-semibold tabular-nums text-white">
                {liveSignals.hesitationMs > 0 ? liveSignals.hesitationMs : '—'}
                <span className="ml-1 text-xs font-normal text-slate-500">{liveSignals.hesitationMs > 0 ? 'ms' : ''}</span>
              </p>
            </div>
            {/* Rage clicks */}
            <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MousePointer size={12} /> Rage clicks
              </div>
              <p className={`text-xl font-semibold tabular-nums ${liveSignals.rageClickCount > 0 ? 'text-red-400' : 'text-white'}`}>
                {liveSignals.rageClickCount}
                <span className="ml-1 text-xs font-normal text-slate-500">this session</span>
              </p>
            </div>
            {/* Scroll jitter */}
            <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Activity size={12} /> Scroll jitter
              </div>
              <p className="text-xl font-semibold tabular-nums text-white">
                {liveSignals.scrollJitterCount}
                <span className="ml-1 text-xs font-normal text-slate-500">events</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* ---- Chart + Activity feed ---- */}
        <motion.div variants={staggerContainer} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <FrictionChart data={frictionHistory} label="Cognitive friction trend" />

            {/* Friction score panel */}
            <motion.div variants={fadeInUp} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Current interaction state</p>
                  <h2 className="text-xl font-semibold text-white">Friction analysis</h2>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-slate-400" />
                    <span>Friction score</span>
                  </div>
                  <span className="font-semibold tabular-nums text-white">{frictionScore}/100</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-slate-400" />
                    <span>Suggested fallback</span>
                  </div>
                  <span className="text-white">{metrics.topAction.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Brain size={14} className="text-slate-400" />
                    <span>High-friction field</span>
                  </div>
                  <span className="text-white">{metrics.topField}</span>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-brand-600/20 to-slate-900 p-4">
                <div className="flex items-center gap-2 text-sm text-brand-100">
                  <Bot size={16} /> AI overlay recommendation
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  The system is preparing a simplified onboarding sequence focused on{' '}
                  {metrics.topField} because it shows the highest friction in the uploaded telemetry.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Activity feed */}
            <ActivityFeed events={events} />
          </div>
        </motion.div>

        {/* ---- Dynamic AI Renderer (full width) ---- */}
        <motion.div variants={fadeInUp}>
          <DynamicRenderer />
        </motion.div>

      </motion.div>
    </AppShell>
  );
}
