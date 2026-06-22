import { useRef, useState } from 'react';
import { Modal, Stack, Button } from '@mantine/core';
import { IconFileText, IconPhoto, IconTable } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { toPng } from 'html-to-image';
import type { AppConfig, DayEntry } from '@/types';
import { downloadBlob } from '@/lib/downloadBlob';
import { buildDailySummary } from './buildDailySummary';
import { dailySummaryToCsv, dailySummaryToText } from './dailySummaryFormats';
import { DailySummaryCard } from './DailySummaryCard';

interface Props {
  opened: boolean;
  onClose: () => void;
  day: DayEntry;
  config: AppConfig;
  dateLabel: string;
}

async function shareOrDownload(blob: Blob, filename: string, mimeType: string): Promise<void> {
  const file = new File([blob], filename, { type: mimeType });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] });
  } else {
    downloadBlob(blob, filename);
  }
}

export function ExportLogModal({ opened, onClose, day, config, dateLabel }: Props) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<'image' | 'table' | 'text' | null>(null);

  const summary = buildDailySummary(day, config, t, dateLabel);

  async function run(kind: 'image' | 'table' | 'text', action: () => Promise<void>) {
    setBusy(kind);
    try {
      await action();
      onClose();
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        notifications.show({ message: t('dailyLog.exportFailed'), color: 'red' });
      }
    } finally {
      setBusy(null);
    }
  }

  const onImage = () =>
    run('image', async () => {
      if (!cardRef.current) return;
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      await shareOrDownload(blob, `spoony-${summary.isoDate}.png`, 'image/png');
    });

  const onTable = () =>
    run('table', async () => {
      const blob = new Blob([dailySummaryToCsv(summary, t)], { type: 'text/csv' });
      await shareOrDownload(blob, `spoony-${summary.isoDate}.csv`, 'text/csv');
    });

  const onText = () =>
    run('text', async () => {
      const text = dailySummaryToText(summary, t);
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        notifications.show({ message: t('dailyLog.exportCopied'), color: 'spoon' });
      }
    });

  return (
    <Modal opened={opened} onClose={onClose} title={t('dailyLog.exportTitle')}>
      <Stack>
        <Button
          variant="light"
          justify="start"
          leftSection={<IconPhoto size={18} />}
          loading={busy === 'image'}
          onClick={() => void onImage()}
        >
          {t('dailyLog.exportImage')}
        </Button>
        <Button
          variant="light"
          justify="start"
          leftSection={<IconTable size={18} />}
          loading={busy === 'table'}
          onClick={() => void onTable()}
        >
          {t('dailyLog.exportTable')}
        </Button>
        <Button
          variant="light"
          justify="start"
          leftSection={<IconFileText size={18} />}
          loading={busy === 'text'}
          onClick={() => void onText()}
        >
          {t('dailyLog.exportText')}
        </Button>
      </Stack>

      {/* Off-screen capture target for the image export — must stay laid out (not display:none). */}
      <div style={{ position: 'fixed', top: 0, left: -9999, pointerEvents: 'none' }} aria-hidden>
        <DailySummaryCard ref={cardRef} summary={summary} />
      </div>
    </Modal>
  );
}
