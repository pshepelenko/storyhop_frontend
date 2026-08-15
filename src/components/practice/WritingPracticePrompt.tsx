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

  return (
    <ModalOverlay className="items-center justify-center" role="dialog" aria-modal="true">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-xs font-semibold uppercase tracking-wide text-sh-forest">
          {isRussian ? 'Бонус' : 'Bonus'}
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-sh-foreground">
          {isRussian ? 'Словарный диктант' : 'Spelling practice'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-sh-muted">
          {isRussian
            ? `Проверь, как хорошо ты помнишь слова из истории. ${wordCount} слова могут принести до +${maxReward} кристаллов.`
            : `Practice words from this story. ${wordCount} words can earn up to +${maxReward} crystals.`}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button fullWidth onClick={onStart}>
            {isRussian ? 'Пройти диктант' : 'Start practice'}
          </Button>
          <Button variant="secondary" fullWidth onClick={onDismiss}>
            {isRussian ? 'Не сейчас' : 'Not now'}
          </Button>
        </div>
      </Card>
    </ModalOverlay>
  );
}
