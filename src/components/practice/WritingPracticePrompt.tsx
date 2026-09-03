import { Button, Card, ModalOverlay } from '@/components/ui';
import { getUiLanguage } from '@/lib/ui-language';

type WritingPracticePromptProps = {
  open: boolean;
  wordCount: number;
  maxReward: number;
  onStart: () => void;
  onDismiss: () => void;
};

export default function WritingPracticePrompt({
  open,
  wordCount,
  maxReward,
  onStart,
  onDismiss,
}: WritingPracticePromptProps) {
  if (!open) return null;

  const isRussian = getUiLanguage() === 'russian';
  const titleId = 'writing-practice-prompt-title';

  return (
    <ModalOverlay
      className="items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <Card className="w-full max-w-sm overflow-hidden" padding="none">
        <div className="px-6 pb-6 pt-7 text-center sm:px-7">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sh-forest-soft text-sh-forest">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 5.75A3.25 3.25 0 0 1 7.75 2.5H11v16H7.75a3.25 3.25 0 0 0-3.25 3.25v-16Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.75a3.25 3.25 0 0 0-3.25-3.25H13v16h3.25a3.25 3.25 0 0 1 3.25 3.25v-16Z" />
            </svg>
          </div>
          <div className="mt-4 text-xs font-semibold uppercase text-sh-forest">
            {isRussian ? 'Словарный бонус' : 'Vocabulary bonus'}
          </div>
          <h2 id={titleId} className="mt-2 font-story text-2xl font-bold leading-tight text-sh-foreground">
            {isRussian ? 'Проверь, как хорошо ты запомнил слова' : 'See how well you remember the words'}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-sh-muted">
            {isRussian
              ? 'Небольшая практика по словам из истории.'
              : 'A short practice with words from the story.'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3 rounded-[var(--sh-radius)] bg-sh-forest-soft px-4 py-3 text-sm">
            <span className="font-semibold text-sh-foreground">
              {wordCount} {isRussian ? 'слов' : wordCount === 1 ? 'word' : 'words'}
            </span>
            <span className="h-4 w-px bg-sh-forest/20" aria-hidden="true" />
            <span className="font-semibold text-sh-forest">
              <span aria-hidden="true">◆</span> {isRussian ? `до +${maxReward} кристаллов` : `up to +${maxReward} crystals`}
            </span>
          </div>
          <div className="mt-5 flex flex-col gap-1">
            <Button fullWidth onClick={onStart}>
              {isRussian ? 'Пройти диктант' : 'Start practice'}
            </Button>
            <Button variant="ghost" fullWidth onClick={onDismiss}>
              {isRussian ? 'Не сейчас' : 'Not now'}
            </Button>
          </div>
        </div>
      </Card>
    </ModalOverlay>
  );
}
