import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Button, Card, SegmentedControl, SettingsRow } from '@/components/ui';
import { getUiLanguage, setUiLanguage, type UiLanguage } from '@/lib/ui-language';
import { apiFetchAsGuest } from '@/lib/api-client';

type SettingsData = {
  profile: { complete: boolean; displayName: string; age: number; gender: 'girl' | 'boy'; englishLevel: 'A1' | 'A2' | 'B1' } | null;
  preferences: { interfaceLanguage: UiLanguage; playbackRate: number; readingTextSize: 'small' | 'medium' | 'large' };
  account: { accountType: 'guest' | 'account'; email: string | null };
};

const sectionTitle = 'px-4 pt-4 pb-2 text-sm font-bold text-sh-forest';

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void apiFetchAsGuest('/users/me/settings').then(async (response) => {
      if (!response.ok) throw new Error('Settings unavailable');
      setData(await response.json());
    }).catch(() => setData(null));
  }, []);

  const updatePreferences = async (next: Partial<SettingsData['preferences']>) => {
    if (!data || saving) return;
    setSaving(true);
    const response = await apiFetchAsGuest('/users/me/preferences', { method: 'PATCH', body: JSON.stringify(next) });
    setSaving(false);
    if (!response.ok) return;
    const preferences = await response.json();
    setData((current) => current ? { ...current, preferences } : current);
    if (preferences.interfaceLanguage) setUiLanguage(preferences.interfaceLanguage);
    if (preferences.playbackRate) {
      localStorage.setItem('storyhop_playbackRate', String(preferences.playbackRate));
      window.dispatchEvent(new CustomEvent('storyhop:audio-preference-change'));
    }
    if (preferences.readingTextSize) {
      localStorage.setItem('storyhop_readingTextSize', preferences.readingTextSize);
      window.dispatchEvent(new CustomEvent('storyhop:reading-preference-change'));
    }
  };

  const profile = data?.profile;
  const preferences = data?.preferences || { interfaceLanguage: getUiLanguage(), playbackRate: 1, readingTextSize: 'medium' as const };
  const hasSeasons = Boolean(profile?.complete);

  return (
    <AppShell showBottomNav hasSeasons={hasSeasons} shellVariant="framed" maxWidth="wide">
      <div className="mx-auto max-w-5xl py-2 sm:py-6">
        <h1 className="font-story text-3xl font-bold text-sh-foreground">Настройки</h1>
        <p className="mt-2 text-sm text-sh-muted">Профиль ребёнка, чтение и аккаунт.</p>
        {!data ? <p className="mt-8 text-sm text-sh-muted">Загружаем настройки...</p> : <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card padding="none" className="ph-sensitive overflow-hidden">
            <div className={sectionTitle}>Профиль ребёнка</div>
            <SettingsRow label={profile?.displayName || 'Профиль ещё не заполнен'} description={profile?.complete ? `${profile.age} лет · ${profile.gender === 'girl' ? 'девочка' : 'мальчик'} · ${profile.englishLevel}` : 'Заполните профиль перед созданием сезона'} href="/settings/child-profile" />
            <div className="px-4 pb-4 text-xs text-sh-muted">Изменения будут применяться только к новым сезонам.</div>
          </Card>

          <Card padding="none" className="overflow-hidden">
            <div className={sectionTitle}>Чтение</div>
            <div className="px-4 pb-4 space-y-4">
              <section>
                <p className="mb-2 text-sm font-medium text-sh-foreground">Скорость аудио</p>
                <SegmentedControl ariaLabel="Скорость аудио" value={String(preferences.playbackRate)} onChange={(value) => void updatePreferences({ playbackRate: Number(value) })} segments={[{ value: '0.9', label: 'Медленнее', description: '0.9×' }, { value: '1', label: 'Обычная', description: '1×' }, { value: '1.15', label: 'Быстрее', description: '1.15×' }]} />
              </section>
              <section>
                <p className="mb-2 text-sm font-medium text-sh-foreground">Размер текста</p>
                <SegmentedControl ariaLabel="Размер текста" value={preferences.readingTextSize} onChange={(value) => void updatePreferences({ readingTextSize: value as 'small' | 'medium' | 'large' })} segments={[{ value: 'small', label: 'Маленький' }, { value: 'medium', label: 'Средний' }, { value: 'large', label: 'Крупный' }]} />
              </section>
            </div>
          </Card>

          <Card padding="none" className="overflow-hidden">
            <div className={sectionTitle}>Приложение и аккаунт</div>
            <div className="px-4 pb-4 space-y-4">
              <section>
                <p className="mb-2 text-sm font-medium text-sh-foreground">Язык интерфейса</p>
                <SegmentedControl ariaLabel="Язык интерфейса" value={preferences.interfaceLanguage} onChange={(value) => void updatePreferences({ interfaceLanguage: value as UiLanguage })} segments={[{ value: 'russian', label: 'Русский' }, { value: 'english', label: 'English' }]} />
                <p className="mt-2 text-xs text-sh-muted">Язык историй всегда English.</p>
              </section>
              {data.account.accountType === 'account' ? <SettingsRow label={data.account.email || 'Аккаунт'} description="Вы вошли в аккаунт" href="/settings" border={false} trailing={<Button variant="ghost" className="!min-h-8 !h-8 !px-2" onClick={async () => { await apiFetchAsGuest('/auth/logout', { method: 'POST' }); window.location.assign('/'); }}>Выйти</Button>} /> : <div className="flex gap-3"><Button href="/signup" className="flex-1">Создать аккаунт</Button><Button href="/login" variant="secondary" className="flex-1">Войти</Button></div>}
            </div>
          </Card>

          <Card padding="none" className="overflow-hidden">
            <div className={sectionTitle}>Данные и помощь</div>
            <SettingsRow label="Конфиденциальность и данные" description="Что хранит StoryHop" href="/privacy" />
            <SettingsRow label="Помощь" description="Написать в поддержку" href="/help" border={false} />
          </Card>
        </div>}
      </div>
    </AppShell>
  );
}
