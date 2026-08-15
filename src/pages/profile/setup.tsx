import { useRouter } from 'next/router';
import AppShell from '@/components/layout/AppShell';
import ChildProfileForm from '@/components/profile/ChildProfileForm';
import { apiFetchAsGuest } from '@/lib/api-client';

export default function ProfileSetupPage() {
  const router = useRouter();
  const next = typeof router.query.next === 'string' && router.query.next.startsWith('/') ? router.query.next : '/seasons/new';

  return (
    <AppShell maxWidth="default" shellVariant="framed">
      <div className="mx-auto max-w-xl py-3 sm:py-8">
        <p className="text-sm font-semibold text-sh-forest">ПЕРЕД ПЕРВОЙ ИСТОРИЕЙ</p>
        <h1 className="mt-2 font-story text-3xl font-bold text-sh-foreground">Расскажите немного о ребёнке</h1>
        <p className="mt-3 text-base leading-relaxed text-sh-muted">Так новые сезоны будут подходить по возрасту и уровню английского. Героя истории вы выберете отдельно на следующем шаге.</p>
        <div className="mt-6">
          <ChildProfileForm
            submitLabel="Сохранить и продолжить"
            onBack={() => router.push('/')}
            onSubmit={async (profile) => {
              const response = await apiFetchAsGuest('/users/me/child-profile', { method: 'PUT', body: JSON.stringify(profile) });
              if (!response.ok) throw new Error(`Не удалось сохранить профиль (${response.status})`);
              await router.push(next);
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
