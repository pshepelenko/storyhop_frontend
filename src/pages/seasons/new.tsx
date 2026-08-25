import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import WizardLayout from '@/components/layout/WizardLayout';
import WorldCarousel from '@/components/season-setup/WorldCarousel';
import WorldGrid from '@/components/season-setup/WorldGrid';
import { Button, Card, Chip, ModalOverlay } from '@/components/ui';
import {
  HERO_TRAIT_OPTIONS,
  LEARNING_THEME_OPTIONS,
  TONE_OPTIONS,
  VOCABULARY_OPTIONS,
  WORLD_PRESETS,
  optionLabel,
  worldLabel,
} from '@/data/season-presets';
import { getStoryWorldPreset } from '@/data/storyWorlds';
import { StoryWorldId } from '@/types/storyWorlds';
import { getUiLanguage } from '@/lib/ui-language';
import { useUiLanguage } from '@/lib/use-ui-language';
import { apiFetchAsGuest } from '@/lib/api-client';
import { captureAnalyticsEvent } from '@/lib/analytics';

type WizardStep = 1 | 2 | 3;
type HeroGender = 'girl' | 'boy' | 'ai_decides';

type ChildProfile = {
  childId?: string;
  name: string;
  age: number;
  gender: 'girl' | 'boy';
  englishLevel: 'A1' | 'A2' | 'B1';
};

type HeroSeed = {
  preferredName?: string;
  heroType?: string;
  traits?: string[];
  companion?: string;
  appearanceRu?: string;
  descriptionRu?: string;
  description?: string;
};

type SeasonDraftPayload = {
  worldId: StoryWorldId | null;
  learningThemes: string[];
  tone: string;
  vocabularyFocus: string[];
  customIdea: string;
  heroGender: HeroGender;
  heroAge: number;
  heroName: string;
  heroTraits: string[];
  heroCompanion: string;
  heroDescription: string;
  descriptionSource: 'ai' | 'edited_by_user';
  descriptionStaleReason: string | null;
  editingFromReview: WizardStep | null;
};

type SeasonDraftResponse = {
  draftId: string;
  payload: SeasonDraftPayload;
  step: WizardStep;
  status: 'active' | 'submitted' | 'abandoned';
  createdSeasonId?: string | null;
};

const HERO_GENDER_OPTIONS: { id: HeroGender; label: string }[] = [
  { id: 'girl', label: 'Девочка' },
  { id: 'boy', label: 'Мальчик' },
  { id: 'ai_decides', label: 'AI решит' },
];

const DEFAULT_CHILD: ChildProfile = {
  childId: 'default-child',
  name: '',
  age: 8,
  gender: 'girl',
  englishLevel: 'A1',
};

