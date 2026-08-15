import { useEffect, useState } from 'react';
import Image from 'next/image';
import AppShell from '@/components/layout/AppShell';
import { Button, Card } from '@/components/ui';
import { imageAssets } from '@/data/image-assets';
import { apiFetchAsGuest } from '@/lib/api-client';
import { useUiLanguage } from '@/lib/use-ui-language';

export default function ReferralPage() {
  const language = useUiLanguage();
  const ru = language === 'russian';
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [hasSeasons, setHasSeasons] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [refRes, homeRes] = await Promise.all([
          apiFetchAsGuest('/referrals', { method: 'POST' }),
          apiFetchAsGuest('/users/me/home-summary'),
        ]);
        if (refRes.ok) setInviteLink((await refRes.json()).inviteLink || '');
        if (homeRes.ok) setHasSeasons(Boolean((await homeRes.json()).hasSeasons));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell showBottomNav hasSeasons={hasSeasons} maxWidth="default">
      <h1 className="mb-2 font-story text-2xl font-bold">{ru ? 'Пригласить друга' : 'Invite a friend'}</h1>
      <p className="mb-6 text-sm text-sh-muted">
        {ru ? 'Перешлите другу полную ссылку. После первого открытия вы получите 10 кристаллов.' : 'Send the full link to a friend. You receive 10 crystals after their first visit.'}
      </p>

      <div className="relative mb-6 h-48 overflow-hidden rounded-[var(--sh-radius)]">
        <Image src={imageAssets.referral.inviteKids} alt="" fill className="object-cover" sizes="100vw" />
      </div>

      <Card padding="md" className="mb-4 text-center">
        <div className="relative mx-auto mb-2 h-24 max-w-48 overflow-hidden rounded-[var(--sh-radius)]">
          <Image src={imageAssets.referral.chest} alt="" fill className="object-contain" sizes="192px" />
        </div>
        <p className="text-lg font-bold text-sh-forest">+10 {ru ? 'кристаллов' : 'crystals'}</p>
        <p className="mt-1 text-sm text-sh-muted">{ru ? 'за приглашённого друга' : 'for an invited friend'}</p>
      </Card>

      <Card padding="md" className="mb-4">
        <p className="mb-2 text-sm font-medium">{ru ? 'Ссылка приглашения' : 'Your invite link'}</p>
        {loading ? (
          <p className="text-sm text-sh-muted">{ru ? 'Создаём ссылку...' : 'Creating link...'}</p>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input readOnly value={inviteLink} className="min-w-0 flex-1 rounded-[var(--sh-radius)] border border-sh-border px-3 py-2 text-xs" />
            <Button onClick={copyLink} variant="secondary">{copied ? (ru ? 'Скопировано' : 'Copied') : (ru ? 'Копировать' : 'Copy')}</Button>
          </div>
        )}
      </Card>

      <Card padding="md">
        <p className="mb-2 text-sm font-medium">{ru ? 'Что увидит друг' : 'What your friend sees'}</p>
        <p className="text-xs leading-relaxed text-sh-muted">
          {ru ? 'Короткое знакомство со StoryHop, демо-историю и возможность создать собственный сезон. В сервисе нет рекламы и открытого чата.' : 'A short StoryHop introduction, a demo story, and a path to create a personal season. There are no ads or open chat.'}
        </p>
      </Card>

      <Button href="/settings" variant="ghost" fullWidth className="mt-6">{ru ? 'Назад к настройкам' : 'Back to settings'}</Button>
    </AppShell>
  );
}
