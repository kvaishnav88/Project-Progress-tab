"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { initTelemetryTracker, initLocalTelemetryTracker } from '@/lib/telemetry-tracker';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type TelemetryEvent = {
  id: string;
  timestamp: number;
  type: 'friction' | 'rage_click' | 'hesitation' | 'intervention' | 'info';
  message: string;
  value?: number;
};

export type TelemetryMetrics = {
  averageCognitiveLoad: number;
  interventionRate: number;
  abandonmentRate: number;
  topField: string;
  topAction: string;
  activityFeed: string[];
  signalStrengths: Array<{ label: string; value: number }>;
  averageHesitationMs: number;
  averageClickErrorRate: number;
  averageCorrectionCount: number;
};

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

/** Live values captured from the current user's actual session */
export type LiveSignals = {
  mouseVelocity: number;      // px/s — real-time mouse speed
  hesitationMs: number;       // ms — last hesitation before typing
  rageClickCount: number;     // count — rage clicks this session
  scrollJitterCount: number;  // count — scroll direction reversals this session
};

type TelemetryContextValue = {
  metrics: TelemetryMetrics | null;
  events: TelemetryEvent[];
  connectionStatus: ConnectionStatus;
  frictionScore: number;
  frictionHistory: number[];
  liveSignals: LiveSignals;
  loading: boolean;
};

const fallbackMetrics: TelemetryMetrics = {
  averageCognitiveLoad: 0,
  interventionRate: 0,
  abandonmentRate: 0,
  topField: 'loan_amount',
  topAction: 'show_inline_hint',
  activityFeed: ['Waiting for telemetry data...'],
  signalStrengths: [
    { label: 'Mouse hesitation', value: 0 },
    { label: 'Rage click rate', value: 0 },
    { label: 'Wizard conversion', value: 0 },
  ],
  averageHesitationMs: 0,
  averageClickErrorRate: 0,
  averageCorrectionCount: 0,
};

const defaultLiveSignals: LiveSignals = {
  mouseVelocity: 0,
  hesitationMs: 0,
  rageClickCount: 0,
  scrollJitterCount: 0,
};

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