const ENGLISH_HERO_NAME_REGEX = /^[A-Za-z][A-Za-z' -]{0,39}$/;

const HERO_TRAIT_TEXT: Record<string, { boy: string; girl: string; neutral: string }> = {
  curious: { boy: 'любознательный', girl: 'любознательная', neutral: 'любознательность' },
  kind: { boy: 'добрый', girl: 'добрая', neutral: 'доброта' },
  brave: { boy: 'смелый', girl: 'смелая', neutral: 'смелость' },
  creative: { boy: 'творческий', girl: 'творческая', neutral: 'творческий подход' },
  calm: { boy: 'спокойный', girl: 'спокойная', neutral: 'спокойствие' },
  funny: { boy: 'веселый', girl: 'веселая', neutral: 'веселый характер' },
  thoughtful: { boy: 'внимательный', girl: 'внимательная', neutral: 'внимательность' },
  determined: { boy: 'решительный', girl: 'решительная', neutral: 'решительность' },
  careful: { boy: 'осторожный', girl: 'осторожная', neutral: 'осторожность' },
  inventive: { boy: 'изобретательный', girl: 'изобретательная', neutral: 'изобретательность' },
};

function heroTraitOptionsForGender(gender: HeroGender) {
  return HERO_TRAIT_OPTIONS.map((option) => {
    const forms = HERO_TRAIT_TEXT[option.id];
    return {
      ...option,
      label: forms
        ? gender === 'boy'
          ? forms.boy[0].toUpperCase() + forms.boy.slice(1)
          : gender === 'girl'
            ? forms.girl[0].toUpperCase() + forms.girl.slice(1)
            : option.label
        : option.label,
    };
  });
}

function sanitizeHeroNameInput(value: string) {
  return value
    .replace(/[^A-Za-z' -]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trimStart()
    .slice(0, 40);
}

function isEnglishHeroName(value: string) {
  return ENGLISH_HERO_NAME_REGEX.test(value.trim());
}

function normalizeHeroDescriptionName(description: string, heroName: string) {
  const trimmedName = heroName.trim();
  if (!trimmedName) {
    return description;
  }

  return description
    .replace(/^\s*[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё' -]{0,39}\s*[-:—]\s*/u, `${trimmedName} - `);
}

const toEnglishWorld = (id: StoryWorldId | null) => getStoryWorldPreset(id)?.title || '';

export default function NewSeasonPage() {
  const interfaceLanguage = useUiLanguage();
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [heroSeedLoading, setHeroSeedLoading] = useState(false);
  const [childProfile, setChildProfile] = useState<ChildProfile>(DEFAULT_CHILD);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftSaveState, setDraftSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [editingFromReview, setEditingFromReview] = useState<WizardStep | null>(null);
  const [leaveIntent, setLeaveIntent] = useState<{ href: string; label: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const pageHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const [worldId, setWorldId] = useState<StoryWorldId | null>('magical_academy');
  const [learningThemes, setLearningThemes] = useState<string[]>(['teamwork']);
  const [tone, setTone] = useState<string>('adventurous');
  const [vocabularyFocus, setVocabularyFocus] = useState<string[]>(['nature', 'friends']);
  const [customIdea, setCustomIdea] = useState('');

  const [heroGender, setHeroGender] = useState<HeroGender>('ai_decides');
  const [heroAge, setHeroAge] = useState(8);
  const [heroName, setHeroName] = useState('');
  const [heroTraits, setHeroTraits] = useState<string[]>(['curious', 'kind']);
  const [heroCompanion, setHeroCompanion] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [descriptionSource, setDescriptionSource] = useState<'ai' | 'edited_by_user'>('ai');
  const [descriptionStaleReason, setDescriptionStaleReason] = useState<string | null>(null);
  const heroSeedRequestIdRef = useRef(0);

  const draftPayload = useMemo<SeasonDraftPayload>(() => ({
    worldId,
    learningThemes,
    tone,
    vocabularyFocus,
    customIdea,
    heroGender,
    heroAge,
    heroName,
    heroTraits,
    heroCompanion,
    heroDescription,
    descriptionSource,
    descriptionStaleReason,
    editingFromReview,
  }), [
    customIdea, descriptionSource, descriptionStaleReason, heroAge, heroCompanion,
    heroDescription, heroGender, heroName, heroTraits, learningThemes, tone,
    vocabularyFocus, worldId, editingFromReview,
  ]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const settingsRes = await apiFetchAsGuest('/users/me/settings');
        const settings = settingsRes.ok ? await settingsRes.json() : null;
        const profile = settings?.profile;
        if (!profile?.complete) {
          await router.replace('/profile/setup?next=/seasons/new');
          return;
        }
        const age = Number(profile.age || 8);
        setChildProfile({
          name: profile.displayName,
          age,
          gender: profile.gender,
          englishLevel: profile.englishLevel,
        });
        setHeroAge(age);
        setHeroName('');
      } catch {
        setChildProfile(DEFAULT_CHILD);
        setHeroName('');
      } finally {
        setProfileLoaded(true);
      }
    };
    loadProfile();
  }, [router]);

  useEffect(() => {
    if (!profileLoaded) return;
    let cancelled = false;
    const returnToReview = router.query.review === '1';
    const restoreDraft = async () => {
      try {
        const response = await apiFetchAsGuest('/seasons/draft/current');
        const draft = response.ok ? await response.json() as SeasonDraftResponse | null : null;
        if (cancelled || !draft?.draftId || draft.status !== 'active') return;
        const saved = draft.payload || {};
        setDraftId(draft.draftId);
        setStep(returnToReview ? 3 : Math.min(3, Math.max(1, Number(draft.step) || 1)) as WizardStep);
        if (saved.worldId) setWorldId(saved.worldId);
        if (Array.isArray(saved.learningThemes)) setLearningThemes(saved.learningThemes);
        if (typeof saved.tone === 'string') setTone(saved.tone);
        if (Array.isArray(saved.vocabularyFocus)) setVocabularyFocus(saved.vocabularyFocus);
        if (typeof saved.customIdea === 'string') setCustomIdea(saved.customIdea);
        if (saved.heroGender) setHeroGender(saved.heroGender);
        if (Number.isFinite(saved.heroAge)) setHeroAge(saved.heroAge);
        if (typeof saved.heroName === 'string') setHeroName(saved.heroName);
        if (Array.isArray(saved.heroTraits)) setHeroTraits(saved.heroTraits);
        if (typeof saved.heroCompanion === 'string') setHeroCompanion(saved.heroCompanion);
        if (typeof saved.heroDescription === 'string') setHeroDescription(saved.heroDescription);
        if (saved.descriptionSource) setDescriptionSource(saved.descriptionSource);
        if (saved.descriptionStaleReason !== undefined) setDescriptionStaleReason(saved.descriptionStaleReason);
        if (Number(saved.editingFromReview) >= 1 && Number(saved.editingFromReview) <= 3) {
          setEditingFromReview(Number(saved.editingFromReview) as WizardStep);
        }
      } catch {
        // The wizard remains usable offline or if an older backend is temporarily deployed.
      } finally {
        if (!cancelled) setDraftLoaded(true);
      }
    };
    void restoreDraft();
    return () => { cancelled = true; };
  }, [profileLoaded, router.query.review]);

  useEffect(() => {
    if (!draftLoaded || !isDirty || loading) return;
    const timeout = window.setTimeout(async () => {
      setDraftSaveState('saving');
      try {
        const response = await apiFetchAsGuest('/seasons/draft', {
          method: 'POST',
          body: JSON.stringify({ draftId, payload: draftPayload, step }),
        });
        if (!response.ok) throw new Error(`Draft save failed (${response.status})`);
        const saved = await response.json() as SeasonDraftResponse;
        setDraftId(saved.draftId);
        setIsDirty(false);
        setDraftSaveState('saved');
      } catch {
        setDraftSaveState('error');
      }
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [draftId, draftLoaded, draftPayload, isDirty, loading, step]);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || loading) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [isDirty, loading]);

  useEffect(() => {
    router.beforePopState(({ as }) => {
      if (!isDirty || loading) return true;
      setLeaveIntent({ href: as || '/', label: 'предыдущую страницу' });
      return false;
    });
    return () => router.beforePopState(() => true);
  }, [isDirty, loading, router]);

  const markDirty = useCallback(() => {
    setIsDirty(true);
    setDraftSaveState('idle');
  }, []);

  const goToStep = useCallback((nextStep: WizardStep, options?: { reviewReturn?: WizardStep | null }) => {
    setStep(nextStep);
    setEditingFromReview(options?.reviewReturn || null);
    markDirty();
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      pageHeadingRef.current?.focus({ preventScroll: true });
    });
  }, [markDirty]);

  const requestNavigation = useCallback((href: string) => {
    if (href.startsWith('/seasons/new') || (!isDirty && draftSaveState !== 'saving')) return true;
    setLeaveIntent({ href, label: href === '/' ? 'главную страницу' : 'другой раздел' });
    return false;
  }, [draftSaveState, isDirty]);

  const generateHeroSeed = useCallback(async () => {
    if (!worldId) return;
    if (descriptionSource === 'edited_by_user' && heroDescription.trim()) {
      const confirmed = window.confirm('Это заменит текущее описание героя. Продолжить?');
      if (!confirmed) return;
    }
    const requestId = ++heroSeedRequestIdRef.current;
    const requestedHero = {
      preferredName: heroName.trim(),
      gender: heroGender,
      age: heroAge,
      traits: heroTraits.map((trait) => optionLabel(HERO_TRAIT_OPTIONS, trait)),
      description: descriptionSource === 'edited_by_user' ? heroDescription.trim() : '',
    };
    setHeroSeedLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/hero-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          world: toEnglishWorld(worldId),
          worldId,
      // UI labels are localized; AI receives canonical English values only.
      theme: learningThemes.join(', '),
      preferredTone: tone,
      vocabularyFocus,
          heroDirection: requestedHero,
        }),
      });
      if (!res.ok) {
        throw new Error(`Не удалось обновить профиль героя (${res.status})`);
      }
      const seed: HeroSeed | null = await res.json();
      if (requestId !== heroSeedRequestIdRef.current) return;
      const generatedCompanion = String(seed?.companion || '').trim();
      const suggestedName = sanitizeHeroNameInput(String(seed?.preferredName || ''));
      const resolvedName = requestedHero.preferredName || suggestedName;
      const generatedDescription = seed?.descriptionRu?.trim() || seed?.description?.trim() || '';
      if (!isEnglishHeroName(resolvedName) || !generatedCompanion || !generatedDescription) {
        throw new Error('Сервис вернул неполный профиль героя');
      }
      if (!isEnglishHeroName(requestedHero.preferredName) && suggestedName) {
        setHeroName(suggestedName);
      }
      setHeroCompanion(generatedCompanion);
      const normalizedDescription = normalizeHeroDescriptionName(
        generatedDescription,
        resolvedName,
      );
      setHeroDescription(normalizedDescription);
      setDescriptionSource('ai');
      setDescriptionStaleReason(null);
      markDirty();
    } catch (requestError) {
      if (requestId !== heroSeedRequestIdRef.current) return;
      setError(requestError instanceof Error
        ? requestError.message
        : 'Не удалось обновить профиль героя. Попробуйте ещё раз.');
    } finally {
      if (requestId === heroSeedRequestIdRef.current) setHeroSeedLoading(false);
    }
  }, [
    descriptionSource,
    heroAge,
    heroDescription,
    heroGender,
    heroName,
    heroTraits,
    learningThemes,
    tone,
    vocabularyFocus, markDirty,
    worldId,
  ]);

  const invalidateHeroSeed = useCallback(() => {
    heroSeedRequestIdRef.current += 1;
    setHeroSeedLoading(false);
  }, []);

  const toggleLimited = (value: string, list: string[], setter: (next: string[]) => void, max: number) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
      return;
    }
    if (list.length < max) setter([...list, value]);
  };

  const markDescriptionStale = (reason: string) => {
    if (heroDescription.trim()) setDescriptionStaleReason(reason);
  };

  const selectedWorld = getStoryWorldPreset(worldId);
  const canGoNext = step === 1
    ? Boolean(worldId && tone)
    : step === 2
      ? Boolean(heroName.trim() && heroDescription.trim() && isEnglishHeroName(heroName))
      : true;

  const storyDirectionText = useMemo(() => {
    return [
      worldLabel(worldId),
      learningThemes.map((item) => optionLabel(LEARNING_THEME_OPTIONS, item)).join(', '),
      optionLabel(TONE_OPTIONS, tone),
      vocabularyFocus.map((item) => optionLabel(VOCABULARY_OPTIONS, item)).join(', '),
    ].filter(Boolean).join(' В· ');
  }, [learningThemes, tone, vocabularyFocus, worldId]);

  const createSeason = async () => {
    if (!worldId) return;
    setLoading(true);
    setError('');
    localStorage.setItem('storyLanguage', 'english');
    localStorage.setItem('lastMainCharacterName', heroName.trim());

    const worldName = toEnglishWorld(worldId);
    // `theme` feeds the English story pipeline, so never serialize localized labels here.
    const combinedTheme = [worldName, ...learningThemes].filter(Boolean).join('; ');
    captureAnalyticsEvent('season_creation_started', {
      world_id: worldId,
      learning_theme_count: learningThemes.length,
      vocabulary_focus_count: vocabularyFocus.length,
      hero_gender: heroGender,
      hero_age: heroAge,
    });
    try {
      const draftResponse = await apiFetchAsGuest('/seasons/draft', {
        method: 'POST',
        body: JSON.stringify({ draftId, payload: draftPayload, step: 3 }),
      });
      if (!draftResponse.ok) throw new Error(`Не удалось сохранить черновик (${draftResponse.status})`);
      const savedDraft = await draftResponse.json() as SeasonDraftResponse;
      setDraftId(savedDraft.draftId);
      setIsDirty(false);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: combinedTheme,
          world: worldName,
          vocabularyFocus,
          preferredTone: tone,
          comments: customIdea,
          learningThemes,
          interfaceLanguage: getUiLanguage(),
          storyDirection: {
            worldId,
            learningThemes,
            tone,
            vocabularyFocus,
            customIdea,
          },
          heroDirection: {
            gender: heroGender,
            age: heroAge,
            name: heroName.trim(),
            traits: heroTraits,
            companion: heroCompanion || undefined,
            description: heroDescription.trim(),
          },
          draftId: savedDraft.draftId,
          idempotencyKey: savedDraft.draftId,
          heroPreferences: {
            preferredName: heroName.trim(),
            heroType: heroGender === 'boy' ? 'young boy hero' : heroGender === 'girl' ? 'young girl hero' : 'young child hero',
            traits: heroTraits.map((trait) => optionLabel(HERO_TRAIT_OPTIONS, trait)),
            companion: heroCompanion || 'AI decides',
            favoriteColor: 'emerald',
            accessory: 'small story charm',
            description: heroDescription.trim(),
            ageYears: heroAge,
            gender: heroGender,
          },
        }),
      });
      if (!res.ok) throw new Error(`Не удалось создать сезон (${res.status})`);
      const data = await res.json();
      captureAnalyticsEvent('season_creation_accepted', { world_id: worldId });
      router.push(`/seasons/${data.seasonId}/creating`);
    } catch (e: unknown) {
      captureAnalyticsEvent('season_creation_failed', { world_id: worldId });
      setError(e instanceof Error ? e.message : 'Не удалось создать сезон.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-3">
      <Button
        variant="secondary"
        onClick={() => {
          if (editingFromReview) return goToStep(3);
          if (step === 1) return setLeaveIntent({ href: '/', label: 'главную страницу' });
          goToStep((step - 1) as WizardStep);
        }}
        className="flex-1"
      >
        {editingFromReview ? 'К проверке' : step === 1 ? 'Отмена' : 'Назад'}
      </Button>
      {step < 3 ? (
        <Button onClick={() => goToStep((step + 1) as WizardStep, { reviewReturn: editingFromReview })} disabled={!canGoNext} className="flex-1">
          Далее
        </Button>
      ) : (
        <Button onClick={createSeason} disabled={loading || !canGoNext} className="flex-1">
          {loading ? 'Создаем...' : 'Создать сезон ✨'}
        </Button>
      )}
    </div>
  );

  const goBackFromWizard = () => {
    if (editingFromReview) {
      goToStep(3);
      return;
    }
    if (step === 1) {
      setLeaveIntent({ href: '/', label: 'главную страницу' });
      return;
    }
    goToStep((step - 1) as WizardStep);
  };

  if (!profileLoaded || !draftLoaded) return <AppShell maxWidth="wide" shellVariant="framed"><p className="py-10 text-center text-sm text-sh-muted">Загружаем настройки создания...</p></AppShell>;

  return (
    <AppShell maxWidth="wide" showBottomNav={false} showSideNav hasSeasons shellVariant="framed" parentLabel={`${childProfile.name || 'Child'}'s parent`} onNavigationAttempt={requestNavigation}>
      <div className="mx-auto max-w-5xl">
        <WizardLayout
          step={step}
          title={
            step === 1
              ? 'Какой мир и направление истории понравятся вашему ребенку?'
              : step === 2
                ? 'Кто главный герой этой истории?'
                : 'Проверьте настройки и создайте сезон'
          }
          subtitle={
            step === 1
              ? 'Выберите мир, темы и словарь, которые зададут направление сезона.'
              : step === 2
                ? 'Определите основу героя. StoryHop сам создаст приключение вокруг него.'
                : 'Сезон создаст сюжет, первый эпизод, аудио, активности и иллюстрации.'
          }
          footer={footer}
          onBack={goBackFromWizard}
          headingRef={pageHeadingRef}
          draftStatus={draftSaveState}
        >
          {error && (
            <div className="mb-4 rounded-[var(--sh-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {step === 1 && (
            <StoryDirectionStep
              interfaceLanguage={interfaceLanguage}
              worldId={worldId}
              setWorldId={(next) => {
                invalidateHeroSeed();
                setWorldId(next);
                markDescriptionStale('world_changed');
                markDirty();
              }}
              learningThemes={learningThemes}
              setLearningThemes={(next) => { setLearningThemes(next); markDirty(); }}
              tone={tone}
              setTone={(next) => { setTone(next); markDirty(); }}
              vocabularyFocus={vocabularyFocus}
              setVocabularyFocus={(next) => { setVocabularyFocus(next); markDirty(); }}
              customIdea={customIdea}
              setCustomIdea={(next) => { setCustomIdea(next); markDirty(); }}
              toggleLimited={toggleLimited}
            />
          )}
          {step === 2 && (
            <HeroDirectionStep
              childProfile={childProfile}
              heroGender={heroGender}
              setHeroGender={(next) => {
                invalidateHeroSeed();
                setHeroGender(next);
                markDescriptionStale('gender_changed');
                markDirty();
              }}
              heroAge={heroAge}
              setHeroAge={(next) => {
                invalidateHeroSeed();
                setHeroAge(next);
                markDescriptionStale('age_changed');
                markDirty();
              }}
              heroName={heroName}
              setHeroName={(next) => {
                invalidateHeroSeed();
                setHeroName(next);
                markDescriptionStale('name_changed');
                markDirty();
              }}
              heroTraits={heroTraits}
              setHeroTraits={(next) => {
                invalidateHeroSeed();
                setHeroTraits(next);
                markDescriptionStale('traits_changed');
                markDirty();
              }}
              heroDescription={heroDescription}
              setHeroDescription={(next) => {
                setHeroDescription(next);
                setDescriptionSource('edited_by_user');
                markDirty();
              }}
              descriptionStaleReason={descriptionStaleReason}
              heroSeedLoading={heroSeedLoading}
              generateHeroSeed={generateHeroSeed}
              toggleLimited={toggleLimited}
            />
          )}
          {step === 3 && (
            <ReviewStep
              childProfile={childProfile}
              selectedWorld={selectedWorld}
              storyDirectionText={storyDirectionText}
              learningThemes={learningThemes}
              tone={tone}
              vocabularyFocus={vocabularyFocus}
              customIdea={customIdea}
              heroGender={heroGender}
              heroAge={heroAge}
              heroName={heroName}
              heroTraits={heroTraits}
              heroCompanion={heroCompanion}
              heroDescription={heroDescription}
              onEditChild={() => {
                const returnTo = encodeURIComponent(`/seasons/new?review=1`);
                router.push(`/settings/child-profile?returnTo=${returnTo}`);
              }}
              onEditDirection={() => goToStep(1, { reviewReturn: 3 })}
              onEditHero={() => goToStep(2, { reviewReturn: 3 })}
            />
          )}
        </WizardLayout>
      </div>
      {leaveIntent && (
        <ModalOverlay className="items-center justify-center" role="dialog" aria-modal="true" aria-label="Leave season creation">
          <Card padding="lg" className="w-full max-w-md space-y-4 shadow-[var(--sh-shadow-shell)]">
            <div>
              <p className="text-lg font-bold text-sh-foreground">Выйти из создания сезона?</p>
              <p className="mt-2 text-sm leading-relaxed text-sh-muted">Настройки уже сохранены как черновик. Вы сможете продолжить создание сезона позже.</p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setLeaveIntent(null)}>Остаться</Button>
              <Button onClick={() => router.push(leaveIntent.href)}>Выйти на {leaveIntent.label}</Button>
            </div>
          </Card>
        </ModalOverlay>
      )}
    </AppShell>
  );
}

