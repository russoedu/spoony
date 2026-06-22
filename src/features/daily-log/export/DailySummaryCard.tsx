import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { DailySummary } from './buildDailySummary';

interface Props {
  summary: DailySummary;
}

const card: React.CSSProperties = {
  width: 480,
  padding: 24,
  background: '#ffffff',
  color: '#23232b',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
};

/**
 * A plain-HTML (no Mantine inputs) read-only rendering of one day's log, used
 * only as the capture target for the PNG export — native form controls don't
 * reliably rasterize via DOM-to-image libraries, so this avoids that entirely.
 */
export const DailySummaryCard = forwardRef<HTMLDivElement, Props>(function DailySummaryCard(
  { summary },
  ref
) {
  const { t } = useTranslation();
  return (
    <div ref={ref} style={card}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Spoony</div>
      <div style={{ fontSize: 14, color: '#6b6b76', marginBottom: 16 }}>{summary.dateLabel}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Stat label={t('dailyLog.spoonsWokeUp')} value={summary.balance.wakeup} />
        <Stat label={t('dailyLog.balancePlanned')} value={summary.balance.plannedBalance} />
        <Stat
          label={t('dailyLog.balanceUsed')}
          value={summary.balance.usedBalance}
          color={summary.balance.usedBalance < 0 ? '#e03131' : undefined}
        />
      </div>

      {summary.items.length > 0 && (
        <div style={{ marginBottom: summary.notes.length > 0 ? 16 : 0 }}>
          {summary.items.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid #ececef',
                fontSize: 14,
              }}
            >
              <span>{item.label}</span>
              <span style={{ color: '#6b6b76' }}>
                {item.kind === 'numeric'
                  ? `${item.value ?? '–'}/${item.max}`
                  : [
                      item.estimated !== undefined ? `${t('dailyLog.estimated')} ${item.estimated}` : null,
                      item.used !== undefined
                        ? `${item.type === 'gives' ? t('dailyLog.gained') : t('dailyLog.used')} ${item.used}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
              </span>
            </div>
          ))}
        </div>
      )}

      {summary.notes.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b6b76', marginBottom: 6 }}>
            {t('dailyLog.feelSection')}
          </div>
          {summary.notes.map((note, i) => (
            <div key={i} style={{ fontSize: 14, marginBottom: 6 }}>
              <strong>{note.label}:</strong> {note.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#6b6b76' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
