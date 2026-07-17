import { AppShell } from '@/components/app-shell';
import { Cpu, MessageSquareQuote, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-600/20 p-2 text-brand-100">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-400">About</p>
              <h1 className="text-2xl font-semibold text-white">AuraGen vision</h1>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <div className="mb-4 flex items-center gap-2 text-brand-100">
              <Cpu size={18} />
              <span className="text-sm">Frontend focus</span>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              The frontend presents a resilient, responsive interface that can respond to cognitive friction with a live AI overlay, adaptive rendering placeholder, and polished transitions.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <div className="mb-4 flex items-center gap-2 text-brand-100">
              <MessageSquareQuote size={18} />
              <span className="text-sm">Experience design</span>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              Each screen is designed to feel calm, modern, and production-ready while keeping the project aligned with the AuraGen narrative.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