function StoryDirectionStep({
  interfaceLanguage,
  worldId,
  setWorldId,
  learningThemes,
  setLearningThemes,
  tone,
  setTone,
  vocabularyFocus,
  setVocabularyFocus,
  customIdea,
  setCustomIdea,
  toggleLimited,
}: {
  interfaceLanguage: 'english' | 'russian';
  worldId: StoryWorldId | null;
  setWorldId: (id: StoryWorldId) => void;
  learningThemes: string[];
  setLearningThemes: (items: string[]) => void;
  tone: string;
  setTone: (tone: string) => void;
  vocabularyFocus: string[];
  setVocabularyFocus: (items: string[]) => void;
  customIdea: string;
  setCustomIdea: (value: string) => void;
  toggleLimited: (value: string, list: string[], setter: (next: string[]) => void, max: number) => void;
}) {
  return (
    <div className="space-y-5">
      <section>
        <p className="mb-1 text-sm font-semibold text-sh-foreground">Выберите мир истории</p>
        <p className="mb-3 text-sm text-sh-muted">Мир задает атмосферу, приключения и типы заданий в сезоне.</p>
        <div className="hidden md:block">
          <WorldGrid worlds={getStoryWorldCards(interfaceLanguage)} selectedWorldId={worldId} onSelect={setWorldId} />
        </div>
        <div className="md:hidden">
          <WorldCarousel worlds={getStoryWorldCards(interfaceLanguage)} selectedWorldId={worldId} onSelect={setWorldId} />
        </div>
      </section>

      <ChipSection
        title="Темы обучения (выберите до 2)"
        options={LEARNING_THEME_OPTIONS}
        selected={learningThemes}
        onSelect={(id) => toggleLimited(id, learningThemes, setLearningThemes, 2)}
      />
      <ChipSection
        title="Фокус словаря (выберите до 3)"
        options={VOCABULARY_OPTIONS}
        selected={vocabularyFocus}
        onSelect={(id) => toggleLimited(id, vocabularyFocus, setVocabularyFocus, 3)}
      />
      <ChipSection
        title="Тон истории"
        options={TONE_OPTIONS}
        selected={[tone]}
        onSelect={setTone}
      />
      <label className="block text-sm font-semibold text-sh-foreground">
        Дополнительно (необязательно)
        <textarea
          className="mt-2 w-full min-h-[48px] rounded-[var(--sh-radius)] border border-sh-border px-3 py-2 text-sm outline-none focus:border-sh-forest"
          placeholder="Например: хочу больше загадок, миссий и волшебных существ..."
          value={customIdea}
          onChange={(event) => setCustomIdea(event.target.value)}
        />
      </label>
    </div>
  );
}

