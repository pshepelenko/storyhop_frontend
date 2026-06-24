import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import WizardLayout from '@/components/layout/WizardLayout';
import { Button, Card, Chip } from '@/components/ui';
import { LEARNING_THEMES, TONE_PRESETS, VOCABULARY_PRESETS } from '@/data/season-presets';
import { getChannelUserId, getUiLanguage, setUiLanguage } from '@/lib/ui-language';

type HeroPreview = {
  preferredName: string;
  heroType: string;
  traits: string[];
  companion: string;
  favoriteColor: string;
  accessory: string;
  presetImageUrl?: string;
  caption?: string;
};

const TRAIT_OPTIONS = ['Curious', 'Kind', 'Brave', 'Creative', 'Calm', 'Funny'];

export default function NewSeasonPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [heroLoading, setHeroLoading] = useState(false);

  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('8');
  const [languageLevel, setLanguageLevel] = useState('A1');
  const [interfaceLanguage, setInterfaceLanguage] = useState<'english' | 'russian'>(getUiLanguage());

  const [world, setWorld] = useState('');
  const [theme] = useState('');
  const [learningThemes, setLearningThemes] = useState<string[]>([]);
  const [preferredTone, setPreferredTone] = useState('Warm');
  const [vocabularyFocus, setVocabularyFocus] = useState<string[]>([]);
  const [customTheme, setCustomTheme] = useState('');

  const [hero, setHero] = useState<HeroPreview | null>(null);
  const [heroName, setHeroName] = useState('');
  const [heroType, setHeroType] = useState('');
  const [heroTraits, setHeroTraits] = useState<string[]>([]);
  const [companion, setCompanion] = useState('');
  const [favoriteColor, setFavoriteColor] = useState('');
  const [accessory, setAccessory] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('lastMainCharacterName');
    if (saved) setChildName(saved);
  }, []);

  const toggleChip = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    max: number,
  ) => {
    if (list.includes(value)) {
      setList(list.filter((x) => x !== value));
    } else if (list.length < max) {
      setList([...list, value]);
    }
  };

  const loadHeroPreview = useCallback(async () => {
    if (!childName.trim() || !world.trim()) return;
    setHeroLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/hero-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName,
          childAge,
          languageLevel,
          world,
          theme: theme || learningThemes.join(', ') || customTheme,
          preferredTone,
          vocabularyFocus,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setHero(data);
        setHeroName(data.preferredName || childName);
        setHeroType(data.heroType || '');
        setHeroTraits(data.traits || []);
        setCompanion(data.companion || '');
        setFavoriteColor(data.favoriteColor || '');
        setAccessory(data.accessory || '');
      }
    } finally {
      setHeroLoading(false);
    }
  }, [childName, childAge, languageLevel, world, theme, learningThemes, customTheme, preferredTone, vocabularyFocus]);

  useEffect(() => {
    if (step === 3 && !hero && world.trim()) {
      loadHeroPreview();
    }
  }, [step, hero, world, loadHeroPreview]);

  const createSeason = async () => {
    setLoading(true);
    setError('');
    setUiLanguage(interfaceLanguage);
    localStorage.setItem('storyLanguage', 'english');
    localStorage.setItem('lastMainCharacterName', childName);

    const combinedTheme = [
      ...learningThemes,
      customTheme.trim(),
      theme.trim(),
    ].filter(Boolean).join('; ') || 'Learning adventure';

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelUserId: getChannelUserId(),
          channel: 'web-app',
          childName,
          childAge,
          languageLevel,
          theme: combinedTheme,
          world,
          vocabularyFocus,
          preferredTone,
          comments: customTheme,
          learningThemes,
          interfaceLanguage,
          heroPreferences: {
            preferredName: heroName,
            heroType,
            traits: heroTraits,
            companion,
            favoriteColor,
            accessory,
          },
        }),
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      router.push(`/seasons/${data.seasonId}/creating`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not create season');
    } finally {
      setLoading(false);
    }
  };

  const footer = step < 4 ? (
    <div className="flex gap-3">
      {step > 1 && (
        <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
          Back
        </Button>
      )}
      <Button
        onClick={() => setStep(step + 1)}
        className="flex-1"
        disabled={
          (step === 1 && !childName.trim()) ||
          (step === 2 && !world.trim()) ||
          (step === 3 && !heroName.trim())
        }
      >
        {step === 1 ? 'Next: Story taste' : step === 2 ? 'Next: Hero direction' : 'Next: Review'}
      </Button>
    </div>
  ) : (
    <div className="flex gap-3">
      <Button variant="secondary" onClick={() => setStep(3)} className="flex-1">
        Back to edit
      </Button>
      <Button onClick={createSeason} disabled={loading} className="flex-1">
        {loading ? 'Creating...' : 'Create season ✨'}
      </Button>
    </div>
  );

  return (
    <AppShell maxWidth="default">
      <WizardLayout
        step={step}
        title={
          step === 1 ? "Let's start with your child" :
          step === 2 ? 'What kind of story will they love?' :
          step === 3 ? 'Who is the hero of this adventure?' :
          'Setup summary'
        }
        footer={footer}
      >
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Child name
              <input
                className="mt-1 w-full border border-sh-border rounded-sh px-3 py-2"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
              />
            </label>
            <div>
              <p className="text-sm font-medium mb-2">Age</p>
              <div className="flex flex-wrap gap-2">
                {['6', '7', '8', '9', '10'].map((age) => (
                  <Chip
                    key={age}
                    label={age}
                    selected={childAge === age}
                    onClick={() => setChildAge(age)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">English level</p>
              <div className="flex flex-wrap gap-2">
                {['A0', 'A1', 'A2'].map((lvl) => (
                  <Chip
                    key={lvl}
                    label={lvl}
                    selected={languageLevel === lvl}
                    onClick={() => setLanguageLevel(lvl)}
                  />
                ))}
              </div>
              <p className="text-xs text-sh-muted mt-1">Episodes and vocabulary match this level.</p>
            </div>
            <label className="block text-sm font-medium">
              Interface language
              <select
                className="mt-1 w-full border border-sh-border rounded-sh px-3 py-2"
                value={interfaceLanguage}
                onChange={(e) => setInterfaceLanguage(e.target.value as 'english' | 'russian')}
              >
                <option value="english">English</option>
                <option value="russian">Russian</option>
              </select>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              World / theme
              <input
                className="mt-1 w-full border border-sh-border rounded-sh px-3 py-2"
                placeholder="Magical academy in the clouds"
                value={world}
                onChange={(e) => setWorld(e.target.value)}
              />
            </label>
            <div>
              <p className="text-sm font-medium mb-2">Learning theme (up to 2)</p>
              <div className="flex flex-wrap gap-2">
                {LEARNING_THEMES.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    selected={learningThemes.includes(t)}
                    onClick={() => toggleChip(t, learningThemes, setLearningThemes, 2)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Tone</p>
              <div className="flex flex-wrap gap-2">
                {TONE_PRESETS.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    selected={preferredTone === t}
                    onClick={() => setPreferredTone(t)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Vocabulary focus (up to 3)</p>
              <div className="flex flex-wrap gap-2">
                {VOCABULARY_PRESETS.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    selected={vocabularyFocus.includes(t)}
                    onClick={() => toggleChip(t, vocabularyFocus, setVocabularyFocus, 3)}
                  />
                ))}
              </div>
            </div>
            <label className="block text-sm font-medium">
              Custom theme (optional)
              <textarea
                className="mt-1 w-full border border-sh-border rounded-sh px-3 py-2 text-sm"
                rows={2}
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Card padding="md" className="text-center">
              {hero?.presetImageUrl && (
                <img src={hero.presetImageUrl} alt="Hero preview" className="mx-auto h-32 w-32 object-contain" />
              )}
              <p className="text-xs text-sh-muted mt-2">{hero?.caption}</p>
              <Button variant="ghost" onClick={loadHeroPreview} disabled={heroLoading} className="mt-2 text-sm">
                {heroLoading ? 'Generating...' : '🔄 Regenerate'}
              </Button>
            </Card>
            <label className="block text-sm font-medium">
              Hero name
              <input className="mt-1 w-full border border-sh-border rounded-sh px-3 py-2" value={heroName} onChange={(e) => setHeroName(e.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Hero type
              <input className="mt-1 w-full border border-sh-border rounded-sh px-3 py-2" value={heroType} onChange={(e) => setHeroType(e.target.value)} />
            </label>
            <div>
              <p className="text-sm font-medium mb-2">Personality traits</p>
              <div className="flex flex-wrap gap-2">
                {TRAIT_OPTIONS.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    selected={heroTraits.includes(t)}
                    onClick={() => toggleChip(t, heroTraits, setHeroTraits, 4)}
                  />
                ))}
              </div>
            </div>
            <label className="block text-sm font-medium">
              Companion
              <input className="mt-1 w-full border border-sh-border rounded-sh px-3 py-2" value={companion} onChange={(e) => setCompanion(e.target.value)} />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Card padding="sm">
              <p className="font-semibold text-sm">Child profile</p>
              <p className="text-xs text-sh-muted mt-1">{childName}, age {childAge}, {languageLevel}</p>
            </Card>
            <Card padding="sm">
              <p className="font-semibold text-sm">Story direction</p>
              <p className="text-xs text-sh-muted mt-1">{world}</p>
              <p className="text-xs text-sh-muted">Themes: {learningThemes.join(', ') || customTheme || '—'}</p>
            </Card>
            <Card padding="sm">
              <p className="font-semibold text-sm">Hero seed</p>
              <p className="text-xs text-sh-muted mt-1">{heroName} · {heroTraits.join(', ')} · {companion}</p>
            </Card>
            <Card padding="sm">
              <p className="font-semibold text-sm mb-2">What will be created</p>
              <ul className="text-xs text-sh-muted space-y-1 list-disc list-inside">
                <li>90–100 episodes</li>
                <li>2–2.5 minute chapters with English audio</li>
                <li>Choices, speaking practice, storybook illustrations</li>
              </ul>
            </Card>
          </div>
        )}
      </WizardLayout>
    </AppShell>
  );
}
