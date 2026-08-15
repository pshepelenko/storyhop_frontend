export type StoryWorldId =
  | 'magical_academy'
  | 'whispering_forest'
  | 'mystery_town'
  | 'creature_rescue_isles'
  | 'museum_of_living_wonders'
  | 'star_harbor';

export type LearningTheme =
  | 'teamwork'
  | 'listening'
  | 'confidence'
  | 'emotions'
  | 'problem_solving'
  | 'kindness'
  | 'respect'
  | 'sharing'
  | 'courage'
  | 'friendship'
  | 'patience'
  | 'honesty'
  | 'empathy'
  | 'responsibility'
  | 'curiosity'
  | 'gratitude'
  | 'self_control'
  | 'helping_others'
  | 'including_everyone'
  | 'trying_again';

export type VocabularyFocus =
  | 'nature'
  | 'friends'
  | 'school'
  | 'feelings'
  | 'science'
  | 'animals'
  | 'places'
  | 'actions'
  | 'home'
  | 'bravery'
  | 'help'
  | 'listen';

export interface StoryWorldPreset {
  id: StoryWorldId;
  title: string;
  titleRu?: string;
  shortDescription: string;
  shortDescriptionRu?: string;
  longDescription: string;
  internalPromptNotes: string[];
  suggestedThemes: LearningTheme[];
  suggestedVocabularyFocus: VocabularyFocus[];
  imagePath: string;
  imagePrompt: string;
  altText: string;
}
