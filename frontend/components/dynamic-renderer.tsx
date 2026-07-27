"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, RefreshCw, Sparkles, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';
import { useTelemetry } from '@/context/telemetry-context';
import { useToast } from '@/context/toast-context';
import {
  staggerContainer,
  generationStep,
  resultEntrance,
  errorShake,
  scaleIn,
} from '@/lib/animations';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type GenerationResult = {
  strategy: string;
  generation_time: number;
  is_valid: boolean;
  component_html?: string;
  reasoning?: string;
  complexity_score?: number;
};

type RendererState = 'idle' | 'generating' | 'success' | 'error';

/* ------------------------------------------------------------------ */
/*  Generation progress steps                                          */
/* ------------------------------------------------------------------ */

const GENERATION_STEPS = [
  { label: 'Analysing friction signals…', icon: Zap, delay: 0 },
  { label: 'Selecting adaptive strategy…', icon: Bot, delay: 700 },
  { label: 'Generating UI layout…', icon: Sparkles, delay: 1500 },
  { label: 'Validating output…', icon: CheckCircle2, delay: 2400 },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function IdleState({ onGenerate, frictionScore }: { onGenerate: () => void; frictionScore: number }) {
  const severity = frictionScore > 70 ? 'critical' : frictionScore > 45 ? 'elevated' : 'normal';
  const severityColor = severity === 'critical' ? 'text-red-400' : severity === 'elevated' ? 'text-amber-400' : 'text-emerald-400';

  return (
    <motion.div
      variants={resultEntrance}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-5 py-8 text-center"
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/20 text-brand-100"
      >
        <Bot size={26} />
      </motion.div>

      <div>
        <h3 className="text-lg font-semibold text-white">AI Component Generator</h3>
        <p className="mt-1 max-w-xs text-sm text-slate-400">
          The AI will generate an adaptive UI component based on the current friction score.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-2 text-sm">
        <span className="text-slate-400">Current friction:</span>
        <span className={`font-semibold tabular-nums ${severityColor}`}>{frictionScore}/100</span>
        <span className={`rounded-full px-2 py-0.5 text-xs ${
          severity === 'critical' ? 'bg-red-500/10 text-red-400' :
          severity === 'elevated' ? 'bg-amber-500/10 text-amber-400' :
          'bg-emerald-500/10 text-emerald-400'
        }`}>{severity}</span>
      </div>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onGenerate}
        className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-medium text-white shadow-soft transition hover:bg-brand-500"
      >
        <Sparkles size={16} />
        Generate adaptive UI
      </motion.button>
    </motion.div>
  );
}

