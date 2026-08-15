import Image from 'next/image';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { Button, Card } from '@/components/ui';

type TodayActionCardProps = {
  kind: 'spelling' | 'speaking';
  title: string;
  metric: string;
  caption: string;
  cta: string;
  href: string;
  imageSrc: string | StaticImport;
  disabled?: boolean;
};

export default function TodayActionCard({
  kind,
  title,
  metric,
  caption,
  cta,
  href,
  imageSrc,
  disabled = false,
}: TodayActionCardProps) {
  const artFrameClassName = '!border-transparent !bg-transparent !shadow-none';
  const actionButtonClassName =
    kind === 'speaking'
      ? '!border-sh-lavender !text-sh-lavender hover:!bg-sh-lavender/12'
      : '';

  return (
    <Card
      className={[
        'flex h-full flex-col justify-between rounded-[20px] border-sh-border/80 p-5',
        disabled ? 'opacity-90' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-4">
        <div
          className={[
            'relative flex h-[92px] w-[92px] shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]',
            artFrameClassName,
          ].join(' ')}
        >
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-contain p-2"
            sizes="92px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-6 text-sh-foreground sm:text-[1.1rem]">{title}</h3>
          <p className="mt-3 text-lg font-semibold leading-6 text-sh-foreground">{metric}</p>
          <p className="mt-1 text-sm leading-5 text-sh-muted">{caption}</p>
        </div>
      </div>

      <Button
        href={disabled ? undefined : href}
        disabled={disabled}
        variant={disabled ? 'soft' : 'secondary'}
        className={[
          'mt-5 w-full !min-h-[48px] rounded-[14px] px-4 text-sm font-semibold',
          disabled ? '!bg-sh-border-subtle !text-sh-muted' : '',
          !disabled ? actionButtonClassName : '',
        ].join(' ')}
      >
        {cta}
      </Button>
    </Card>
  );
}