function HeroDirectionStep({
  childProfile,
  heroGender,
  setHeroGender,
  heroAge,
  setHeroAge,
  heroName,
  setHeroName,
  heroTraits,
  setHeroTraits,
  heroDescription,
  setHeroDescription,
  descriptionStaleReason,
  heroSeedLoading,
  generateHeroSeed,
  toggleLimited,
}: {
  childProfile: ChildProfile;
  heroGender: HeroGender;
  setHeroGender: (value: HeroGender) => void;
  heroAge: number;
  setHeroAge: (value: number) => void;
  heroName: string;
  setHeroName: (value: string) => void;
  heroTraits: string[];
  setHeroTraits: (items: string[]) => void;
  heroDescription: string;
  setHeroDescription: (value: string) => void;
  descriptionStaleReason: string | null;
  heroSeedLoading: boolean;
  generateHeroSeed: () => void;
  toggleLimited: (value: string, list: string[], setter: (next: string[]) => void, max: number) => void;
}) {
  return (
    <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-5">
      <div className="space-y-4">
        <InfoNotice text="AI подготовит цельный профиль героя: характер, внешность, заметную деталь и подходящего спутника. Любую деталь можно отредактировать в описании." />
        <ChipSection title="Пол героя" options={HERO_GENDER_OPTIONS} selected={[heroGender]} onSelect={(id) => setHeroGender(id as HeroGender)} />
        <div>
          <p className="text-sm font-semibold mb-2">Возраст героя</p>
          <div className="flex items-center justify-between rounded-[var(--sh-radius)] border border-sh-border bg-white px-3 py-2">
            <button type="button" className="w-9 h-9 rounded-full border border-sh-border text-lg" onClick={() => setHeroAge(Math.max(6, heroAge - 1))}>−</button>
            <span className="text-sm font-semibold">{heroAge} лет</span>
            <button type="button" className="w-9 h-9 rounded-full border border-sh-border text-lg" onClick={() => setHeroAge(Math.min(12, heroAge + 1))}>+</button>
          </div>
          <p className="text-xs text-sh-muted mt-1">По умолчанию - возраст ребенка ({childProfile.age} лет).</p>
        </div>
        <label className="block text-sm font-semibold">
          Имя героя
          <input
            className="mt-2 w-full rounded-[var(--sh-radius)] border border-sh-border px-3 py-2 text-sm outline-none focus:border-sh-forest"
            value={heroName}
            onChange={(event) => setHeroName(sanitizeHeroNameInput(event.target.value))}
          />
        </label>
        <p className="text-xs text-sh-muted -mt-2">
          Имя героя должно быть только на английском: например, Lina, Max, Ruby или Leo.
        </p>
        {!isEnglishHeroName(heroName) && heroName.trim() ? (
          <p className="text-xs text-red-600 -mt-1">
            Используйте только английские буквы, пробел, дефис или апостроф.
          </p>
        ) : null}
        <ChipSection
          title="Черты характера (выберите до 4)"
          options={heroTraitOptionsForGender(heroGender)}
          selected={heroTraits}
          onSelect={(id) => toggleLimited(id, heroTraits, setHeroTraits, 4)}
        />
      </div>

      <div className="space-y-4">
        <NeutralHeroPlaceholder />
        {heroDescription.trim() ? (
          <>
            <label className="block text-sm font-semibold">
              Шаблон профиля героя
              <textarea
                className="mt-2 w-full min-h-[154px] rounded-[var(--sh-radius)] border border-sh-border px-3 py-2 text-sm leading-relaxed outline-none focus:border-sh-forest"
                value={heroDescription}
                onChange={(event) => setHeroDescription(event.target.value)}
                maxLength={600}
              />
            </label>
            <div className="text-right text-xs text-sh-muted">{heroDescription.length}/600</div>
          </>
        ) : (
          <div className="sh-card border-dashed p-4 text-sm text-sh-muted">
            Выберите параметры слева, затем нажмите «Сгенерировать профиль героя». AI подготовит подробный шаблон с внешностью, заметной деталью и спутником. После этого его можно будет отредактировать.
          </div>
        )}
        {descriptionStaleReason && (
          <div className="rounded-[var(--sh-radius)] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Параметры героя изменились. Отредактируйте шаблон вручную или сгенерируйте новый профиль.
          </div>
        )}
        <div>
          <Button
            onClick={generateHeroSeed}
            disabled={heroSeedLoading || Boolean(heroName.trim() && !isEnglishHeroName(heroName))}
          >
            {heroSeedLoading
              ? 'Генерируем профиль...'
              : heroDescription.trim()
                ? 'Сгенерировать новый профиль'
                : 'Сгенерировать профиль героя'}
          </Button>
        </div>
        <p className="text-xs text-sh-muted">
          AI использует выбранные имя, пол, возраст и черты, а также подберет спутника для этого мира. Готовый шаблон можно изменить вручную.
        </p>
        <p className="text-xs text-sh-muted">
          Иллюстрация героя будет создана после запуска сезона.
        </p>
      </div>
    </div>
  );
}