function GeneratingState({ visibleStep }: { visibleStep: number }) {
  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Sweeping shimmer bar */}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-600 via-violet-500 to-brand-500"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '60%' }}
        />
      </div>

      {/* Sequential progress labels */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {GENERATION_STEPS.slice(0, visibleStep + 1).map((step, i) => {
          const Icon = step.icon;
          const isActive = i === visibleStep;
          return (
            <motion.div
              key={step.label}
              variants={generationStep}
              className={`flex items-center gap-3 text-sm transition-colors ${
                isActive ? 'text-white' : 'text-slate-500'
              }`}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                isActive ? 'bg-brand-600/30 text-brand-100' : 'bg-white/5 text-slate-600'
              }`}>
                {i < visibleStep ? (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                ) : (
                  <Icon size={14} />
                )}
              </div>
              {step.label}
              {isActive && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-brand-100"
                >
                  ●
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <p className="text-center text-xs text-slate-500">
        The AI is processing real interaction signals from your current session…
      </p>
    </div>
  );
}

function SuccessState({
  result,
  onReset,
  frictionScore,
}: {
  result: GenerationResult;
  onReset: () => void;
  frictionScore: number;
}) {
  return (
    <motion.div
      variants={resultEntrance}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Header badges */}
      <div className="flex flex-wrap items-center gap-2">
        <motion.div variants={scaleIn} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
          <CheckCircle2 size={12} />
          {result.is_valid ? 'Valid output' : 'Needs review'}
        </motion.div>
        <motion.div variants={scaleIn} className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs text-brand-100">
          <Clock size={12} />
          {result.generation_time}s generation
        </motion.div>
        <motion.div variants={scaleIn} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          <Bot size={12} />
          {result.strategy}
        </motion.div>
      </div>

      {/* Rendered AI component output */}
      {result.component_html ? (
        <div
          className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200"
          dangerouslySetInnerHTML={{ __html: result.component_html }}
        />
      ) : (
        /* Structured result card when no HTML is returned */
        <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
            <span className="text-slate-400">Strategy selected</span>
            <span className="font-medium text-white">{result.strategy.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
            <span className="text-slate-400">Friction score at time</span>
            <span className="font-medium tabular-nums text-white">{frictionScore}/100</span>
          </div>
          {result.reasoning && (
            <div className="rounded-xl border border-brand-500/20 bg-brand-500/10 p-3 text-sm text-slate-300">
              <p className="mb-1 text-xs font-medium text-brand-100">AI reasoning</p>
              {result.reasoning}
            </div>
          )}
          {result.complexity_score !== undefined && (
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
              <span className="text-slate-400">Complexity score</span>
              <span className="font-medium tabular-nums text-white">{result.complexity_score}</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onReset}
        className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
      >
        <RefreshCw size={14} /> Generate again
      </button>
    </motion.div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      variants={errorShake}
      animate="shake"
      className="flex flex-col items-center gap-4 py-6 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
        <XCircle size={24} />
      </div>
      <div>
        <p className="font-medium text-white">Generation failed</p>
        <p className="mt-1 text-sm text-slate-400">{message}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm text-white transition hover:bg-brand-500"
      >
        <RefreshCw size={14} /> Retry
      </motion.button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main DynamicRenderer component                                     */
/* ------------------------------------------------------------------ */

export function DynamicRenderer() {
  const { frictionScore, metrics } = useTelemetry();
  const toast = useToast();
  const [state, setState] = useState<RendererState>('idle');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [visibleStep, setVisibleStep] = useState(0);

  async function handleGenerate() {
    setState('generating');
    setVisibleStep(0);
    setResult(null);
    setErrorMessage('');

    // Animate through progress steps
    GENERATION_STEPS.forEach((step, i) => {
      if (i === 0) return;
      setTimeout(() => setVisibleStep(i), step.delay);
    });

    try {
      const response = await fetch('http://127.0.0.1:8000/generate-ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component_name: metrics?.topField ?? 'Payment Form',
          cognitive_score: (frictionScore / 100).toFixed(2),
          mouse_velocity: 18,
          hesitation_time: (metrics?.averageHesitationMs ?? 1000) / 1000,
          rage_clicks: Math.round((metrics?.averageClickErrorRate ?? 0.1) * 10),
        }),
      });

      if (!response.ok) throw new Error(`Backend returned ${response.status}`);

      const data: GenerationResult = await response.json();
      setResult(data);
      setState('success');
      toast.success(`AI generated: ${data.strategy} in ${data.generation_time}s`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not reach AI backend.';
      setErrorMessage(`${msg} — make sure the Python backend is running on port 8000.`);
      setState('error');
      toast.error('AI generation failed. Check if backend is running.');
    }
  }

  function handleReset() {
    setState('idle');
    setResult(null);
    setVisibleStep(0);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Runtime integration</p>
          <h2 className="text-xl font-semibold text-white">
            Dynamic AI renderer
          </h2>
        </div>
        <div className={`flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs ${
          state === 'success'
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
            : state === 'generating'
            ? 'border-brand-500/20 bg-brand-500/10 text-brand-100'
            : state === 'error'
            ? 'border-red-500/20 bg-red-500/10 text-red-300'
            : 'border-white/10 bg-white/5 text-slate-400'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${
            state === 'success' ? 'bg-emerald-400' :
            state === 'generating' ? 'bg-brand-400' :
            state === 'error' ? 'bg-red-400' : 'bg-slate-600'
          }`} />
          {state === 'idle' ? 'Ready' :
           state === 'generating' ? 'Generating…' :
           state === 'success' ? 'Complete' : 'Error'}
        </div>
      </div>

      {/* State machine */}
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <IdleState onGenerate={handleGenerate} frictionScore={frictionScore} />
          </motion.div>
        )}
        {state === 'generating' && (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GeneratingState visibleStep={visibleStep} />
          </motion.div>
        )}
        {state === 'success' && result && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SuccessState result={result} onReset={handleReset} frictionScore={frictionScore} />
          </motion.div>
        )}
        {state === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorState message={errorMessage} onRetry={handleGenerate} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
