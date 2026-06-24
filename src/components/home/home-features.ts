import { imageAssets } from '@/data/image-assets';

export type HomeFeature = {
  key: string;
  title: string;
  description: string;
  /** First-visit / mobile list thumbnail */
  image: string;
  /** Explore StoryHop bottom illustration (wide, matched top tint) */
  exploreImage: string;
  iconImage: string;
  iconBg: string;
  /** Solid tint for explore card + image well (matches mockup) */
  cardColor: string;
  icon: 'audio' | 'choices' | 'speaking' | 'crystals' | 'storybook' | 'progress';
};

const exploreIcons = imageAssets.home.exploreIcons;
const exploreThumbs = imageAssets.home.exploreThumbs;

export const HOME_FEATURES: HomeFeature[] = [
  {
    key: 'audio',
    title: 'Sample chapter + audio',
    description: 'Short English chapters with narration.',
    image: imageAssets.home.features.audio,
    exploreImage: exploreThumbs.audio,
    iconImage: exploreIcons.audio,
    iconBg: 'bg-emerald-100 text-emerald-600',
    cardColor: '#EBFAF3',
    icon: 'audio',
  },
  {
    key: 'choices',
    title: 'Choices that matter',
    description: 'Decisions shape the adventure.',
    image: imageAssets.home.features.choices,
    exploreImage: exploreThumbs.choices,
    iconImage: exploreIcons.choices,
    iconBg: 'bg-orange-100 text-orange-600',
    cardColor: '#FEF2E6',
    icon: 'choices',
  },
  {
    key: 'speaking',
    title: 'Speaking practice',
    description: 'Repeat phrases from the story.',
    image: imageAssets.home.features.speaking,
    exploreImage: exploreThumbs.speaking,
    iconImage: exploreIcons.speaking,
    iconBg: 'bg-sky-100 text-sky-600',
    cardColor: '#E4F2FB',
    icon: 'speaking',
  },
  {
    key: 'crystals',
    title: 'Crystals & rewards',
    description: 'Earn crystals for progress.',
    image: imageAssets.home.features.crystals,
    exploreImage: exploreThumbs.crystals,
    iconImage: exploreIcons.crystals,
    iconBg: 'bg-amber-100 text-amber-600',
    cardColor: '#FFF8DB',
    icon: 'crystals',
  },
  {
    key: 'storybook',
    title: 'Storybook gallery',
    description: 'Unlock illustrations per chapter.',
    image: imageAssets.home.features.storybook,
    exploreImage: exploreThumbs.storybook,
    iconImage: exploreIcons.storybook,
    iconBg: 'bg-violet-100 text-violet-600',
    cardColor: '#E8E2FB',
    icon: 'storybook',
  },
  {
    key: 'progress',
    title: 'Parent progress',
    description: 'Track listening, speaking, vocabulary.',
    image: imageAssets.home.features.parentProgress,
    exploreImage: imageAssets.parent.illustration,
    iconImage: exploreIcons.progress,
    iconBg: 'bg-teal-100 text-teal-600',
    cardColor: '#E5FCF9',
    icon: 'progress',
  },
];
