import { STORY_WORLD_PRESETS, worldLabel } from '@/data/storyWorlds';
import { LearningTheme, StoryWorldId, VocabularyFocus } from '@/types/storyWorlds';

export type PresetOption<T extends string = string> = {
  id: T;
  label: string;
  description?: string;
};

export type WorldPreset = {
  id: StoryWorldId;
  label: string;
  description: string;
  image: string;
  title: string;
  altText: string;
};

export const WORLD_PRESETS: WorldPreset[] = STORY_WORLD_PRESETS.map((world) => ({
  id: world.id,
  title: world.title,
  label: world.title,
  description: world.shortDescription,
  image: world.imagePath,
  altText: world.altText,
}));

export const LEARNING_THEME_OPTIONS: PresetOption<LearningTheme>[] = [
  { id: 'teamwork', label: 'Дружба' },
  { id: 'listening', label: 'Умение слушать' },
  { id: 'confidence', label: 'Уверенность' },
  { id: 'emotions', label: 'Эмоции' },
  { id: 'problem_solving', label: 'Решение проблем' },
  { id: 'kindness', label: 'Доброта' },
  { id: 'respect', label: 'Уважение' },
  { id: 'sharing', label: 'Делиться' },
  { id: 'courage', label: 'Смелость' },
  { id: 'friendship', label: 'Товарищество' },
  { id: 'patience', label: 'Терпение' },
  { id: 'honesty', label: 'Честность' },
  { id: 'empathy', label: 'Эмпатия' },
  { id: 'responsibility', label: 'Ответственность' },
  { id: 'curiosity', label: 'Любознательность' },
  { id: 'gratitude', label: 'Благодарность' },
  { id: 'self_control', label: 'Самоконтроль' },
  { id: 'helping_others', label: 'Помощь другим' },
  { id: 'including_everyone', label: 'Включать всех' },
  { id: 'trying_again', label: 'Пробовать снова' },
];

export const TONE_OPTIONS: PresetOption[] = [
  { id: 'adventurous', label: 'Приключенческий' },
  { id: 'warm', label: 'Теплый' },
  { id: 'funny', label: 'Веселый' },
  { id: 'calm', label: 'Спокойный' },
  { id: 'exciting', label: 'Захватывающий' },
  { id: 'magical', label: 'Волшебный' },
  { id: 'inspirational', label: 'Вдохновляющий' },
];

export const VOCABULARY_OPTIONS: PresetOption<VocabularyFocus>[] = [
  { id: 'nature', label: 'Природа' },
  { id: 'friends', label: 'Друзья' },
  { id: 'school', label: 'Школа' },
  { id: 'feelings', label: 'Чувства' },
  { id: 'science', label: 'Наука' },
  { id: 'animals', label: 'Животные' },
  { id: 'places', label: 'Места' },
  { id: 'actions', label: 'Действия' },
  { id: 'home', label: 'Дом' },
  { id: 'bravery', label: 'Смелость' },
  { id: 'help', label: 'Помощь' },
  { id: 'listen', label: 'Слушать' },
];

export const HERO_TRAIT_OPTIONS: PresetOption[] = [
  { id: 'curious', label: 'Любознательная' },
  { id: 'kind', label: 'Добрая' },
  { id: 'brave', label: 'Смелая' },
  { id: 'creative', label: 'Творческая' },
  { id: 'calm', label: 'Спокойная' },
  { id: 'funny', label: 'Веселая' },
  { id: 'thoughtful', label: 'Внимательная' },
  { id: 'determined', label: 'Решительная' },
  { id: 'careful', label: 'Осторожная' },
  { id: 'inventive', label: 'Изобретательная' },
];

export const COMPANION_TYPE_OPTIONS: PresetOption[] = [
  { id: 'animal', label: 'Животное' },
  { id: 'magical_creature', label: 'Волшебное существо' },
  { id: 'dragon', label: 'Дракон' },
  { id: 'robot', label: 'Робот' },
  { id: 'owl', label: 'Сова' },
  { id: 'fox', label: 'Лиса' },
  { id: 'cat', label: 'Кот' },
  { id: 'other', label: 'Другое' },
];

export const optionLabel = (options: PresetOption[], id?: string | null) =>
  options.find((option) => option.id === id)?.label || id || '';

export { worldLabel };
export type { StoryWorldId };

export const LEARNING_THEMES = LEARNING_THEME_OPTIONS.map((option) => option.label);
export const TONE_PRESETS = TONE_OPTIONS.map((option) => option.label);
export const VOCABULARY_PRESETS = VOCABULARY_OPTIONS.map((option) => option.label);