function ReviewStep({
  childProfile,
  selectedWorld,
  storyDirectionText,
  learningThemes,
  tone,
  vocabularyFocus,
  customIdea,
  heroGender,
  heroAge,
  heroName,
  heroTraits,
  heroCompanion,
  heroDescription,
  onEditChild,
  onEditDirection,
  onEditHero,
}: {
  childProfile: ChildProfile;
  selectedWorld?: { imagePath: string; title: string; shortDescription: string } | null;
  storyDirectionText: string;
  learningThemes: string[];
  tone: string;
  vocabularyFocus: string[];
  customIdea: string;
  heroGender: HeroGender;
  heroAge: number;
  heroName: string;
  heroTraits: string[];
  heroCompanion: string;
  heroDescription: string;
  onEditChild: () => void;
  onEditDirection: () => void;
  onEditHero: () => void;
}) {
  return (
    <div className="grid lg:grid-cols-[1fr_0.9fr] gap-5">
      <div className="space-y-3">
        <SummaryCard
          icon="👤"
          title="Ребенок"
          actionLabel="Изменить"
          onAction={onEditChild}
          className="ph-sensitive"
          lines={[`${childProfile.name}, ${childProfile.age} лет · уровень ${childProfile.englishLevel}`]}
        />
        <SummaryCard
          icon="📖"
          title="Направление истории"
          actionLabel="Изменить"
          onAction={onEditDirection}
          lines={[
            storyDirectionText,
            learningThemes.length ? `Темы: ${learningThemes.map((item) => optionLabel(LEARNING_THEME_OPTIONS, item)).join(', ')}` : '',
            `Тон: ${optionLabel(TONE_OPTIONS, tone)}`,
            vocabularyFocus.length ? `Словарь: ${vocabularyFocus.map((item) => optionLabel(VOCABULARY_OPTIONS, item)).join(', ')}` : '',
            customIdea ? `Идея: ${customIdea}` : '',
          ].filter(Boolean)}
        />
        <SummaryCard
          icon="☺"
          title="Главный герой"
          actionLabel="Изменить"
          onAction={onEditHero}
          lines={[
            `${heroName}, ${heroAge} лет · ${optionLabel(HERO_GENDER_OPTIONS, heroGender)}`,
            `Черты: ${heroTraits.map((item) => optionLabel(heroTraitOptionsForGender(heroGender), item)).join(', ') || 'AI подберет'}`,
            `Спутник: ${heroCompanion || 'AI подберет при создании профиля'}`,
            heroDescription.slice(0, 180),
          ]}
        />
      </div>
      <div className="space-y-3">
        <Card padding="md" className="overflow-hidden">
          {selectedWorld?.imagePath && (
            <div className="relative h-36 rounded-[var(--sh-radius)] overflow-hidden mb-3">
              <Image src={selectedWorld.imagePath} alt={selectedWorld.title} fill className="object-cover" sizes="360px" />
            </div>
          )}
          {selectedWorld && (
            <div className="mb-3 rounded-[var(--sh-radius)] bg-[color:var(--sh-forest-soft)] px-3 py-2 text-sm">
              <span className="font-semibold text-sh-foreground">{selectedWorld.title}</span>
              <span className="text-sh-muted"> В· {selectedWorld.shortDescription}</span>
            </div>
          )}
          <p className="text-sm font-bold text-sh-foreground">Что будет создано</p>
          <ul className="mt-3 space-y-2 text-sm text-sh-muted">
            {[
              'Продолжительный сезон с развивающейся сюжетной аркой',
              'Короткие главы на 2-2.5 минуты с озвучкой на английском',
              'Выборы и практика speaking & writing',
              'Фокус словаря и storybook-иллюстрации',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-0.5 text-sh-forest">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
        <InfoNotice text="После запуска мы начнем писать сюжетную арку, первый эпизод, аудио и иллюстрации. Обычно это занимает 2-3 минуты." />
      </div>
    </div>
  );
}

function ChipSection({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: { id: string; label: string }[];
  selected: string[];
  onSelect: (id: string) => void;
}) {
  return (
    <section>
      <p className="text-sm font-semibold text-sh-foreground mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selected={selected.includes(option.id)}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
    </section>
  );
}

function getStoryWorldCards(interfaceLanguage: 'english' | 'russian') {
  return WORLD_PRESETS.map((world) => {
    const preset = getStoryWorldPreset(world.id);
    const russian = interfaceLanguage === 'russian';
    return {
      id: world.id,
      title: russian ? (preset?.titleRu || preset?.title || world.title) : (preset?.title || world.title),
      shortDescription: russian
        ? (preset?.shortDescriptionRu || preset?.shortDescription || world.description)
        : (preset?.shortDescription || world.description),
      longDescription: preset?.longDescription || '',
      internalPromptNotes: preset?.internalPromptNotes || [],
      suggestedThemes: preset?.suggestedThemes || [],
      suggestedVocabularyFocus: preset?.suggestedVocabularyFocus || [],
      imagePath: preset?.imagePath || world.image,
      imagePrompt: preset?.imagePrompt || '',
      altText: preset?.altText || world.altText,
    };
  });
}

function NeutralHeroPlaceholder() {
  return (
    <Card padding="md" variant="flat" className="bg-sh-forest-soft/40">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white border border-sh-border flex items-center justify-center text-xl">✨</div>
        <div>
          <p className="text-sm font-bold text-sh-foreground">Визуальный образ появится позже</p>
          <p className="text-xs text-sh-muted mt-1">Сейчас мы задаем только текстовую основу героя. Изображение будет создано после старта сезона.</p>
        </div>
      </div>
    </Card>
  );
}

function SummaryCard({
  icon,
  title,
  lines,
  href,
  actionLabel,
  onAction,
  className = '',
}: {
  icon: string;
  title: string;
  lines: string[];
  href?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <Card padding="md" className={className}>
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-[var(--sh-radius)] bg-sh-forest-soft text-sh-forest flex items-center justify-center shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-sh-foreground">{title}</p>
            {actionLabel && href && (
              <Button href={href} variant="secondary" className="!min-h-[28px] h-7 px-2.5 py-0 text-xs">
                {actionLabel}
              </Button>
            )}
            {actionLabel && !href && onAction && (
              <Button onClick={onAction} variant="secondary" className="!min-h-[28px] h-7 px-2.5 py-0 text-xs">
                {actionLabel}
              </Button>
            )}
          </div>
          <div className="mt-1 space-y-1">
            {lines.map((line) => (
              <p key={line} className="text-xs text-sh-muted leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function InfoNotice({ text }: { text: string }) {
  return (
    <div className="rounded-[var(--sh-radius)] border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
      <span className="font-semibold">✨ </span>{text}
    </div>
  );
}

