import { promises as fs } from 'fs';
import path from 'path';

type CsvRow = {
  row_id: string;
  session_id: string;
  user_id: string;
  device_type: string;
  form_step: string;
  field_name: string;
  mouse_velocity_px_s: number;
  mouse_acceleration_px_s2: number;
  hesitation_time_ms: number;
  time_on_field_ms: number;
  click_count: number;
  rage_click: number;
  click_error_rate: number;
  scroll_jitter_count: number;
  correction_count: number;
  previous_attempts: number;
  cognitive_load_score: number;
  ui_action_triggered: string;
  session_abandoned: number;
};

export type CognitiveLoadMetrics = {
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

let cachedMetrics: CognitiveLoadMetrics | null = null;

function parseCsvRow(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      insideQuotes = !insideQuotes;
    } else if (character === ',' && !insideQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += character;
    }
  }

  values.push(current.trim());
  return values;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvRow(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvRow(line);
    const record: Record<string, string> = {};

    headers.forEach((header, index) => {
      record[header] = values[index] ?? '';
    });

    return {
      row_id: record.row_id,
      session_id: record.session_id,
      user_id: record.user_id,
      device_type: record.device_type,
      form_step: record.form_step,
      field_name: record.field_name,
      mouse_velocity_px_s: Number.parseFloat(record.mouse_velocity_px_s || '0'),
      mouse_acceleration_px_s2: Number.parseFloat(record.mouse_acceleration_px_s2 || '0'),
      hesitation_time_ms: Number.parseFloat(record.hesitation_time_ms || '0'),
      time_on_field_ms: Number.parseFloat(record.time_on_field_ms || '0'),
      click_count: Number.parseInt(record.click_count || '0', 10),
      rage_click: Number.parseInt(record.rage_click || '0', 10),
      click_error_rate: Number.parseFloat(record.click_error_rate || '0'),
      scroll_jitter_count: Number.parseInt(record.scroll_jitter_count || '0', 10),
      correction_count: Number.parseInt(record.correction_count || '0', 10),
      previous_attempts: Number.parseInt(record.previous_attempts || '0', 10),
      cognitive_load_score: Number.parseFloat(record.cognitive_load_score || '0'),
      ui_action_triggered: record.ui_action_triggered,
      session_abandoned: Number.parseInt(record.session_abandoned || '0', 10),
    } satisfies CsvRow;
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export async function getCognitiveLoadMetrics(): Promise<CognitiveLoadMetrics> {
  if (cachedMetrics) {
    return cachedMetrics;
  }

  const csvPath = path.join(process.cwd(), 'data', 'auragen_cognitive_load_dataset.csv');
  const csvText = await fs.readFile(csvPath, 'utf8');
  const rows = parseCsv(csvText);

  if (rows.length === 0) {
    const fallback: CognitiveLoadMetrics = {
      averageCognitiveLoad: 0,
      interventionRate: 0,
      abandonmentRate: 0,
      topField: 'loan_amount',
      topAction: 'show_inline_hint',
      activityFeed: ['No telemetry rows were available.'],
      signalStrengths: [
        { label: 'Mouse hesitation', value: 0 },
        { label: 'Rage click rate', value: 0 },
        { label: 'Wizard conversion', value: 0 },
      ],
      averageHesitationMs: 0,
      averageClickErrorRate: 0,
      averageCorrectionCount: 0,
    };

    cachedMetrics = fallback;
    return fallback;
  }

  const totalSessions = new Set(rows.map((row) => row.session_id)).size;
  const abandonedSessions = new Set(rows.filter((row) => row.session_abandoned === 1).map((row) => row.session_id)).size;
  const interventionCount = rows.filter((row) => row.ui_action_triggered !== 'no_action').length;

  const totalCognitiveLoad = rows.reduce((sum, row) => sum + row.cognitive_load_score, 0);
  const averageCognitiveLoad = totalCognitiveLoad / rows.length;
  const interventionRate = Math.round((interventionCount / rows.length) * 100);
  const abandonmentRate = Math.round((abandonedSessions / totalSessions) * 100);

  const actionCounts = new Map<string, number>();
  rows.forEach((row) => {
    actionCounts.set(row.ui_action_triggered, (actionCounts.get(row.ui_action_triggered) ?? 0) + 1);
  });

  const topActionEntry = Array.from(actionCounts.entries()).sort((left, right) => right[1] - left[1])[0];
  const topAction = topActionEntry?.[0] ?? 'show_inline_hint';

  const fieldScores = new Map<string, { total: number; count: number }>();
  rows.forEach((row) => {
    const existing = fieldScores.get(row.field_name) ?? { total: 0, count: 0 };
    fieldScores.set(row.field_name, {
      total: existing.total + row.cognitive_load_score,
      count: existing.count + 1,
    });
  });

  const topFieldEntry = Array.from(fieldScores.entries()).sort((left, right) => {
    const leftAverage = left[1].total / left[1].count;
    const rightAverage = right[1].total / right[1].count;
    return rightAverage - leftAverage;
  })[0];

  const averageHesitationMs = rows.reduce((sum, row) => sum + row.hesitation_time_ms, 0) / rows.length;
  const averageClickErrorRate = rows.reduce((sum, row) => sum + row.click_error_rate, 0) / rows.length;
  const averageCorrectionCount = rows.reduce((sum, row) => sum + row.correction_count, 0) / rows.length;

  const topField = topFieldEntry?.[0] ?? 'loan_amount';
  const fieldAverage = topFieldEntry ? topFieldEntry[1].total / topFieldEntry[1].count : averageCognitiveLoad;

  const metrics: CognitiveLoadMetrics = {
    averageCognitiveLoad,
    interventionRate,
    abandonmentRate,
    topField,
    topAction,
    activityFeed: [
      `Observed ${interventionCount} adaptive interventions across ${rows.length} interactions.`,
      `Highest-friction focus is ${topField} with ${Math.round(fieldAverage)}% average load.`,
      `${abandonmentRate}% of recent sessions show abandonment risk.`,
    ],
    signalStrengths: [
      {
        label: 'Mouse hesitation',
        value: clamp(Math.round((averageHesitationMs / 2200) * 100), 20, 95),
      },
      {
        label: 'Rage click rate',
        value: clamp(Math.round(averageClickErrorRate * 100), 15, 92),
      },
      {
        label: 'Wizard conversion',
        value: clamp(Math.round(100 - abandonmentRate + averageCorrectionCount * 3), 28, 90),
      },
    ],
    averageHesitationMs,
    averageClickErrorRate,
    averageCorrectionCount,
  };

  cachedMetrics = metrics;
  return metrics;
}
