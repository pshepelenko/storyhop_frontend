import Image from 'next/image';
import { imageAssets } from '@/data/image-assets';
import { ActiveSeasonDisplay } from '@/data/home-display';

type SeasonStatsRowProps = {
  display: ActiveSeasonDisplay;
  embedded?: boolean;
};

export default function SeasonStatsRow({ display, embedded = false }: SeasonStatsRowProps) {
  const readyLabel = `Episode ${display.readyEpisode}`;
  const { readiness } = display;

  const items: {
    label: string;
    sub: string;
    ok: boolean;
    iconSrc: string;
  }[] = [
    {
      label: 'Episodes',
      sub: readyLabel,
      ok: !readiness.nextEpisodePreparing,
      iconSrc: imageAssets.home.statsIcons.episodes,
    },
    {
      label: 'Audio',
      sub: readyLabel,
      ok: readiness.audioReady,
      iconSrc: imageAssets.home.statsIcons.audio,
    },
    {
      label: 'Illustrations',
      sub: readyLabel,
      ok: readiness.illustrationReady,
      iconSrc: imageAssets.home.statsIcons.illustrations,
    },
    {
      label: 'All set!',
      sub: readiness.allReady ? "You're good to go." : 'Almost there.',
      ok: readiness.allReady,
      iconSrc: imageAssets.home.statsIcons.allSet,
    },
  ];

  return (
    <div
      className={
        embedded
          ? 'border-t border-sh-border pt-4 flex'
          : 'bg-white rounded-[var(--sh-radius-lg)] border border-sh-border shadow-[var(--sh-shadow-card)] px-2 py-4 flex'
      }
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`flex flex-col items-center flex-1 text-center min-w-0 px-1 ${
            index > 0 ? 'border-l border-sh-border' : ''
          }`}
        >
          <div
            className={`relative w-9 h-9 rounded-full overflow-hidden mb-1.5 ${
              item.ok ? '' : 'opacity-50'
            }`}
          >
            <Image src={item.iconSrc} alt="" fill className="object-cover" sizes="36px" />
          </div>
          <p className="text-[11px] font-semibold text-sh-foreground leading-tight">{item.label}</p>
          <p className="text-[10px] text-sh-muted leading-tight mt-0.5 px-0.5">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}
