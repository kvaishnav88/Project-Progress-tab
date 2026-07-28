"use client";

/**
 * Client-side telemetry tracker
 *
 * Captures REAL user interaction signals two ways:
 *  1. Emits to backend via Socket.IO (when connected)
 *  2. Dispatches custom DOM events so TelemetryContext can update
 *     live dashboard values even when the backend is offline.
 *
 * Tracked signals:
 *  - Mouse velocity & acceleration  → window event: telemetry:mouse
 *  - Click / rage-click detection   → window event: telemetry:rage_click
 *  - Hesitation time (focus→key)    → window event: telemetry:hesitation
 *  - Scroll jitter                  → window event: telemetry:scroll_jitter
 */

import type { Socket } from 'socket.io-client';

/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */

let lastMouseX = 0;
let lastMouseY = 0;
let lastMouseTime = 0;
let lastVelocity = 0;
let clickTimes: number[] = [];
let hesitationStart = 0;
let scrollPositions: number[] = [];
let isTracking = false;

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function dispatch<T>(name: string, detail: T) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

/* ------------------------------------------------------------------ */
/*  Handlers                                                           */
/* ------------------------------------------------------------------ */

function createMouseMoveHandler(socket: Socket | null) {
  return (e: MouseEvent) => {
    const now = performance.now();
    const dt = now - lastMouseTime;

    if (dt > 0 && lastMouseTime > 0) {
      const dist = distance(lastMouseX, lastMouseY, e.clientX, e.clientY);
      const velocity = dist / (dt / 1000); // px/s
      const acceleration = Math.abs(velocity - lastVelocity) / (dt / 1000);
      lastVelocity = velocity;

      if (dt > 200) {
        const payload = {
          velocity: Math.round(velocity),
          acceleration: Math.round(acceleration),
          x: e.clientX,
          y: e.clientY,
        };
        // Send to backend if connected
        socket?.emit('telemetry:mouse', payload);
        // Always update local UI
        dispatch('telemetry:mouse', { velocity: Math.round(velocity) });
      }
    }

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    lastMouseTime = now;
  };
}

function createClickHandler(socket: Socket | null) {
  return (e: MouseEvent) => {
    const now = Date.now();
    clickTimes.push(now);
    clickTimes = clickTimes.filter((t) => now - t < 1000);

    const target = e.target as HTMLElement;
    const fieldName =
      target.closest('[data-field]')?.getAttribute('data-field') ||
      target.closest('input, textarea, select')?.getAttribute('name') ||
      target.tagName.toLowerCase();

    if (clickTimes.length >= 3) {
      const payload = { field: fieldName, count: clickTimes.length, timestamp: now };
      socket?.emit('telemetry:rage_click', payload);
      dispatch('telemetry:rage_click', { field: fieldName, count: clickTimes.length });
      clickTimes = [];
    } else {
      socket?.emit('telemetry:click', { field: fieldName, timestamp: now });
    }
  };
}

function createFocusHandler() {
  return () => {
    hesitationStart = performance.now();
  };
}

function createKeypressHandler(socket: Socket | null) {
  return (e: KeyboardEvent) => {
    if (hesitationStart > 0) {
      const hesitationMs = performance.now() - hesitationStart;
      hesitationStart = 0;

      const target = e.target as HTMLElement;
      const fieldName =
        target.closest('[data-field]')?.getAttribute('data-field') ||
        (target as HTMLInputElement).name ||
        target.tagName.toLowerCase();

      if (hesitationMs > 500) {
        const payload = { field: fieldName, duration_ms: Math.round(hesitationMs) };
        socket?.emit('telemetry:hesitation', payload);
        // Always dispatch locally so the dashboard updates in real time
        dispatch('telemetry:hesitation', { duration_ms: Math.round(hesitationMs) });
      }
    }
  };
}

function createScrollHandler(socket: Socket | null) {
  return () => {
    const pos = window.scrollY;
    scrollPositions.push(pos);

    if (scrollPositions.length > 10) {
      scrollPositions = scrollPositions.slice(-10);
    }

    if (scrollPositions.length >= 4) {
      const recent = scrollPositions.slice(-4);
      let directionChanges = 0;
      for (let i = 1; i < recent.length - 1; i++) {
        const dir1 = recent[i] - recent[i - 1];
        const dir2 = recent[i + 1] - recent[i];
        if ((dir1 > 0 && dir2 < 0) || (dir1 < 0 && dir2 > 0)) directionChanges++;
      }

      if (directionChanges >= 2) {
        socket?.emit('telemetry:scroll_jitter', { direction_changes: directionChanges, timestamp: Date.now() });
        dispatch('telemetry:scroll_jitter', { direction_changes: directionChanges });
        scrollPositions = [];
      }
    }
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

let cleanupFn: (() => void) | null = null;

/**
 * Starts capturing real telemetry signals from the DOM.
 * Pass the Socket.IO socket when connected, or null to run
 * in local-only mode (events still update the dashboard).
 */
export function initTelemetryTracker(socket: Socket | null): () => void {
  if (isTracking) cleanupFn?.();

  const handleMouseMove = createMouseMoveHandler(socket);
  const handleClick = createClickHandler(socket);
  const handleFocus = createFocusHandler();
  const handleKeypress = createKeypressHandler(socket);
  const handleScroll = createScrollHandler(socket);

  document.addEventListener('mousemove', handleMouseMove, { passive: true });
  document.addEventListener('click', handleClick);
  document.addEventListener('focusin', handleFocus);
  document.addEventListener('keydown', handleKeypress);
  window.addEventListener('scroll', handleScroll, { passive: true });

  isTracking = true;

  cleanupFn = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('click', handleClick);
    document.removeEventListener('focusin', handleFocus);
    document.removeEventListener('keydown', handleKeypress);
    window.removeEventListener('scroll', handleScroll);
    isTracking = false;
    cleanupFn = null;
  };

  return cleanupFn;
}

/**
 * Start tracking in local-only mode (no backend socket required).
 * Live values will still update the dashboard via custom DOM events.
 */
export function initLocalTelemetryTracker(): () => void {
  return initTelemetryTracker(null);
}
