import Head from 'next/head';
import { ReactNode } from 'react';
import {
  AgeStepper,
  Button,
  Card,
  Chip,
  EpisodeAudioPlayer,
  EpisodeChoiceCard,
  FeatureCard,
  ModalOverlay,
  PlayIcon,
  ProgressBar,
  ProgressRing,
  SectionHeader,
  SettingsRow,
  SegmentedControl,
  TrustBadge,
  VocabHighlightText,
  VocabPracticeRow,
} from '@/components/ui';
import { imageAssets } from '@/data/image-assets';
import TodayActionsSection from '@/components/home/TodayActionsSection';

function KitSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="sh-section-title text-lg">{title}</h2>
      {children}
    </section>
  );
}

function Swatch({ name, variable }: { name: string; variable: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg border border-sh-border shrink-0" style={{ background: `var(${variable})` }} />
      <div>
        <p className="text-sm font-medium text-sh-foreground">{name}</p>
        <p className="text-xs text-sh-muted font-mono">{variable}</p>
      </div>
    </div>
  );
}

export default function UiKitPage() {
  return (
    <>
      <Head>
        <title>StoryHop UI Kit</title>
      </Head>
      <div className="min-h-screen bg-[var(--sh-page-bg)] py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-sh-muted">StoryHop</p>
            <h1 className="font-story text-3xl font-bold text-sh-foreground">UI Kit</h1>
            <p className="text-sm text-sh-muted leading-relaxed">
              Живая витрина компонентов из <code className="text-xs bg-white px-1 py-0.5 rounded">@/components/ui</code>.
              Документация: <code className="text-xs bg-white px-1 py-0.5 rounded">docs/ui-kit.md</code>
            </p>
          </header>

          <KitSection title="Colors & tokens">
            <div className="grid sm:grid-cols-2 gap-3">
              <Swatch name="Forest (primary)" variable="--sh-forest" />
              <Swatch name="Forest soft" variable="--sh-forest-soft" />
              <Swatch name="Foreground" variable="--sh-foreground" />
              <Swatch name="Muted" variable="--sh-muted" />
              <Swatch name="Border" variable="--sh-border" />
              <Swatch name="Page background" variable="--sh-page-bg" />
            </div>
          </KitSection>

          <KitSection title="Typography">
            <Card>
              <p className="font-story text-2xl font-bold">StoryHop — serif / marketing</p>
              <p className="sh-section-title mt-4">Section title — sh-section-title</p>
              <p className="text-sm text-sh-muted mt-2">Body muted — text-sm text-sh-muted</p>
              <span className="sh-pill bg-sh-forest-soft text-sh-forest mt-4">ACTIVE SEASON</span>
            </Card>
          </KitSection>

          <KitSection title="Button">
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="soft">Soft</Button>
              <Button variant="secondary">Secondary (outlined)</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <Card className="space-y-3">
              <p className="text-xs text-sh-muted">Compact secondary (заголовки секций)</p>
              <Button
                variant="secondary"
                className="!min-h-[28px] h-7 py-0 px-2.5 text-xs font-semibold whitespace-nowrap"
              >
                Создать сезон
              </Button>
              <p className="text-xs text-sh-muted">
                Outlined: текст и граница одного цвета, толщина границы 1px.
              </p>
            </Card>
            <Button fullWidth>Full width primary</Button>
          </KitSection>

          <KitSection title="Card">
            <div className="grid sm:grid-cols-3 gap-3">
              <Card padding="md">
                <p className="text-sm font-semibold">Default</p>
                <p className="text-xs text-sh-muted mt-1">shadow + border</p>
              </Card>
              <Card variant="flat" padding="md">
                <p className="text-sm font-semibold">Flat</p>
                <p className="text-xs text-sh-muted mt-1">без тени</p>
              </Card>
              <Card variant="dashed" padding="md">
                <p className="text-sm font-semibold">Dashed</p>
                <p className="text-xs text-sh-muted mt-1">empty state</p>
              </Card>
            </div>
            <div className="sh-card p-4">
              <p className="text-sm">Utility class <code className="text-xs">.sh-card</code></p>
            </div>
          </KitSection>

          <KitSection title="Chip">
            <div className="flex flex-wrap gap-2">
              <Chip label="English" />
              <Chip label="Russian" selected />
              <Chip label="Locked" disabled />
            </div>
          </KitSection>

          <KitSection title="SectionHeader">
            <SectionHeader
              title="My seasons"
              subtitle="Optional subtitle"
              action={
                <Button
                  variant="secondary"
                  className="!min-h-[28px] h-7 py-0 px-2.5 text-xs font-semibold whitespace-nowrap"
                >
                  Создать сезон
                </Button>
              }
            />
            <Card padding="sm">
              <p className="text-sm text-sh-muted">Контент секции…</p>
            </Card>
          </KitSection>

          <KitSection title="Progress">
            <Card className="space-y-6">
              <ProgressBar value={38} label="Season progress" />
              <div className="flex justify-center">
                <ProgressRing value={72} label="Completion" />
              </div>
            </Card>
          </KitSection>

          <KitSection title="TrustBadge">
            <TrustBadge>
              Stories are age-appropriate. No ads. Parent progress stays private.
            </TrustBadge>
          </KitSection>

          <KitSection title="FeatureCard">
            <FeatureCard
              title="Sample chapter + audio"
              description="Listen to a short episode with your child."
              imageSrc={imageAssets.home.features.audio}
              accentClass="bg-sh-green-soft"
            />
          </KitSection>

          <KitSection title="PlayIcon">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sh-forest text-white">
                <PlayIcon className="h-5 w-5 translate-x-px" />
              </span>
              <p className="text-sm text-sh-muted">Fixed SVG glyph for play actions. It must not use an emoji character.</p>
            </div>
          </KitSection>

          <KitSection title="ModalOverlay">
            <div className="relative min-h-48 overflow-hidden rounded-[var(--sh-radius-lg)] border border-sh-border bg-sh-page-bg p-5">
              <ModalOverlay position="absolute" className="items-center justify-center">
                <Card className="w-64" padding="sm">
                  <p className="text-sm font-semibold">Neutral modal overlay</p>
                  <p className="mt-1 text-xs text-sh-muted">Gray, translucent, and consistent.</p>
                </Card>
              </ModalOverlay>
            </div>
          </KitSection>

          <KitSection title="Home actions">
            <TodayActionsSection
              seasonId="preview-season"
              languageOverride="russian"
              actions={{
                spellingAvailableWordsCount: 12,
                speakingAvailablePhrasesCount: 5,
                rewardsCount: 67,
              }}
            />
          </KitSection>

          <KitSection title="SettingsRow">
            <Card padding="none" className="overflow-hidden">
              <SettingsRow label="Language" description="Interface language" href="#" />
              <SettingsRow label="Notifications" description="Episode ready alerts" href="#" />
            </Card>
          </KitSection>

          <KitSection title="Profile controls">
            <Card className="space-y-5">
              <SegmentedControl
                ariaLabel="Profile gender"
                value="girl"
                onChange={() => {}}
                segments={[
                  { value: 'girl', label: 'Girl' },
                  { value: 'boy', label: 'Boy' },
                ]}
              />
              <AgeStepper value={8} min={6} max={10} onChange={() => {}} />
            </Card>
          </KitSection>

          <KitSection title="Episode reader">
            <Card className="space-y-5">
              <EpisodeAudioPlayer label="The Spiral Path Opens" />
              <EpisodeAudioPlayer variant="inline" label="Inline player" />
              <p className="font-story text-base leading-relaxed">
                <VocabHighlightText
                  text="The green crystal glowed brighter as the spiral path opened through the vines."
                  vocabulary={[
                    { term: 'crystal', translationRu: 'кристалл' },
                    { term: 'spiral', translationRu: 'спираль' },
                    { term: 'vines', translationRu: 'лозы' },
                  ]}
                />
              </p>
              <VocabPracticeRow
                words={[
                  { term: 'crystal', translationRu: 'кристалл' },
                  { term: 'spiral', translationRu: 'спираль' },
                  { term: 'vines', translationRu: 'лозы' },
                ]}
                className="!block"
              />
              <div className="flex flex-col lg:flex-row gap-3">
                <EpisodeChoiceCard
                  choiceId="A"
                  text="Touch the green crystal with the Hearth-Lantern."
                  onRequestConfirm={() => {}}
                  onSelect={() => {}}
                />
                <EpisodeChoiceCard
                  choiceId="B"
                  text="Ask Ivar and the dragons to place their hands together."
                  onRequestConfirm={() => {}}
                  onSelect={() => {}}
                />
              </div>
            </Card>
          </KitSection>
        </div>
      </div>
    </>
  );
}
