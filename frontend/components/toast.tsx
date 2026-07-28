"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useToast, type ToastVariant } from '@/context/toast-context';

/* ------------------------------------------------------------------ */
/*  Variant styling                                                    */
/* ------------------------------------------------------------------ */

const variantStyles: Record<
  ToastVariant,
  { bg: string; border: string; icon: typeof CheckCircle2; iconColor: string; progressColor: string }
> = {
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    progressColor: 'bg-emerald-400',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: XCircle,
    iconColor: 'text-red-400',
    progressColor: 'bg-red-400',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    progressColor: 'bg-amber-400',
  },
  info: {
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/20',
    icon: Info,
    iconColor: 'text-brand-100',
    progressColor: 'bg-brand-500',
  },
};

/* ------------------------------------------------------------------ */
/*  Toast container — renders all active toasts                        */
/* ------------------------------------------------------------------ */

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-3 sm:right-6 sm:top-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const style = variantStyles[toast.variant];
          const Icon = style.icon;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className={`pointer-events-auto relative flex w-80 items-start gap-3 overflow-hidden rounded-2xl border ${style.border} ${style.bg} p-4 shadow-lg backdrop-blur-md sm:w-96`}
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${style.iconColor}`} />

              <p className="flex-1 text-sm text-slate-200">{toast.message}</p>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-full p-1 text-slate-400 transition hover:text-white"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
                <div
                  className={`h-full ${style.progressColor} toast-progress-bar`}
                  style={{ '--toast-duration': `${toast.duration}ms` } as React.CSSProperties}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
