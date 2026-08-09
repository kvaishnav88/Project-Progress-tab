'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  User2,
  Wand2,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { useToast } from '@/context/toast-context';
import { staggerContainer, fadeInUp } from '@/lib/animations';

/* ------------------------------------------------------------------ */
/*  Step definitions                                                   */
/* ------------------------------------------------------------------ */

const steps = [
  { id: 'intent', label: 'Intent', icon: Wand2 },
  { id: 'identity', label: 'Identity', icon: User2 },
  { id: 'review', label: 'Review', icon: FileText },
] as const;

type StepId = (typeof steps)[number]['id'];

/* ------------------------------------------------------------------ */
/*  Step content direction-aware animation                             */
/* ------------------------------------------------------------------ */

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.25 },
  }),
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const toast = useToast();

  /* ---- Form state ---- */
  const [formData, setFormData] = useState({
    fullName: '',
    accountType: '',
    reason: '',
    email: '',
    organization: '',
    role: '',
  });

  /* ---- Validation ---- */
  function validateStep(step: number): boolean {
    switch (step) {
      case 0:
        if (!formData.fullName.trim() || !formData.reason.trim()) {
          toast.warning('Please fill in your name and reason.');
          return false;
        }
        return true;
      case 1:
        if (!formData.email.trim()) {
          toast.warning('Please provide your email.');
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  /* ---- Navigation ---- */
  function goNext() {
    if (currentStep < steps.length - 1 && validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }

  /* ---- AI API test ---- */
  async function testBackend() {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/generate-ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      toast.success('AI response received successfully!');
    } catch {
      setError('Failed to connect to backend.');
      toast.error('Failed to connect to the AI backend.');
    }

    setLoading(false);
  }

  /* ---- Progress percentage ---- */
  const progress = ((currentStep + 1) / steps.length) * 100;

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
          className="rounded-3xl border border-white/10 bg-slate-950/70 p-6"
        >
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
        </motion.div>

        {/* ---- Main wizard card ---- */}
        <motion.div
          variants={fadeInUp}
          className="rounded-3xl border border-white/10 bg-slate-950/70 p-6"
        >
          {/* ---- Progress bar ---- */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (index < currentStep) {
                        setDirection(index < currentStep ? -1 : 1);
                        setCurrentStep(index);
                      }
                    }}
                    className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${
                      isActive
                        ? 'bg-brand-600/20 text-white'
                        : isCompleted
                        ? 'text-emerald-300 hover:bg-emerald-500/10'
                        : 'text-slate-500'
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                        isActive
                          ? 'bg-brand-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Animated progress bar */}
            <div className="h-1 rounded-full bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* ---- Step content ---- */}
          <div className="relative min-h-[280px] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-5">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      What brings you here?
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm text-slate-400">
                          Full name
                        </label>
                        <input
                          data-field="full_name"
                          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500/50"
                          placeholder="Ava Brooks"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-400">
                          Account type
                        </label>
                        <input
                          data-field="account_type"
                          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500/50"
                          placeholder="Enterprise"
                          value={formData.accountType}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, accountType: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-400">
                        Why are you applying?
                      </label>
                      <textarea
                        data-field="reason"
                        className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500/50"
                        placeholder="Describe your goal"
                        value={formData.reason}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, reason: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Tell us about yourself
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm text-slate-400">
                          Email address
                        </label>
                        <input
                          data-field="email"
                          type="email"
                          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500/50"
                          placeholder="ava@company.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, email: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-400">
                          Organization
                        </label>
                        <input
                          data-field="organization"
                          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500/50"
                          placeholder="Acme Inc."
                          value={formData.organization}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, organization: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-400">
                        Your role
                      </label>
                      <input
                        data-field="role"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500/50"
                        placeholder="Product designer"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, role: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Review & submit
                    </h3>
                    <div className="space-y-2 text-sm">
                      {[
                        { label: 'Name', value: formData.fullName },
                        { label: 'Account', value: formData.accountType },
                        { label: 'Reason', value: formData.reason },
                        { label: 'Email', value: formData.email },
                        { label: 'Organization', value: formData.organization },
                        { label: 'Role', value: formData.role },
                      ]
                        .filter((item) => item.value)
                        .map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-2.5"
                          >
                            <span className="text-slate-400">
                              {item.label}
                            </span>
                            <span className="text-white">{item.value}</span>
                          </div>
                        ))}
                    </div>

                    {error && (
                      <div className="rounded-xl bg-red-500/20 p-4 text-sm text-red-300">
                        {error}
                      </div>
                    )}

                    {result && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-white"
                      >
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
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ---- Navigation buttons ---- */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-emerald-300">
              <CheckCircle2 size={16} />
              AI preview ready
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={goBack}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <ChevronLeft size={16} /> Back
                </motion.button>
              )}

              {currentStep === steps.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={testBackend}
                  disabled={loading}
                  className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : 'Test AI API'}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={goNext}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-500"
                >
                  Continue <ChevronRight size={16} />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}