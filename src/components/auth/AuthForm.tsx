import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppShell from '@/components/layout/AppShell';
import LanguageSelector from '@/components/home/LanguageSelector';
import { Button, Card } from '@/components/ui';
import { apiFetch, ensureGuestSession } from '@/lib/api-client';
import { useUiLanguage } from '@/lib/use-ui-language';
import { captureAnalyticsEvent, identifyAnalyticsUser } from '@/lib/analytics';

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const lang = useUiLanguage();
  const ru = lang === 'russian';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isSignup = mode === 'signup';

  useEffect(() => { if (isSignup) void ensureGuestSession().catch(() => undefined); }, [isSignup]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError(null);
    captureAnalyticsEvent(`auth_${mode}_started`);
    try {
      const response = await apiFetch(`/auth/${mode}`, { method: 'POST', body: JSON.stringify({ email, password }) });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      identifyAnalyticsUser(data.analyticsId, data.accountType);
      captureAnalyticsEvent(`auth_${mode}_completed`);
      await router.replace('/');
    } catch (cause) {
      captureAnalyticsEvent(`auth_${mode}_failed`);
      setError(cause instanceof Error ? cause.message : (ru ? 'Не удалось продолжить' : 'Could not continue'));
    } finally { setBusy(false); }
  };

  return (
    <AppShell emptyHomeLayout headerRight={<LanguageSelector />}>
      <Card className="mx-auto my-8 max-w-md" padding="lg">
        <h1 className="font-story text-3xl text-sh-foreground">{isSignup ? (ru ? 'Создать аккаунт' : 'Create account') : (ru ? 'Войти' : 'Log in')}</h1>
        <p className="mt-2 text-sm leading-6 text-sh-muted">{isSignup ? (ru ? 'Сохраните сезоны и прогресс в аккаунте.' : 'Keep your seasons and progress in an account.') : (ru ? 'Продолжите свои истории.' : 'Continue your stories.')}</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-semibold text-sh-foreground">Email<input className="mt-1.5 min-h-[var(--sh-tap-min)] w-full rounded-[var(--sh-radius)] border border-sh-border px-3 text-base" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
          <label className="block text-sm font-semibold text-sh-foreground">{ru ? 'Пароль' : 'Password'}<input className="mt-1.5 min-h-[var(--sh-tap-min)] w-full rounded-[var(--sh-radius)] border border-sh-border px-3 text-base" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={8} maxLength={72} required /></label>
          {error && <p role="alert" className="rounded-[var(--sh-radius)] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button fullWidth disabled={busy}>{busy ? (ru ? 'Проверяем...' : 'Working...') : (isSignup ? (ru ? 'Создать аккаунт' : 'Create account') : (ru ? 'Войти' : 'Log in'))}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-sh-muted">{isSignup ? (ru ? 'Уже есть аккаунт?' : 'Already have an account?') : (ru ? 'Впервые в StoryHop?' : 'New to StoryHop?')} <Link className="font-semibold text-sh-forest" href={isSignup ? '/login' : '/signup'}>{isSignup ? (ru ? 'Войти' : 'Log in') : (ru ? 'Создать аккаунт' : 'Create account')}</Link></p>
      </Card>
    </AppShell>
  );
}
