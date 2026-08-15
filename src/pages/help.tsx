import AppShell from '@/components/layout/AppShell';
import { Button, Card } from '@/components/ui';

export default function HelpPage() {
  return (
    <AppShell shellVariant="framed" maxWidth="default">
      <div className="mx-auto max-w-2xl py-4 sm:py-10">
        <h1 className="font-story text-3xl font-bold text-sh-foreground">Помощь</h1>
        <p className="mt-3 text-base text-sh-muted">Если что-то не работает, напишите нам. Укажите устройство, страницу и коротко опишите проблему.</p>
        <Card padding="lg" className="mt-6"><p className="text-sm font-semibold">Поддержка StoryHop</p><p className="mt-1 text-sm text-sh-muted">Обычно полезнее всего приложить скриншот.</p><Button href="mailto:shepelenko.p@gmail.com" className="mt-4">Написать в поддержку</Button></Card>
      </div>
    </AppShell>
  );
}
