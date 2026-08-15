import AppShell from '@/components/layout/AppShell';
import { Card } from '@/components/ui';

export default function PrivacyPage() {
  return (
    <AppShell shellVariant="framed" maxWidth="default">
      <article className="mx-auto max-w-2xl py-4 sm:py-10">
        <h1 className="font-story text-3xl font-bold text-sh-foreground">
          Конфиденциальность и данные
        </h1>
        <p className="mt-3 text-base text-sh-muted">
          StoryHop хранит данные, необходимые для персональных историй, обучения и работы аккаунта.
        </p>

        <div className="mt-6 space-y-4">
          <Card padding="lg">
            <h2 className="text-lg font-bold">Что мы сохраняем</h2>
            <p className="mt-2 text-sm leading-relaxed text-sh-muted">
              Имя или прозвище ребёнка, возраст, пол, уровень английского, созданные сезоны,
              прогресс чтения и результаты упражнений. Для аккаунта также сохраняется email.
            </p>
          </Card>

          <Card padding="lg">
            <h2 className="text-lg font-bold">Как используются данные</h2>
            <p className="mt-2 text-sm leading-relaxed text-sh-muted">
              Возраст, пол и уровень английского помогают настроить новые истории. Имя ребёнка
              не передаётся AI для генерации сюжетной арки. Тексты и аудио создаются через
              AI-провайдеров, иллюстрации — через Pixazo, готовые медиа хранятся в Cloudflare R2.
            </p>
          </Card>

          <Card padding="lg">
            <h2 className="text-lg font-bold">Аналитика и записи сессий</h2>
            <p className="mt-2 text-sm leading-relaxed text-sh-muted">
              Мы используем PostHog, чтобы понимать, какие экраны и функции работают удобно,
              находить ошибки и смотреть обезличенное воспроизведение взаимодействий с интерфейсом.
              Все поля ввода скрываются в записи. В аналитические события не передаются email,
              имя ребёнка, пароль, распознанная речь, введённые ответы и полный текст истории.
              Отображаемые данные профиля дополнительно скрываются в записи сессии.
            </p>
          </Card>

          <p className="text-sm text-sh-muted">
            Вопросы о данных:{' '}
            <a className="text-sh-forest underline" href="mailto:shepelenko.p@gmail.com">
              shepelenko.p@gmail.com
            </a>
            .
          </p>
        </div>
      </article>
    </AppShell>
  );
}
