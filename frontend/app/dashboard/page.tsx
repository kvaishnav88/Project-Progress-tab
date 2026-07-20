import AIIntegrationPanel from "@/components/AIIntegrationPanel";
import { AppShell } from "@/components/app-shell";
import { getCognitiveLoadMetrics } from "@/lib/cognitive-load-data";
import { Activity, Bot, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const metrics = await getCognitiveLoadMetrics();

  const cards = [
    {
      title: "Cognitive load",
      value: `${Math.round(metrics.averageCognitiveLoad)}%`,
      detail: "Derived from the uploaded telemetry",
    },
    {
      title: "Wizard adoption",
      value: `${Math.max(0, 100 - metrics.abandonmentRate)}%`,
      detail: "Inferred from session resilience",
    },
    {
      title: "AI interventions",
      value: `${metrics.interventionRate}%`,
      detail: "Adaptive actions observed in the dataset",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-brand-100">Overview</p>
            <h1 className="text-3xl font-semibold text-white">
              Self-healing UI workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Monitor load, preview AI guidance, and observe adaptive
              experiences as they unfold.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Live telemetry connected
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
            >
              <p className="text-sm text-slate-400">{card.title}</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {card.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
            </div>
          ))}
        </div>

        {/* Main Section */}
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          {/* Left Panel */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Adaptive flow preview
                </p>
                <h2 className="text-xl font-semibold text-white">
                  Complex form → guided wizard
                </h2>
              </div>

              <button className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-2 text-sm text-brand-100">
                <Sparkles size={16} />
                Preview
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                  <Activity size={16} />
                  Current interaction state
                </div>

                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
                    <span>Friction score</span>
                    <span className="text-white">
                      {Math.round(metrics.averageCognitiveLoad)}/100
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
                    <span>Suggested fallback</span>
                    <span className="text-white">
                      {metrics.topAction.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-brand-600/20 to-slate-900 p-4">
                <div className="flex items-center gap-2 text-sm text-brand-100">
                  <Bot size={16} />
                  AI overlay recommendation
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  The system is preparing a simplified onboarding sequence
                  focused on <strong>{metrics.topField}</strong> because it
                  shows the highest friction in the uploaded telemetry.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <AIIntegrationPanel metrics={metrics} />
        </div>
      </div>
    </AppShell>
  );
}