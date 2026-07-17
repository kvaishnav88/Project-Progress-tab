import { AppShell } from '@/components/app-shell';
import { BadgeCheck, Mail, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/20 text-2xl font-semibold text-brand-100">
                AB
              </div>
              <div>
                <p className="text-sm text-slate-400">Profile</p>
                <h1 className="text-2xl font-semibold text-white">Ava Brooks</h1>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              <BadgeCheck size={16} /> Verified operator
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <div className="mb-4 flex items-center gap-2 text-brand-100">
              <Sparkles size={18} />
              <span className="text-sm">Preference profile</span>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">Prefers concise onboarding and calm transitions.</div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">Uses a desktop workflow with high focus mode.</div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <div className="mb-4 flex items-center gap-2 text-slate-300">
              <Mail size={18} />
              <span className="text-sm">Contact</span>
            </div>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">ava@auragen.ai</div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">Role: Product design lead</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
