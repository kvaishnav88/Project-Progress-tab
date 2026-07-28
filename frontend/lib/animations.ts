"use client";

import { Variants } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Centralized Framer Motion animation variants for AuraGen           */
/*  All components import from here to keep animations consistent.     */
/* ------------------------------------------------------------------ */

/** Stagger container — wraps children that should enter one after another */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/** Fade in + slide up — default card entrance */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Scale pop-in — badges, buttons, small elements */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
};

/** Slide in from the left — sidebar entrance */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Slide in from the right — panels, overlays */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Slide up for toasts */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  exit: {
    opacity: 0,
    x: 80,
    transition: { duration: 0.25 },
  },
};

/** Glow pulse — live indicators */
export const pulseGlow: Variants = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(91, 124, 255, 0)',
      '0 0 0 8px rgba(91, 124, 255, 0.3)',
      '0 0 0 0 rgba(91, 124, 255, 0)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

/** Page transition — used in AppShell */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
};

/** Overlay variants — mobile nav backdrop */
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** Drawer panel — mobile nav slide-in */
export const drawerVariants: Variants = {
  hidden: { x: '-100%' },
  show: {
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    x: '-100%',
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

/**
 * generationStep — sequential label animation for AI generation progress.
 * Use inside a staggerContainer parent so each step label appears one
 * after the other during the "Generating..." phase.
 */
export const generationStep: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

/**
 * resultEntrance — spring bounce used when the AI-generated component
 * appears after a successful generation call.
 */
export const resultEntrance: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 240, damping: 22, delay: 0.05 },
  },
};

/**
 * errorShake — horizontal shake applied to the DynamicRenderer error state.
 * Use as animate prop directly: animate="shake"
 */
export const errorShake: Variants = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.5 },
  },
};

/* ------------------------------------------------------------------ */
/*  Helper: check reduced motion preference                            */
/* ------------------------------------------------------------------ */

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Returns empty variants when user prefers reduced motion */
export function safeVariants(variants: Variants): Variants {
  if (typeof window !== 'undefined' && prefersReducedMotion()) {
    return {
      hidden: {},
      show: {},
      exit: {},
      animate: {},
      initial: {},
    };
  }
  return variants;
}
