import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '@/components/layout/AppShell';
import { Button, Card } from '@/components/ui';
import { apiFetchAsGuest } from '@/lib/api-client';
import { captureAnalyticsEvent } from '@/lib/analytics';
import { useUiLanguage } from '@/lib/use-ui-language';

type InviteState = 'checking' | 'accepted' | 'invalid' | 'error';

export default function InviteLandingPage() {
  const router = useRouter();
  const language = useUiLanguage();
  const [state, setState] = useState<InviteState>('checking');

  useEffect(() => {
    const code = typeof router.query.code === 'string' ? router.query.code : '';
    if (!router.isReady || !code) return;

    const acceptInvite = async () => {
      try {
        const validation = await apiFetchAsGuest(`/referrals/${encodeURIComponent(code)}`);
        const status = validation.ok ? await validation.json() : { valid: false };
        if (!status.valid) {
          setState('invalid');
          captureAnalyticsEvent('referral_link_opened', { valid: false });
          return;
        }

        const applied = await apiFetchAsGuest('/referrals/apply', {
          method: 'POST',
          body: JSON.stringify({ inviteCode: code }),
        });
        if (!applied.ok) throw new Error(`Referral apply failed (${applied.status})`);
        const result = await applied.json();
        if (!result.rewarded) {
          setState('invalid');
          captureAnalyticsEvent('referral_link_opened', { valid: false });
          return;
        }

        await apiFetchAsGuest('/referrals/award', {
          method: 'POST',
          body: JSON.stringify({ inviteCode: code }),
        });
        setState('accepted');
        captureAnalyticsEvent('referral_link_opened', { valid: true });
      } catch (error) {
        console.error(error);
        setState('error');
      }
    };

    void acceptInvite();
  }, [router.isReady, router.query.code]);

  const ru = language === 'russian';
  const copy = {
    title: ru ? 'Вас пригласили в StoryHop' : 'You are invited to StoryHop',
    body: ru
      ? 'Здесь ребёнок читает и слушает интерактивные истории на английском, делает выборы и тренирует речь.'
      : 'Children read and listen to interactive English stories, make choices, and practice speaking.',
    accepted: ru ? 'Приглашение принято. Друг получит 10 кристаллов.' : 'Invite accepted. Your friend will receive 10 crystals.',
    invalid: ru ? 'Эта ссылка уже использована или недействительна.' : 'This invite link has already been used or is invalid.',
    error: ru ? 'Не удалось проверить приглашение. Попробуйте обновить страницу.' : 'Could not check this invite. Please refresh the page.',
    checking: ru ? 'Проверяем приглашение...' : 'Checking invite...',
    demo: ru ? 'Начать демо' : 'Start demo',
    story: ru ? 'Создать историю' : 'Create a story',
  };

  return (
    <AppShell shellVariant="framed" maxWidth="default">
      <main className="mx-auto max-w-xl py-6 sm:py-12">
        <Card padding="lg" className="text-center">
          <p className="text-sm font-semibold uppercase text-sh-forest">StoryHop</p>
          <h1 className="mt-3 font-story text-3xl font-bold text-sh-foreground">{copy.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-sh-muted">{copy.body}</p>
          <div className="mt-6 min-h-12 rounded-[var(--sh-radius)] bg-sh-forest-soft p-3 text-sm text-sh-foreground" aria-live="polite">
            {state === 'checking' && copy.checking}
            {state === 'accepted' && copy.accepted}
            {state === 'invalid' && copy.invalid}
            {state === 'error' && copy.error}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button href="/demo-story" variant="secondary" fullWidth>{copy.demo}</Button>
            <Button href="/seasons/new" fullWidth>{copy.story}</Button>
          </div>
        </Card>
      </main>
    </AppShell>
  );
}
