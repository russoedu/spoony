import type { DailySummary } from './buildDailySummary';

type Translate = (key: string) => string;

function csvCell(value: string | number | undefined): string {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function dailySummaryToCsv(summary: DailySummary, t: Translate): string {
  const rows: (string | number | undefined)[][] = [
    [t('dailyLog.spoonsWokeUp'), summary.balance.wakeup],
    [t('dailyLog.balancePlanned'), summary.balance.plannedBalance],
    [t('dailyLog.balanceUsed'), summary.balance.usedBalance],
    [],
    [t('dailyLog.activityLabel'), t('common.type'), t('dailyLog.estimated'), t('dailyLog.used')],
  ];

  for (const item of summary.items) {
    if (item.kind === 'counted') {
      rows.push([
        item.label,
        item.type === 'gives' ? t('dailyLog.typeGives') : t('dailyLog.typeTakes'),
        item.estimated,
        item.used,
      ]);
    } else if (item.kind === 'numeric') {
      rows.push([item.label, t('dailyLog.typeScale'), undefined, item.value]);
    }
  }

  if (summary.notes.length > 0) {
    rows.push([]);
    rows.push([t('dailyLog.feelSection')]);
    for (const note of summary.notes) rows.push([note.label, note.text]);
  }

  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
}

export function dailySummaryToText(summary: DailySummary, t: Translate): string {
  const lines: string[] = [`Spoony — ${summary.dateLabel}`, ''];

  if (summary.wakeTime) lines.push(`${t('dailyLog.wokeUpAt')}: ${summary.wakeTime}`);
  lines.push(`${t('dailyLog.spoonsWokeUp')}: ${summary.balance.wakeup}`);
  lines.push(`${t('dailyLog.balancePlanned')}: ${summary.balance.plannedBalance}`);
  lines.push(`${t('dailyLog.balanceUsed')}: ${summary.balance.usedBalance}`);

  if (summary.items.length > 0) {
    lines.push('');
    for (const item of summary.items) {
      if (item.kind === 'counted') {
        const parts = [
          item.estimated !== undefined ? `${t('dailyLog.estimated')} ${item.estimated}` : null,
          item.used !== undefined
            ? `${item.type === 'gives' ? t('dailyLog.gained') : t('dailyLog.used')} ${item.used}`
            : null,
        ].filter(Boolean);
        lines.push(`- ${item.label}${parts.length ? `: ${parts.join(', ')}` : ''}`);
      } else if (item.kind === 'numeric') {
        lines.push(`- ${item.label}: ${item.value ?? '–'}/${item.max}`);
      }
    }
  }

  if (summary.notes.length > 0) {
    lines.push('', `${t('dailyLog.feelSection')}:`);
    for (const note of summary.notes) lines.push(`${note.label}: ${note.text}`);
  }

  return lines.join('\n');
}
