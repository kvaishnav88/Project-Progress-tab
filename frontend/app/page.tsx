import Link from 'next/link';
import { getCognitiveLoadMetrics } from '@/lib/cognitive-load-data';
import { ArrowRight, Brain, Layers3, Sparkles, Zap } from 'lucide-react';

const features = [
  {
    title: 'Adaptive UI',
    description: 'Detects cognitive friction and morphs complex flows into guided experiences.',
    icon: Brain,
  },
  {
    title: 'Design System Ready',
    description: 'Built with reusable Tailwind components and a polished dark mode experience.',
    icon: Layers3,
  },
  {
    title: 'Live Insight',
    description: 'Socket-backed telemetry and AI overlay keep every interaction transparent.',
    icon: Sparkles,
  },
];

export default async function HomePage() {
  const metrics = await getCognitiveLoadMetrics();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(91,124,255,0.2),_transparent_30%),linear-gradient(135deg,_#020617,_#0f172a)] px-6 py-16 text-slate-100 lg:px-10">
      <section className="mx-auto flex max-w-7xl flex-col gap-10">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-slate-900/70 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-brand-600/20 p-2 text-brand-100">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">AuraGen</p>
              <p className="text-xs text-slate-400">Self-healing generative UI</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <Link href="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
            <Link href="/about" className="transition hover:text-white">
              About
            </Link>
          </div>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-sm text-brand-100">
              <Sparkles size={16} />
              Production-ready frontend prototype
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Make complex workflows feel effortless with adaptive UI.
              </h1>
              <p className="max-w-2xl text-lg text-slate-300 sm:text-xl">
                AuraGen uses cognitive-load sensing, AI guidance, and live rendering to turn confusing experiences into guided wizard flows.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 font-medium text-white transition hover:bg-brand-500"
              >
                Explore dashboard <ArrowRight size={18} />
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-white/10 px-5 py-3 font-medium text-slate-200 transition hover:border-brand-500/50 hover:text-white"
              >
                Learn more
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Cognitive load score</p>
                <p className="text-3xl font-semibold text-white">{Math.round(metrics.averageCognitiveLoad)}%</p>
              </div>
              <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">
                {metrics.interventionRate}% adaptive actions
              </div>
            </div>
            <div className="space-y-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="rounded-xl bg-brand-600/20 p-2 text-brand-100">
                        <Icon size={18} />
                      </div>
                      <h2 className="font-semibold text-white">{feature.title}</h2>
                    </div>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
