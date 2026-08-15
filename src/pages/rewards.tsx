import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useUiLanguage } from '@/lib/use-ui-language';
import { apiFetchAsGuest } from '@/lib/api-client';
import { getHomeWithSeasonsCopy } from '@/components/home/home-with-seasons-copy';

type RewardsSummary = {
  hasSeasons: boolean;
  crystalBalance: number;
  todayActions?: {
    rewardsCount: number;
  };
};

export default function RewardsPage() {
  const lang = useUiLanguage();
  const copy = getHomeWithSeasonsCopy(lang);
  const [summary, setSummary] = useState<RewardsSummary | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetchAsGuest('/users/me/home-summary');
        if (res.ok) {
          setSummary(await res.json());
        }
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  const rewardsCount = summary?.todayActions?.rewardsCount ?? summary?.crystalBalance ?? 0;

  return (
    <AppShell
      crystalBalance={summary?.crystalBalance}
      hasSeasons={summary?.hasSeasons ?? true}
      showBottomNav
      maxWidth="wide"
      shellVariant={summary?.hasSeasons ? 'framed' : 'default'}
      plainBackground
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-sh-foreground sm:text-3xl">{copy.rewardsPageTitle}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-sh-muted sm:text-base">{copy.rewardsPageBody}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="rounded-[var(--sh-radius-lg)] p-5 sm:p-6">
            <div className="inline-flex rounded-full bg-sh-forest-soft px-4 py-2 text-sm font-semibold text-sh-forest">
              💎 {copy.rewardsAvailable(rewardsCount)}
            </div>
            <p className="mt-4 text-base leading-7 text-sh-foreground">{copy.rewardsPageHint}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href="/referral">{copy.rewardsOpenReferral}</Button>
              <Button href="/settings" variant="secondary">{copy.rewardsOpenSettings}</Button>
            </div>
          </Card>

          <Card className="rounded-[var(--sh-radius-lg)] p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-sh-muted">{copy.rewardsInvite}</p>
            <p className="mt-3 text-4xl font-semibold text-sh-foreground">{summary?.crystalBalance ?? 0}</p>
            <p className="mt-2 text-sm text-sh-muted">{lang === 'russian' ? 'Текущий баланс кристаллов' : 'Current crystal balance'}</p>
            <Button href="/referral" className="mt-5 w-full">
              {copy.rewardsInvite}
            </Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
