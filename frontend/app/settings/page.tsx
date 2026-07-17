import { AppShell } from '@/components/app-shell';
import { MoonStar, ShieldCheck, SlidersHorizontal } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-600/20 p-2 text-brand-100">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Settings</p>
              <h1 className="text-2xl font-semibold text-white">Experience controls</h1>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <div className="mb-4 flex items-center gap-2 text-brand-100">
              <MoonStar size={18} />
              <span className="text-sm">Appearance</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
              Dark mode is the default experience with resilient contrast for long sessions.
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <div className="mb-4 flex items-center gap-2 text-emerald-300">
              <ShieldCheck size={18} />
              <span className="text-sm">Safety</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
              AI-generated components are validated before they enter the dynamic renderer.
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
