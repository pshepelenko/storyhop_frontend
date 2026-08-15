import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '@/components/layout/AppShell';
import ChildProfileForm, { ChildProfileInput } from '@/components/profile/ChildProfileForm';
import { apiFetchAsGuest } from '@/lib/api-client';

export default function EditChildProfilePage() {
  const router = useRouter();
  const [initial, setInitial] = useState<Partial<ChildProfileInput> | null>(null);

  useEffect(() => {
    void apiFetchAsGuest('/users/me/settings').then(async (response) => {
      if (!response.ok) throw new Error('Settings unavailable');
      const data = await response.json();
      setInitial(data.profile || {});
    }).catch(() => setInitial({}));
  }, []);

  return (
    <AppShell maxWidth="default" shellVariant="framed">
      <div className="mx-auto max-w-xl py-3 sm:py-8">
        <p className="text-sm font-semibold text-sh-forest">ПРОФИЛЬ РЕБЁНКА</p>
        <h1 className="mt-2 font-story text-3xl font-bold text-sh-foreground">Настройки для новых сезонов</h1>
        <p className="mt-3 text-base leading-relaxed text-sh-muted">Изменения не затронут уже созданные истории.</p>
        <div className="mt-6">
          {initial ? <ChildProfileForm initialValue={initial} submitLabel="Сохранить" onBack={() => router.push('/settings')} onSubmit={async (profile) => {
            const response = await apiFetchAsGuest('/users/me/child-profile', { method: 'PUT', body: JSON.stringify(profile) });
            if (!response.ok) throw new Error(`Не удалось сохранить профиль (${response.status})`);
            await router.push('/settings');
          }} /> : <p className="text-sm text-sh-muted">Загружаем профиль...</p>}
        </div>
      </div>
    </AppShell>
  );
}
