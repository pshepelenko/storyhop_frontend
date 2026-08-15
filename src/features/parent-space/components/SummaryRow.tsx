import { imageAssets } from '@/data/image-assets';
import { formatAudioDuration, type ParentSpaceCopy } from '../parent-space-copy';
import type { ParentSpaceView } from '../types';

type Props = {
  data: ParentSpaceView;
  copy: ParentSpaceCopy;
};

const CARDS = [
  {
    key: 'listening' as const,
    icon: imageAssets.parent.summaryListening,
    accent: 'bg-[#e8f5ee] text-sh-forest',
    value: (data: ParentSpaceView) => formatAudioDuration(data.overview.englishAudioListenedMinutes),
    label: (copy: ParentSpaceCopy) => copy.summaryListening,
    delta: (data: ParentSpaceView) => data.deltas.audioListenedPercent,
  },
  {
    key: 'speaking' as const,
    icon: imageAssets.parent.summarySpeaking,
    accent: 'bg-[#e8f1fb] text-[#2f6fb0]',
    value: (data: ParentSpaceView) => `${data.overview.speakingSuccessful}`,
    label: (copy: ParentSpaceCopy) => copy.summarySpeaking,
    delta: (data: ParentSpaceView) => data.deltas.speakingSuccessfulPercent,
  },
  {
    key: 'vocab' as const,
    icon: imageAssets.parent.summaryVocab,
    accent: 'bg-[#fff1e4] text-[#c56a2b]',
    value: (data: ParentSpaceView) =>
      `${data.vocabulary.successfulAttempts}/${data.vocabulary.totalAttempts || data.overview.vocabularyPracticed || 0}`,
    label: (copy: ParentSpaceCopy) => copy.summaryVocab,
    delta: (data: ParentSpaceView) => data.deltas.vocabularyPracticedPercent,
  },
];

export default function SummaryRow({ data, copy }: Props) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-3 lg:mb-7 lg:gap-4">
      {CARDS.map((card) => (
        <article
          key={card.key}
          className="flex items-start gap-3 rounded-[22px] border border-[#e9e3d8] bg-white p-4 shadow-[0_10px_28px_rgba(33,57,43,0.05)]"
        >
          <div className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl ${card.accent}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.icon} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-story text-[28px] font-bold leading-none text-sh-foreground">
              {card.value(data)}
              {card.key === 'speaking' && (
                <span className="ml-1 text-sm font-medium text-sh-muted">{copy.successful.toLowerCase()}</span>
              )}
              {card.key === 'vocab' && (
                <span className="ml-1 text-sm font-medium text-sh-muted">{copy.attemptsSuccessful.toLowerCase()}</span>
              )}
            </p>
            <p className="mt-1 text-sm text-sh-foreground/80">{card.label(copy)}</p>
            <p
              className={`mt-2 text-xs font-medium ${
                card.delta(data) > 0
                  ? 'text-sh-forest'
                  : card.delta(data) < 0
                    ? 'text-rose-600'
                    : 'text-sh-muted'
              }`}
            >
              {copy.vsLastPeriod(card.delta(data))}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
