import { AppShell } from '@/components/app-shell';
import { getCognitiveLoadMetrics } from '@/lib/cognitive-load-data';
import { BarChart3, TrendingUp, Zap } from 'lucide-react';

export default async function AnalyticsPage() {
  const metrics = await getCognitiveLoadMetrics();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-600/20 p-2 text-brand-100">
              <BarChart3 size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Analytics</p>
              <h1 className="text-2xl font-semibold text-white">Cognitive friction trends</h1>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <div className="mb-4 flex items-center gap-2 text-brand-100">
              <TrendingUp size={18} />
              <span className="text-sm">Signal strength</span>
            </div>
            <div className="space-y-3">
              {metrics.signalStrengths.map((signal) => (
                <div key={signal.label}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-400">
                    <span>{signal.label}</span>
                    <span className="text-white">{signal.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-brand-600" style={{ width: `${signal.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <div className="mb-4 flex items-center gap-2 text-emerald-300">
              <Zap size={18} />
              <span className="text-sm">AI response</span>
            </div>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
              <div>Average hesitation time is {Math.round(metrics.averageHesitationMs)}ms across the observed sessions.</div>
              <div>Average click error rate is {metrics.averageClickErrorRate.toFixed(2)} and correction count is {metrics.averageCorrectionCount.toFixed(1)}.</div>
              <div>Top intervention is {metrics.topAction.replace(/_/g, ' ')} for {metrics.topField}.</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
