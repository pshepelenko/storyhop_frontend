import Image from 'next/image';
import type { BenefitItem } from './home-empty-copy';

type HomeBenefitCardProps = {
  title: string;
  titleClassName?: string;
  items: BenefitItem[];
  imageSrc: string;
  variant: 'kids' | 'parents';
};

const VARIANT_STYLES = {
  kids: {
    card: 'bg-gradient-to-br from-[#f5f3ff] via-[#faf5ff] to-[#ede9fe]',
    border: 'border-[#ddd6fe]/80',
    divider: 'divide-[#ddd6fe]/60',
    imageBg: 'bg-[#f5f3ff]',
  },
  parents: {
    card: 'bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-[#d1fae5]',
    border: 'border-[#a7f3d0]/80',
    divider: 'divide-[#a7f3d0]/60',
    imageBg: 'bg-[#ecfdf5]',
  },
};

export default function HomeBenefitCard({
  title,
  titleClassName = 'text-sh-lavender',
  items,
  imageSrc,
  variant,
}: HomeBenefitCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <article
      className={`rounded-2xl border ${styles.border} ${styles.card} shadow-[var(--sh-shadow-card)] overflow-hidden flex flex-col lg:flex-row lg:min-h-[300px] lg:items-stretch`}
    >
      <div className={`relative order-1 w-full aspect-[16/10] sm:aspect-[5/3] lg:order-2 lg:w-[280px] lg:shrink-0 lg:aspect-auto lg:min-h-[300px] ${styles.imageBg}`}>
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 280px"
          loading="lazy"
        />
      </div>

      <div className="order-2 lg:order-1 flex-1 min-w-0 p-5 sm:p-6 flex flex-col lg:justify-center">
        <h3 className={`text-lg font-semibold mb-3 ${titleClassName}`}>{title}</h3>

        <ul className={`flex flex-col divide-y ${styles.divider}`}>
          {items.map((item) => (
            <li key={item.title} className="py-3 first:pt-0 last:pb-0">
              <p className="font-semibold text-[15px] text-sh-foreground">{item.title}</p>
              <p className="text-sm text-sh-muted mt-1 leading-relaxed">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
