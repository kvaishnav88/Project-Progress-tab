import { NextResponse } from 'next/server';
import { getCognitiveLoadMetrics } from '@/lib/cognitive-load-data';

/**
 * GET /api/telemetry
 *
 * Bridges the server-only CSV data to client components.
 * The TelemetryContext fetches from this route on mount to get baseline metrics.
 */
export async function GET() {
  try {
    const metrics = await getCognitiveLoadMetrics();
    return NextResponse.json({ ok: true, metrics });
  } catch (error) {
    console.error('Failed to load telemetry metrics:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to load metrics' },
      { status: 500 },
    );
  }
}
