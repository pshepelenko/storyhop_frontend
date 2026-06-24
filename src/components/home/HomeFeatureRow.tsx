import Image from 'next/image';
import FeatureIcon from './FeatureIcon';
import { HomeFeature } from './home-features';

/** Mobile first-visit row: icon | text | thumbnail (mockup) */
export default function HomeFeatureRow({ feature }: { feature: HomeFeature }) {
  return (
    <div className="flex items-center gap-3 py-4 border-b border-[#ebe8e3] last:border-0">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${feature.iconBg}`}>
        <FeatureIcon type={feature.icon} className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0 pr-1">
        <p className="font-semibold text-[15px] text-sh-foreground leading-snug">{feature.title}</p>
        <p className="text-[13px] text-sh-muted mt-0.5 leading-snug">{feature.description}</p>
      </div>
      <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden shrink-0 bg-sh-background">
        <Image src={feature.image} alt="" fill className="object-cover" sizes="72px" />
      </div>
    </div>
  );
}

export function HomeFeatureList({ features }: { features: HomeFeature[] }) {
  return (
    <div className="bg-white rounded-2xl border border-[#ebe8e3] shadow-[var(--sh-shadow-card)] px-4">
      {features.map((f) => (
        <HomeFeatureRow key={f.key} feature={f} />
      ))}
    </div>
  );
}

/** Desktop first-visit: icon + text only (mockup 2x3 grid) */
export function HomeFeatureSimpleCard({ feature }: { feature: HomeFeature }) {
  return (
    <div className="bg-white rounded-2xl border border-[#ebe8e3] p-4 h-full">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 ${feature.iconBg}`}>
        <FeatureIcon type={feature.icon} className="w-5 h-5" />
      </div>
      <p className="font-semibold text-sm text-sh-foreground leading-snug">{feature.title}</p>
      <p className="text-xs text-sh-muted mt-1.5 leading-relaxed">{feature.description}</p>
    </div>
  );
}

/** Desktop returning: tinted card, image icon, text, illustration */
export function ExploreFeatureCard({
  feature,
  size = 'default',
}: {
  feature: HomeFeature;
  size?: 'default' | 'desktop-full';
}) {
  const full = size === 'desktop-full';

  return (
    <div
      className={`rounded-[var(--sh-radius)] border border-sh-border/60 flex flex-col items-center text-center h-full min-w-0 ${
        full ? 'p-3' : 'p-2.5'
      }`}
      style={{ backgroundColor: feature.cardColor }}
    >
      <div className={`relative shrink-0 mb-2 overflow-hidden rounded-full ${full ? 'w-10 h-10' : 'w-9 h-9'}`}>
        <Image src={feature.iconImage} alt="" fill className="object-cover" sizes={full ? '40px' : '36px'} />
      </div>
      <p className={`font-semibold leading-tight text-sh-foreground ${full ? 'text-xs' : 'text-[11px]'}`}>
        {feature.title}
      </p>
      <p className={`text-sh-muted mt-1 leading-tight flex-1 ${full ? 'text-[11px]' : 'text-[10px]'}`}>
        {feature.description}
      </p>
      <div
        className={`relative mt-2 w-full rounded-md overflow-hidden ${full ? 'h-[72px]' : 'h-14'}`}
        style={{ backgroundColor: feature.cardColor }}
      >
        <Image src={feature.exploreImage} alt="" fill className="object-contain object-bottom" sizes="160px" />
      </div>
    </div>
  );
}
