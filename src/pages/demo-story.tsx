import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  Button,
  Card,
  EpisodeAudioPlayer,
  EpisodeChoiceCard,
  VocabHighlightText,
  VocabPracticeRow,
} from '@/components/ui';
import { useUiLanguage } from '@/lib/use-ui-language';
import { captureAnalyticsEvent } from '@/lib/analytics';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type DemoVocabWord = {
  term: string;
  translationRu?: string;
};

type DemoAudioChunk = {
  id: string;
  type: 'chapter' | 'intro' | 'choice' | string;
  choiceId?: string | null;
  audioUrl?: string | null;
};

type DemoChoice = {
  id: string;
  text: string;
  targetNodeKey: string;
};

type DemoNode = {
  nodeId: string;
  nodeKey: string;
  episodeNumber: number;
  title: string;
  chapterText: string;
  introOptionsPhrase: string;
  highlightedVocabulary: DemoVocabWord[];
  choices: DemoChoice[];
  imageUrl?: string | null;
  audioChunks: DemoAudioChunk[];
  isEnding: boolean;
};

type DemoStoryResponse = {
  title: string;
  scenario: string;
  startNodeKey: string;
  nodes: DemoNode[];
};

const copy = {
  english: {
    backHome: 'Back home',
    demoBadge: 'Demo story',
    loading: 'Loading demo story...',
    error: 'Could not load the demo story.',
    retry: 'Try again',
    episodeOf: (current: number) => `Demo episode ${current}`,
    imagePreparing: 'Demo illustration is being prepared.',
    choose: 'Choose what happens next',
    confirm: 'Confirm',
    restart: 'Restart demo',
    createSeason: 'Create your own season',
    finished: 'Demo complete',
  },
  russian: {
    backHome: 'На главную',
    demoBadge: 'Демо-история',
    loading: 'Загружаем демо-историю...',
    error: 'Не удалось загрузить демо-историю.',
    retry: 'Повторить',
    episodeOf: (current: number) => `Демо-эпизод ${current}`,
    imagePreparing: 'Иллюстрация демо готовится.',
    choose: 'Выберите, что будет дальше',
    confirm: 'Подтвердить',
    restart: 'Начать заново',
    createSeason: 'Создать свой сезон',
    finished: 'Демо завершено',
  },
};

function findAudio(chunks: DemoAudioChunk[], type: string, choiceId?: string) {
  return chunks.find((chunk) => {
    if (chunk.type !== type) return false;
    if (!choiceId) return true;
    return chunk.choiceId === choiceId || chunk.id === `choice-${choiceId}`;
  })?.audioUrl || null;
}

