import { FormEvent, useState } from 'react';
import { AgeStepper, Button, Card, SegmentedControl } from '@/components/ui';

export type ChildProfileInput = {
  displayName: string;
  age: number;
  gender: 'girl' | 'boy' | '';
  englishLevel: 'A1' | 'A2' | 'B1' | '';
};

export const EMPTY_CHILD_PROFILE: ChildProfileInput = { displayName: '', age: 8, gender: '', englishLevel: '' };

export default function ChildProfileForm({
  initialValue,
  submitLabel,
  onSubmit,
  onBack,
}: {
  initialValue?: Partial<ChildProfileInput>;
  submitLabel: string;
  onSubmit: (value: ChildProfileInput) => Promise<void>;
  onBack?: () => void;
}) {
  const [value, setValue] = useState<ChildProfileInput>({ ...EMPTY_CHILD_PROFILE, ...initialValue });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const valid = Boolean(value.displayName.trim() && value.gender && value.englishLevel);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setError('');
    try {
      await onSubmit({ ...value, displayName: value.displayName.trim() });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить профиль.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <div className="rounded-[var(--sh-radius)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <Card padding="lg" className="space-y-5">
        <p className="text-sm leading-relaxed text-sh-muted">Имени или прозвища достаточно. Фамилия не нужна.</p>
        <label className="block text-sm font-semibold text-sh-foreground">
          Как зовут ребёнка?
          <input value={value.displayName} maxLength={40} onChange={(event) => setValue((current) => ({ ...current, displayName: event.target.value }))} className="mt-2 min-h-[var(--sh-tap-min)] w-full rounded-[var(--sh-radius)] border border-sh-border px-3 text-base font-medium outline-none focus:border-sh-forest" placeholder="Например, Маша" autoComplete="given-name" />
        </label>
        <section>
          <p className="mb-2 text-sm font-semibold text-sh-foreground">Возраст</p>
          <AgeStepper value={value.age} onChange={(age) => setValue((current) => ({ ...current, age }))} />
        </section>
        <section>
          <p className="mb-2 text-sm font-semibold text-sh-foreground">Пол ребёнка</p>
          <SegmentedControl ariaLabel="Пол ребёнка" value={value.gender} onChange={(gender) => setValue((current) => ({ ...current, gender: gender as ChildProfileInput['gender'] }))} segments={[{ value: 'girl', label: 'Девочка' }, { value: 'boy', label: 'Мальчик' }]} />
        </section>
        <section>
          <p className="mb-2 text-sm font-semibold text-sh-foreground">Уровень английского</p>
          <SegmentedControl ariaLabel="Уровень английского" value={value.englishLevel} onChange={(englishLevel) => setValue((current) => ({ ...current, englishLevel: englishLevel as ChildProfileInput['englishLevel'] }))} segments={[{ value: 'A1', label: 'A1', description: 'Начинает говорить простыми фразами' }, { value: 'A2', label: 'A2', description: 'Понимает знакомые темы' }, { value: 'B1', label: 'B1', description: 'Готов к более длинным историям' }]} />
        </section>
      </Card>
      <div className="flex gap-3">
        {onBack && <Button type="button" variant="secondary" onClick={onBack} className="flex-1">Назад</Button>}
        <Button type="submit" disabled={!valid || saving} className="flex-[1.5]">{saving ? 'Сохраняем...' : submitLabel}</Button>
      </div>
    </form>
  );
}
