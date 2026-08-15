import Image from 'next/image';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Button, Card, ProgressRing } from '@/components/ui';
import { imageAssets } from '@/data/image-assets';

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'ready' | 'ready_dry_run';

type GenerationJob = {
  jobType: string;
  status: JobStatus;
};

type SeasonData = {
  status: string;
  generationStatus?: string;
  childProfile?: { childName?: string };
  seasonSetup?: {
    seasonCoverImageUrl?: string | null;
    seasonCoverGenerationStatus?: string | null;
  };
  hero?: { heroReferenceImageUrl?: string | null; generationStatus?: string } | null;
  currentEpisode?: { title?: string; audioChunks?: { status: string }[] } | null;
  generationJobs?: GenerationJob[];
};

type StepState = 'pending' | 'active' | 'done' | 'failed';

const STEPS = [
  {
    id: 'story_arc',
    label: 'Построение сюжета и арки',
    message: 'Мы создаем сюжетную арку сезона, ключевые события и развилки.',
  },
  {
    id: 'first_episode',
    label: 'Подготовка первого эпизода',
    message: 'Мы пишем первый эпизод, выборы, слова и фразы для практики.',
  },
  {
    id: 'audio',
    label: 'Создание аудио',
    message: 'Мы готовим английскую озвучку для первого эпизода.',
  },
  {
    id: 'illustrations',
    label: 'Создание иллюстраций',
    message: 'Мы готовим визуальный образ героя и обложку сезона.',
  },
  {
    id: 'final_checks',
    label: 'Финальные настройки',
    message: 'Мы проверяем, что история готова к запуску.',
  },
] as const;

function isAudioReady(chunks?: { status: string }[] | null) {
  return Boolean(chunks?.length) && (chunks || []).every((chunk) => chunk.status === 'ready' || chunk.status === 'ready_dry_run');
}

export default function SeasonCreatingPage() {
  const router = useRouter();
  const seasonId = router.query.id as string;
  const [season, setSeason] = useState<SeasonData | null>(null);
  const [error, setError] = useState('');
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    if (!seasonId) return;

    const bootstrap = async () => {
      if (bootstrapped) return;
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}/bootstrap`, {
          method: 'POST',
        });
      } catch {
        // Polling below will surface the state.
      }
      setBootstrapped(true);
    };

    const poll = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}`);
        if (!res.ok) throw new Error('Failed to load season');
        const data = await res.json();
        setSeason(data);

        // This page only observes the server-side creation pipeline. Re-running the
        // worker on every poll can enqueue duplicate visual work while Pixazo is busy.
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load season');
      }
    };

    void bootstrap().then(poll);
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [seasonId, bootstrapped]);

  const childName = season?.childProfile?.childName || 'ребенка';
  const steps = useMemo(() => mapSteps(season), [season]);
  const doneCount = steps.filter((step) => step.status === 'done').length;
  const failed = steps.some((step) => step.status === 'failed');
  const heroPreviewUrl = season?.hero?.heroReferenceImageUrl || null;
  const coverPreviewUrl = season?.seasonSetup?.seasonCoverImageUrl || null;
  const audioReady = isAudioReady(season?.currentEpisode?.audioChunks || []);
  const creationComplete = season?.status === 'episode_ready' && audioReady && Boolean(heroPreviewUrl) && Boolean(coverPreviewUrl);
  const progress = creationComplete ? 100 : Math.max(12, Math.round((doneCount / steps.length) * 100));
  const activeStep = steps.find((step) => step.status === 'active') || steps.find((step) => step.status === 'pending') || steps[steps.length - 1];
  const preview = heroPreviewUrl || coverPreviewUrl ? <VisualPreview heroUrl={heroPreviewUrl} coverUrl={coverPreviewUrl} /> : null;

  if (error || failed) {
    return (
      <GenerationShell>
        <GenerationPanel
          title="Что-то пошло не так"
          subtitle="Сезон не удалось создать. Попробуйте еще раз или вернитесь домой."
          progress={progress}
          steps={steps}
          activeMessage={error || 'Один из обязательных шагов завершился ошибкой.'}
          variant="error"
          primary={<Button onClick={() => router.reload()}>Попробовать еще раз</Button>}
          secondary={<Button href="/" variant="secondary">На главную</Button>}
          preview={preview}
        />
      </GenerationShell>
    );
  }

  if (creationComplete && season?.currentEpisode) {
    return (
      <GenerationShell>
        <GenerationPanel
          title={`Сезон для ${childName} готов!`}
          subtitle={`Первый эпизод уже ждет вас: ${season.currentEpisode.title || 'The adventure begins'}.`}
          progress={100}
          steps={steps.map((step) => ({ ...step, status: 'done' as StepState }))}
          activeMessage="Первый эпизод, озвучка, обложка сезона и визуальный образ героя готовы."
          variant="success"
          primary={<Button href={`/seasons/${seasonId}`}>Перейти к истории</Button>}
          secondary={<Button href="/library" variant="secondary">Открыть в библиотеке</Button>}
          preview={<VisualPreview heroUrl={heroPreviewUrl} coverUrl={coverPreviewUrl} />}
        />
      </GenerationShell>
    );
  }

  return (
    <GenerationShell>
      <GenerationPanel
        title={`Создаем сезон для ${childName}...`}
        subtitle="Обычно это занимает 2-3 минуты. Можно вернуться позже - мы продолжим создание."
        progress={progress}
        steps={steps}
        activeMessage={activeStep.message}
        variant="loading"
        primary={<Button href="/" variant="secondary">Я вернусь позже</Button>}
        preview={preview}
      />
    </GenerationShell>
  );
}

