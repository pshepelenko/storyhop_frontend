import FeatureIcon from './FeatureIcon';
import { HomeFeature } from './home-features';

type ReadinessPillsProps = {
  episodeNumber: number;
  readiness: {
    nextEpisodePreparing: boolean;
    audioReady: boolean;
    illustrationReady?: boolean;
    allReady: boolean;
  };
};

export default function ReadinessPills({ episodeNumber, readiness }: ReadinessPillsProps) {
  const readyLabel = `Episode ${episodeNumber}`;

  const items: { label: string; sub: string; ok: boolean; icon: HomeFeature['icon'] | 'check' }[] = [
    { label: 'Episodes', sub: readyLabel, ok: !readiness.nextEpisodePreparing, icon: 'storybook' },
    { label: 'Audio', sub: readyLabel, ok: readiness.audioReady, icon: 'audio' },
    { label: 'Illustrations', sub: readyLabel, ok: readiness.illustrationReady ?? !readiness.nextEpisodePreparing, icon: 'progress' },
    { label: 'All set!', sub: '', ok: readiness.allReady, icon: 'check' },
  ];

  return (
    <div className="flex justify-between gap-1 mt-4 pt-4 border-t border-[#ebe8e3]">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center flex-1 text-center min-w-0">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${
              item.ok ? 'bg-[#e8f5ec] text-sh-forest' : 'bg-[#f0eeea] text-sh-muted'
            }`}
          >
            {item.icon === 'check' ? (
              <span className="text-sm">{item.ok ? '☺' : '…'}</span>
            ) : (
              <FeatureIcon type={item.icon} className="w-3.5 h-3.5" />
            )}
          </div>
          <p className="text-[9px] sm:text-[10px] font-semibold text-sh-foreground leading-tight">{item.label}</p>
          {item.sub && <p className="text-[8px] sm:text-[9px] text-sh-muted leading-tight mt-0.5">{item.sub}</p>}
        </div>
      ))}
    </div>
  );
}
