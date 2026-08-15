import { Button, Card } from '@/components/ui';
import type { LibraryCopy } from '../library-copy';

type Props = {
  copy: LibraryCopy;
  onRetry: () => void;
};

export default function LibraryErrorState({ copy, onRetry }: Props) {
  return (
    <Card padding="lg" className="text-center max-w-lg mx-auto">
      <h2 className="text-lg font-bold font-story text-sh-foreground">{copy.errorTitle}</h2>
      <p className="text-sm text-sh-muted mt-2">{copy.errorText}</p>
      <Button onClick={onRetry} className="mt-6">
        {copy.tryAgain}
      </Button>
    </Card>
  );
}