function mapSteps(season: SeasonData | null) {
  const jobs = season?.generationJobs || [];
  const hasEpisode = Boolean(season?.currentEpisode);
  const audioReady = isAudioReady(season?.currentEpisode?.audioChunks || []);
  const heroReady = Boolean(season?.hero?.heroReferenceImageUrl);
  const coverReady = Boolean(season?.seasonSetup?.seasonCoverImageUrl);
  const episodeReady = season?.status === 'episode_ready' || hasEpisode;
  const frameworkReady = season?.generationStatus === 'ready';
  const visualsReady = heroReady && coverReady;
  const blockingAudioFailure = jobs.some((job) => job.jobType === 'tts_chunk' && job.status === 'failed') && !audioReady;

  const statuses: StepState[] = [
    frameworkReady ? 'done' : season ? 'active' : 'pending',
    episodeReady ? 'done' : frameworkReady ? 'active' : 'pending',
    audioReady ? 'done' : episodeReady ? 'active' : 'pending',
    visualsReady ? 'done' : (heroReady || frameworkReady) ? 'active' : 'pending',
    season?.status === 'episode_ready' && audioReady && visualsReady ? 'done' : (audioReady || visualsReady) ? 'active' : 'pending',
  ];

  if (blockingAudioFailure) {
    statuses[2] = 'failed';
  }

  return STEPS.map((step, index) => ({
    ...step,
    status: statuses[index],
  }));
}

function GenerationShell({ children }: { children: ReactNode }) {
  return (
    <AppShell maxWidth="wide" showBottomNav={false} shellVariant="framed">
      <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
        {children}
      </div>
    </AppShell>
  );
}

function GenerationPanel({
  title,
  subtitle,
  progress,
  steps,
  activeMessage,
  variant,
  primary,
  secondary,
  preview,
}: {
  title: string;
  subtitle: string;
  progress: number;
  steps: Array<{ id: string; label: string; message: string; status: StepState }>;
  activeMessage: string;
  variant: 'loading' | 'success' | 'error';
  primary: ReactNode;
  secondary?: ReactNode;
  preview?: ReactNode;
}) {
  return (
    <Card padding="lg" className="w-full max-w-2xl space-y-5 text-center">
      <div className="relative mx-auto aspect-[4/3] w-full max-w-[320px]">
        <Image
          src={
            variant === 'error'
              ? imageAssets.states.friendlyError
              : variant === 'loading'
                ? imageAssets.states.seasonCreatingCastle
                : imageAssets.states.seasonReady
          }
          alt=""
          fill
          className="object-contain"
          priority
        />
      </div>
      <div>
        <h1 className="ph-sensitive text-2xl font-bold leading-tight text-sh-foreground md:text-3xl">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-sh-muted">{subtitle}</p>
      </div>
      <div className="flex justify-center">
        <ProgressRing value={progress} size={104} label={variant === 'success' ? 'Готово' : 'Создание'} />
      </div>
      <div className="space-y-2 text-left">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center justify-between gap-3 rounded-[var(--sh-radius)] border border-sh-border px-3 py-2">
            <div className="flex items-center gap-2">
              <StepIcon status={step.status} />
              <span className="text-sm font-medium text-sh-foreground">{step.label}</span>
            </div>
            <span className="text-xs text-sh-muted">{statusLabel(step.status)}</span>
          </div>
        ))}
      </div>
      <div className="rounded-[var(--sh-radius)] border border-sh-forest/20 bg-sh-forest-soft px-4 py-3 text-left">
        <p className="text-sm font-bold text-sh-forest">Что происходит сейчас?</p>
        <p className="mt-1 text-sm text-sh-muted">{activeMessage}</p>
      </div>
      {preview}
      <div className="grid gap-3 sm:grid-cols-2">
        {primary}
        {secondary}
      </div>
    </Card>
  );
}

function VisualPreview({
  heroUrl,
  coverUrl,
}: {
  heroUrl?: string | null;
  coverUrl?: string | null;
}) {
  return (
    <div className="grid gap-3 text-left sm:grid-cols-2">
      <div className="rounded-[var(--sh-radius)] border border-sh-border bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-sh-muted">Герой</p>
        {heroUrl ? (
          <div className="relative mt-2 aspect-[4/3] overflow-hidden rounded-[var(--sh-radius)] bg-sh-forest-soft">
            <Image
              src={heroUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 240px"
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-sh-muted">Визуальный образ героя еще готовится.</p>
        )}
      </div>
      <div className="rounded-[var(--sh-radius)] border border-sh-border bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-sh-muted">Обложка сезона</p>
        {coverUrl ? (
          <div className="relative mt-2 aspect-[4/3] overflow-hidden rounded-[var(--sh-radius)] bg-sh-forest-soft">
            <Image
              src={coverUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 240px"
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-sh-muted">Генерируем обложку, чтобы она появилась на главной и в библиотеке.</p>
        )}
      </div>
    </div>
  );
}

function StepIcon({ status }: { status: StepState }) {
  if (status === 'done') return <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sh-forest text-xs text-white">✓</span>;
  if (status === 'failed') return <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs text-red-700">!</span>;
  if (status === 'active') return <span className="h-5 w-5 animate-spin rounded-full border-2 border-sh-forest border-t-transparent" />;
  return <span className="h-5 w-5 rounded-full border border-sh-border" />;
}

function statusLabel(status: StepState) {
  if (status === 'done') return 'Готово';
  if (status === 'failed') return 'Ошибка';
  if (status === 'active') return 'В процессе...';
  return 'В очереди';
}