let eventCounter = 0;

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [frictionScore, setFrictionScore] = useState(0);
  const [frictionHistory, setFrictionHistory] = useState<number[]>([]);
  const [liveSignals, setLiveSignals] = useState<LiveSignals>(defaultLiveSignals);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const trackerCleanupRef = useRef<(() => void) | null>(null);
  const localTrackerCleanupRef = useRef<(() => void) | null>(null);

  /* ---- Helper to add events ---- */
  const addEvent = useCallback(
    (type: TelemetryEvent['type'], message: string, value?: number) => {
      eventCounter += 1;
      const event: TelemetryEvent = {
        id: `live-${eventCounter}-${Date.now()}`,
        timestamp: Date.now(),
        type,
        message,
        value,
      };
      setEvents((prev) => [...prev.slice(-49), event]);
    },
    [],
  );

  /* ---- Always-on local tracker (works without backend socket) ---- */
  useEffect(() => {
    // Start capturing real mouse/click/hesitation data immediately
    // even before (or instead of) the WebSocket connecting
    localTrackerCleanupRef.current = initLocalTelemetryTracker();
    return () => {
      localTrackerCleanupRef.current?.();
    };
  }, []);

  /* ---- Fetch baseline metrics from the API route ---- */
  useEffect(() => {
    let cancelled = false;

    async function fetchBaseline() {
      try {
        const res = await fetch('/api/telemetry');
        const data = await res.json();
        if (!cancelled && data.ok && data.metrics) {
          setMetrics(data.metrics);

          const baseline = Math.round(data.metrics.averageCognitiveLoad);
          setFrictionScore(baseline);
          setFrictionHistory(
            Array.from({ length: 12 }, () =>
              Math.round(baseline + (Math.random() - 0.5) * 15),
            ),
          );

          const feedEvents: TelemetryEvent[] = (data.metrics.activityFeed as string[]).map(
            (msg: string) => {
              eventCounter += 1;
              return {
                id: `baseline-${eventCounter}`,
                timestamp: Date.now() - Math.random() * 60_000,
                type: 'info' as const,
                message: msg,
              };
            },
          );
          setEvents(feedEvents);
        }
      } catch {
        if (!cancelled) setMetrics(fallbackMetrics);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBaseline();
    return () => { cancelled = true; };
  }, []);

  /* ---- WebSocket + Tracker initialization ---- */
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket = io(socketUrl, {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;
    setConnectionStatus('connecting');
    socket.connect();

    /* ---- Connection events ---- */
    socket.on('connect', () => {
      setConnectionStatus('connected');
      addEvent('info', 'Live telemetry connected');

      // ✅ START the tracker now that the socket is live
      trackerCleanupRef.current = initTelemetryTracker(socket);
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      addEvent('info', 'Telemetry connection lost');
      // Stop tracker on disconnect
      trackerCleanupRef.current?.();
      trackerCleanupRef.current = null;
    });

    socket.on('reconnect_attempt', () => setConnectionStatus('connecting'));
    socket.on('connect_error', () => setConnectionStatus('disconnected'));

    /* ---- Server → client events (from backend processing) ---- */
    socket.on('friction', (payload: { score?: number; field?: string; action?: string }) => {
      const score = payload?.score ?? 0;
      setFrictionScore(score);
      setFrictionHistory((prev) => [...prev.slice(-19), score]);

      if (score > 70) {
        addEvent('friction', `High friction detected: ${score}% on ${payload?.field ?? 'unknown field'}`, score);
      }
      if (payload?.action && payload.action !== 'no_action') {
        addEvent('intervention', `AI intervention: ${payload.action.replace(/_/g, ' ')}`, score);
      }
    });

    socket.on('rage_click', (payload: { field?: string; count?: number }) => {
      addEvent('rage_click', `Rage click on ${payload?.field ?? 'unknown'} (${payload?.count ?? 0} clicks)`);
    });

    socket.on('hesitation', (payload: { field?: string; duration_ms?: number }) => {
      addEvent('hesitation', `Hesitation on ${payload?.field ?? 'unknown'}: ${payload?.duration_ms ?? 0}ms`);
    });

    /* ---- Client-side tracker → local state updates (no backend needed) ---- */
    // Mouse velocity — tracked locally, updated via custom event
    const handleMouseTelemetry = (e: CustomEvent<{ velocity: number }>) => {
      setLiveSignals((prev) => ({ ...prev, mouseVelocity: e.detail.velocity }));
    };

    // Hesitation — tracked locally
    const handleHesitationTelemetry = (e: CustomEvent<{ duration_ms: number }>) => {
      setLiveSignals((prev) => ({ ...prev, hesitationMs: e.detail.duration_ms }));
      addEvent('hesitation', `You hesitated for ${e.detail.duration_ms}ms before typing`);
    };

    // Rage click — tracked locally
    const handleRageClickTelemetry = (e: CustomEvent<{ count: number; field: string }>) => {
      setLiveSignals((prev) => ({ ...prev, rageClickCount: prev.rageClickCount + 1 }));
      addEvent('rage_click', `Rage click detected on ${e.detail.field} (${e.detail.count} clicks)`);
    };

    // Scroll jitter — tracked locally
    const handleScrollJitter = () => {
      setLiveSignals((prev) => ({ ...prev, scrollJitterCount: prev.scrollJitterCount + 1 }));
    };

    window.addEventListener('telemetry:mouse', handleMouseTelemetry as EventListener);
    window.addEventListener('telemetry:hesitation', handleHesitationTelemetry as EventListener);
    window.addEventListener('telemetry:rage_click', handleRageClickTelemetry as EventListener);
    window.addEventListener('telemetry:scroll_jitter', handleScrollJitter);

    return () => {
      trackerCleanupRef.current?.();
      socket.off('connect');
      socket.off('disconnect');
      socket.off('reconnect_attempt');
      socket.off('connect_error');
      socket.off('friction');
      socket.off('rage_click');
      socket.off('hesitation');
      socket.disconnect();
      socketRef.current = null;

      window.removeEventListener('telemetry:mouse', handleMouseTelemetry as EventListener);
      window.removeEventListener('telemetry:hesitation', handleHesitationTelemetry as EventListener);
      window.removeEventListener('telemetry:rage_click', handleRageClickTelemetry as EventListener);
      window.removeEventListener('telemetry:scroll_jitter', handleScrollJitter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ metrics, events, connectionStatus, frictionScore, frictionHistory, liveSignals, loading }),
    [metrics, events, connectionStatus, frictionScore, frictionHistory, liveSignals, loading],
  );

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error('useTelemetry must be used within a TelemetryProvider');
  return ctx;
}