export default function DemoStoryPage() {
  const lang = useUiLanguage();
  const t = copy[lang];
  const [story, setStory] = useState<DemoStoryResponse | null>(null);
  const [currentNodeKey, setCurrentNodeKey] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [confirmingChoiceId, setConfirmingChoiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/demo-story`);
      if (!response.ok) {
        throw new Error(`Demo story request failed: ${response.status}`);
      }
      const data = await response.json();
      setStory(data);
      setCurrentNodeKey(data.startNodeKey);
      setPath([data.startNodeKey]);
      setConfirmingChoiceId(null);
      captureAnalyticsEvent('demo_started');
    } catch (err) {
      console.error(err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nodeByKey = useMemo(() => {
    const map = new Map<string, DemoNode>();
    story?.nodes.forEach((node) => map.set(node.nodeKey, node));
    return map;
  }, [story?.nodes]);

  const currentNode = currentNodeKey ? nodeByKey.get(currentNodeKey) : null;
  const chapterAudioUrl = currentNode ? findAudio(currentNode.audioChunks, 'chapter') : null;
  const introAudioUrl = currentNode ? findAudio(currentNode.audioChunks, 'intro') : null;
  const choiceAudioUrls = currentNode?.choices
    .map((choice) => findAudio(currentNode.audioChunks, 'choice', choice.id))
    .filter(Boolean) as string[] | undefined;
  const autoQueue = [introAudioUrl, ...(choiceAudioUrls || [])].filter(Boolean) as string[];

  const goToChoice = (choiceId: string) => {
    if (!currentNode) return;
    const choice = currentNode.choices.find((item) => item.id === choiceId);
    if (!choice) return;
    const targetNode = nodeByKey.get(choice.targetNodeKey);
    captureAnalyticsEvent('demo_choice_confirmed', { step_number: path.length });
    if (targetNode && targetNode.choices.length === 0) {
      captureAnalyticsEvent('demo_completed', { step_count: path.length + 1 });
    }
    setCurrentNodeKey(choice.targetNodeKey);
    setPath((prev) => [...prev, choice.targetNodeKey]);
    setConfirmingChoiceId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const restart = () => {
    if (!story) return;
    captureAnalyticsEvent('demo_restarted');
    setCurrentNodeKey(story.startNodeKey);
    setPath([story.startNodeKey]);
    setConfirmingChoiceId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppShell emptyHomeLayout plainBackground>
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button href="/" variant="ghost" className="px-3">
            ← {t.backHome}
          </Button>
          <span className="sh-pill bg-sh-forest-soft text-sh-forest border border-sh-forest/20">
            {t.demoBadge}
          </span>
        </div>

        {loading && (
          <Card padding="lg" className="text-center text-sh-muted">
            {t.loading}
          </Card>
        )}

        {!loading && error && (
          <Card padding="lg" className="text-center">
            <p className="text-sh-muted">{error}</p>
            <Button className="mt-4" onClick={loadStory}>
              {t.retry}
            </Button>
          </Card>
        )}

        {!loading && currentNode && (
          <article className="space-y-5">
            <header className="text-center">
              <p className="text-sm font-semibold text-sh-forest">
                {currentNode.isEnding ? t.finished : t.episodeOf(path.length)}
              </p>
              <h1 className="mt-2 font-story text-3xl sm:text-4xl font-bold leading-tight text-sh-foreground">
                {currentNode.title}
              </h1>
            </header>

            <EpisodeAudioPlayer
              variant="inline"
              audioUrl={chapterAudioUrl}
              playNextUrls={autoQueue}
              autoPlayOnMount
              autoPlayToken={currentNode.nodeKey}
              status={chapterAudioUrl ? 'ready' : 'missing'}
            />

            <Card padding="lg" className="bg-white">
              <div className="font-story text-lg sm:text-xl leading-9 text-sh-foreground whitespace-pre-line">
                <VocabHighlightText
                  text={currentNode.chapterText}
                  vocabulary={currentNode.highlightedVocabulary}
                />
              </div>
            </Card>

            <VocabPracticeRow words={currentNode.highlightedVocabulary} />

            <section className="overflow-hidden rounded-[var(--sh-radius-lg)] border border-sh-border bg-white shadow-[var(--sh-shadow-card)]">
              {currentNode.imageUrl ? (
                <img
                  src={currentNode.imageUrl}
                  alt={`${currentNode.title} illustration`}
                  className="block aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-sh-forest-soft/40 p-8 text-center text-sm text-sh-muted">
                  {t.imagePreparing}
                </div>
              )}
            </section>

            {currentNode.choices.length > 0 ? (
              <section className="space-y-3">
                <p className="text-center text-base font-semibold text-sh-muted">
                  {currentNode.introOptionsPhrase || t.choose}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {currentNode.choices.map((choice) => (
                    <EpisodeChoiceCard
                      key={choice.id}
                      choiceId={choice.id}
                      text={choice.text}
                      audioUrl={findAudio(currentNode.audioChunks, 'choice', choice.id)}
                      isConfirming={confirmingChoiceId === choice.id}
                      confirmLabel={t.confirm}
                      onRequestConfirm={setConfirmingChoiceId}
                      onSelect={goToChoice}
                    />
                  ))}
                </div>
              </section>
            ) : (
              <Card padding="lg" className="text-center">
                <p className="text-sh-muted">
                  {currentNode.introOptionsPhrase}
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button href="/seasons/new">{t.createSeason}</Button>
                  <Button onClick={restart} variant="secondary">
                    {t.restart}
                  </Button>
                </div>
              </Card>
            )}
          </article>
        )}
      </div>
    </AppShell>
  );
}
