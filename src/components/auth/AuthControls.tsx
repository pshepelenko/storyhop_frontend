import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import { apiFetch } from '@/lib/api-client';
import { useUiLanguage } from '@/lib/use-ui-language';
import { identifyAnalyticsUser, resetAnalyticsUser } from '@/lib/analytics';

export default function AuthControls() {
  const router = useRouter();
  const lang = useUiLanguage();
  const [email, setEmail] = useState<string | null>(null);
  const ru = lang === 'russian';
  useEffect(() => { void apiFetch('/auth/me').then((response) => response.ok ? response.json() : null).then((data) => { setEmail(data?.authenticated ? data.email : null); identifyAnalyticsUser(data?.analyticsId, data?.accountType); }).catch(() => undefined); }, []);
  const logout = async () => { await apiFetch('/auth/logout', { method: 'POST' }); resetAnalyticsUser(); await router.replace('/'); };
  if (!email) return <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
    <Button href="/signup" variant="accent" className="h-8 min-h-0 shrink-0 rounded-lg px-3 py-1 text-xs sm:px-4 sm:text-[13px]">{ru ? 'Регистрация' : 'Sign up'}</Button>
    <Button href="/login" variant="secondary" className="h-8 min-h-0 shrink-0 rounded-lg px-3 py-1 text-xs sm:px-4 sm:text-[13px]">{ru ? 'Войти' : 'Log in'}</Button>
  </div>;
  return <div className="flex shrink-0 items-center gap-2">
    <span className="ph-sensitive hidden max-w-40 truncate text-sm text-sh-muted sm:inline">{email}</span>
    <Button variant="secondary" onClick={logout} className="h-8 min-h-0 shrink-0 rounded-lg px-3 py-1 text-xs sm:text-[13px]">{ru ? 'Выйти' : 'Log out'}</Button>
  </div>;
}
