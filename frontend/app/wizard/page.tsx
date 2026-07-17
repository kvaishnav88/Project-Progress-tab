'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

const steps = ['Intent', 'Identity', 'Review'];

export default function WizardPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  async function testBackend() {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/generate-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          component_name: 'Payment Form',
          cognitive_score: 0.92,
          mouse_velocity: 18,
          hesitation_time: 7.5,
          rage_clicks: 6,
        }),
      });

      const data = await response.json();

      setResult(data);

      console.log('Backend Response:', data);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to backend.');
    }

    setLoading(false);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-600/20 p-2 text-brand-100">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="text-sm text-slate-400">Wizard form</p>
              <h1 className="text-2xl font-semibold text-white">
                Adaptive step flow
              </h1>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">

          <div className="mb-6 flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-300"
              >
                <div className="rounded-full bg-brand-600/20 p-1 text-brand-100">
                  {index + 1}
                </div>

                {step}
              </div>
            ))}
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5">

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Full name
                </label>

                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none"
                  placeholder="Ava Brooks"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Account type
                </label>

                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none"
                  placeholder="Enterprise"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Why are you applying?
              </label>

              <textarea
                className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none"
                placeholder="Describe your goal"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-emerald-300">
                <CheckCircle2 size={16} />
                AI preview ready
              </div>

              <div className="flex gap-3">

                <button
                  onClick={testBackend}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white"
                >
                  {loading ? 'Testing...' : 'Test AI API'}
                </button>

                <button className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm text-white">
                  Continue
                  <ChevronRight size={16} />
                </button>

              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/20 p-4 text-red-300">
                {error}
              </div>
            )}

            {result && (
              <div className="rounded-xl border border-white/10 bg-slate-950 p-4 text-sm text-white space-y-2">

                <p>
                  <strong>Strategy:</strong> {result.strategy}
                </p>

                <p>
                  <strong>Generation Time:</strong>{' '}
                  {result.generation_time}s
                </p>

                <p>
                  <strong>Valid:</strong>{' '}
                  {result.is_valid ? 'Yes' : 'No'}
                </p>

              </div>
            )}

          </div>
        </div>
      </div>
    </AppShell>
  );
}