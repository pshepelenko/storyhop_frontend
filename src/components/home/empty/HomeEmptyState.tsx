import { imageAssets } from '@/data/image-assets';
import { useUiLanguage } from '@/lib/use-ui-language';
import HomeBenefitCard from './HomeBenefitCard';
import HomeEmptyCtaBlocks from './HomeEmptyCtaBlocks';
import HomeEmptyHero from './HomeEmptyHero';
import { getHomeEmptyCopy } from './home-empty-copy';

export default function HomeEmptyState() {
  const lang = useUiLanguage();
  const copy = getHomeEmptyCopy(lang);

  return (
    <div className="min-w-0 w-full max-w-full space-y-7">
      <HomeEmptyHero copy={copy} />

      <section>
        <h2 className="text-xl font-semibold text-sh-foreground mb-4">{copy.benefitsSectionTitle}</h2>
        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <HomeBenefitCard
            title={copy.forKidsTitle}
            titleClassName="text-sh-lavender"
            items={copy.kidsBenefits}
            imageSrc={imageAssets.home.benefits.forKids}
            variant="kids"
          />
          <HomeBenefitCard
            title={copy.forParentsTitle}
            titleClassName="text-sh-forest"
            items={copy.parentsBenefits}
            imageSrc={imageAssets.home.benefits.forParents}
            variant="parents"
          />
        </div>
      </section>

      <HomeEmptyCtaBlocks copy={copy} />
    </div>
  );
}
