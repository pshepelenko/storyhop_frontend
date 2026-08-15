import type { UiLanguage } from '@/lib/ui-language';

export type BenefitItem = {
  title: string;
  description: string;
};

export type HomeEmptyCopy = {
  heroTitle: string;
  heroSubtitle: string;
  benefitsSectionTitle: string;
  forKidsTitle: string;
  forParentsTitle: string;
  kidsBenefits: BenefitItem[];
  parentsBenefits: BenefitItem[];
  demoCtaTitle: string;
  demoCtaSubtitle: string;
  demoCtaButton: string;
  storyCtaTitle: string;
  storyCtaSubtitle: string;
  storyCtaButton: string;
};

const COPY: Record<UiLanguage, HomeEmptyCopy> = {
  russian: {
    heroTitle: 'Увлекательное изучение английского через интерактивные истории',
    heroSubtitle:
      'Ребёнок слушает, читает, делает выборы и учит английский самостоятельно в безопасной среде.',
    benefitsSectionTitle: 'Почему StoryHop нравится детям и родителям',
    forKidsTitle: 'Для детей',
    forParentsTitle: 'Для родителей',
    kidsBenefits: [
      {
        title: 'Захватывающие истории',
        description: 'Погружают в волшебные приключения и удерживают внимание.',
      },
      {
        title: 'Выборы, которые имеют значение',
        description: 'Ребёнок принимает решения, которые влияют на развитие сюжета.',
      },
      {
        title: 'Яркие иллюстрации',
        description: 'Красочные сцены и персонажи оживляют каждую историю.',
      },
    ],
    parentsBenefits: [
      {
        title: 'Ребёнок учит английский самостоятельно',
        description: 'Интерактивные истории и задания помогают учиться без постоянной помощи взрослых.',
      },
      {
        title: 'Развиваются чтение, слушание и письмо',
        description: 'Комплексные задания развивают ключевые языковые навыки.',
      },
      {
        title: 'Панель для родителей',
        description: 'Отслеживайте прогресс, успехи и любимые темы ребёнка.',
      },
    ],
    demoCtaTitle: 'Попробуйте демо-историю',
    demoCtaSubtitle: 'Готовое приключение — без настройки',
    demoCtaButton: 'Начать демо',
    storyCtaTitle: 'Создайте первую историю',
    storyCtaSubtitle: '3 минуты — персональная история для вашего ребёнка',
    storyCtaButton: 'Создать историю',
  },
  english: {
    heroTitle: 'Engaging English learning through interactive stories',
    heroSubtitle:
      'Your child listens, reads, makes choices, and learns English independently in a safe environment.',
    benefitsSectionTitle: 'Why children and parents love StoryHop',
    forKidsTitle: 'For children',
    forParentsTitle: 'For parents',
    kidsBenefits: [
      {
        title: 'Captivating stories',
        description: 'Magical adventures that hold attention from start to finish.',
      },
      {
        title: 'Choices that matter',
        description: 'Your child makes decisions that shape how the story unfolds.',
      },
      {
        title: 'Vivid illustrations',
        description: 'Colorful scenes and characters bring every chapter to life.',
      },
    ],
    parentsBenefits: [
      {
        title: 'Independent English practice',
        description: 'Interactive stories and tasks help children learn without constant adult help.',
      },
      {
        title: 'Reading, listening, and writing',
        description: 'Integrated tasks build core language skills together.',
      },
      {
        title: 'Parent dashboard',
        description: 'Track progress, wins, and your child’s favorite themes in one place.',
      },
    ],
    demoCtaTitle: 'Try the demo story',
    demoCtaSubtitle: 'A ready-to-play adventure — no setup needed',
    demoCtaButton: 'Start demo',
    storyCtaTitle: 'Create your first story',
    storyCtaSubtitle: '3 minutes — a personalized story for your child',
    storyCtaButton: 'Create story',
  },
};

export function getHomeEmptyCopy(lang: UiLanguage): HomeEmptyCopy {
  return COPY[lang];
}
