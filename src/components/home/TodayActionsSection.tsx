import { imageAssets } from '@/data/image-assets';
import type { TodayActionsDisplay } from '@/data/home-display';
import type { UiLanguage } from '@/lib/ui-language';
import { useUiLanguage } from '@/lib/use-ui-language';
import TodayActionCard from './TodayActionCard';
import { getHomeWithSeasonsCopy } from './home-with-seasons-copy';

type TodayActionsSectionProps = {
  seasonId: string;
  actions: TodayActionsDisplay;
  languageOverride?: UiLanguage;
};

export default function TodayActionsSection({ seasonId, actions, languageOverride }: TodayActionsSectionProps) {
  const detectedLanguage = useUiLanguage();
  const copy = getHomeWithSeasonsCopy(languageOverride ?? detectedLanguage);

  const cards = [
    {
      key: 'spelling',
      title: copy.spellingTitle,
      metric: copy.spellingMetric(actions.spellingAvailableWordsCount),
      caption:
        actions.spellingAvailableWordsCount > 0 ? copy.spellingCaptionAvailable : copy.spellingCaptionUnavailable,
      cta: copy.spellingCta,
      href: `/seasons/${seasonId}/practice/writing?entry=home-direct`,
      imageSrc: imageAssets.home.practice.writing,
      disabled: actions.spellingAvailableWordsCount === 0,
    },
    {
      key: 'speaking',
      title: copy.speakingTitle,
      metric: copy.speakingMetric(actions.speakingAvailablePhrasesCount),
      caption:
        actions.speakingAvailablePhrasesCount > 0 ? copy.speakingCaptionAvailable : copy.speakingCaptionUnavailable,
      cta: copy.speakingCta,
      href: `/seasons/${seasonId}/practice/speaking?entry=home-direct`,
      imageSrc: imageAssets.home.practice.speaking,
      disabled: actions.speakingAvailablePhrasesCount === 0,
    },
  ] as Array<{
    key: string;
    title: string;
    metric: string;
    caption: string;
    cta: string;
    href: string;
    imageSrc: string;
    disabled: boolean;
  }>;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-sh-foreground sm:text-2xl">{copy.todayTitle}</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <div key={card.key}>
            <TodayActionCard
              kind={card.key as 'spelling' | 'speaking'}
              title={card.title}
              metric={card.metric}
              caption={card.caption}
              cta={card.cta}
              href={card.href}
              imageSrc={card.imageSrc}
              disabled={card.disabled}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
