"use client";

import { useState } from "react";
import { Bot, Sparkles, Loader2 } from "lucide-react";

import { generateUI } from "@/lib/api";
import type { GenerateResponse } from "@/types/ai";
import type { CognitiveLoadMetrics } from "@/lib/cognitive-load-data";

type Props = {
  metrics: CognitiveLoadMetrics;
};

export default function AIIntegrationPanel({ metrics }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    try {
      setLoading(true);
      setError("");

      const response = await generateUI({
        component_name: metrics.topField,
        cognitive_score: Math.min(
        Math.max(metrics.averageCognitiveLoad / 100, 0),
        1
        ),
        hesitation_time: metrics.averageHesitationMs,
        rage_clicks: Math.round(metrics.averageClickErrorRate * 10),

        // Temporary value until real frontend telemetry exists
        mouse_velocity: metrics.averageCorrectionCount * 10,
      });

      setResult(response);
    } catch (err) {
      console.error(err);
      setError("Failed to generate adaptive UI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">AI Backend</p>
          <h2 className="text-xl font-semibold text-white">
            Gemini Integration
          </h2>
        </div>

        <Bot className="text-brand-300" size={22} />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate Adaptive UI
          </>
        )}
      </button>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Strategy
            </p>
            <p className="mt-1 text-white font-medium">
              {result.strategy}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Generation Time
            </p>
            <p className="mt-1 text-white">
              {result.generation_time.toFixed(2)} sec
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Status
            </p>

            <p
              className={`mt-1 font-medium ${
                result.is_valid
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {result.is_valid ? "Success" : "Failed"}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">
              Generated React Component
            </p>

            <pre className="max-h-80 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-emerald-300 whitespace-pre-wrap">
              {result.component}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}