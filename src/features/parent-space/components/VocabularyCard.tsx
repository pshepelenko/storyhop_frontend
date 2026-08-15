import { imageAssets } from '@/data/image-assets';
import type { ParentSpaceCopy } from '../parent-space-copy';
import type { ParentSpaceView } from '../types';

type Props = {
  vocabulary: ParentSpaceView['vocabulary'];
  spelling: ParentSpaceView['spelling'];
  copy: ParentSpaceCopy;
};

export default function VocabularyCard({ vocabulary, spelling, copy }: Props) {
  if (!vocabulary.hasActivity && !spelling.hasActivity) {
    return (
      <article className="flex h-full flex-col rounded-[24px] border border-[#e9e3d8] bg-white p-5 shadow-[0_12px_30px_rgba(33,57,43,0.05)]">
        <h2 className="font-story text-2xl font-bold text-[#c56a2b]">{copy.vocabTitle}</h2>
        <p className="mt-1 text-sm text-sh-muted">{copy.vocabSubtitle}</p>
        <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageAssets.parent.skillEmpty} alt="" className="mb-3 h-24 w-24 rounded-2xl object-cover" />
          <p className="text-sm text-sh-muted">{copy.vocabEmpty}</p>
        </div>
      </article>
    );
  }

  const successRate =
    vocabulary.totalAttempts > 0
      ? Math.round((vocabulary.successfulAttempts / vocabulary.totalAttempts) * 100)
      : spelling.correctPercent;

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-[#e9e3d8] bg-white p-5 shadow-[0_12px_30px_rgba(33,57,43,0.05)]">
      <h2 className="font-story text-2xl font-bold text-[#c56a2b]">{copy.vocabTitle}</h2>
      <p className="mt-1 text-sm text-sh-muted">{copy.vocabSubtitle}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-[14px] bg-[#fff1e4] px-3 py-3">
          <p className="text-2xl font-bold text-sh-foreground">{vocabulary.totalWords}</p>
          <p className="text-[11px] text-sh-muted">{copy.wordsTotal}</p>
        </div>
        <div className="rounded-[14px] bg-[#fff1e4] px-3 py-3">
          <p className="text-2xl font-bold text-sh-foreground">{vocabulary.successfulWords}</p>
          <p className="text-[11px] text-sh-muted">{copy.wordsSuccessful}</p>
        </div>
        <div className="rounded-[14px] bg-[#fff8f1] px-3 py-3">
          <p className="text-2xl font-bold text-sh-foreground">{vocabulary.totalAttempts}</p>
          <p className="text-[11px] text-sh-muted">{copy.attemptsTotal}</p>
        </div>
        <div className="rounded-[14px] bg-[#fff8f1] px-3 py-3">
          <p className="text-2xl font-bold text-sh-foreground">{vocabulary.successfulAttempts}</p>
          <p className="text-[11px] text-sh-muted">{copy.attemptsSuccessful}</p>
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold text-sh-foreground">{copy.topWords}</p>
      <div className="mt-2 max-h-44 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-sh-muted">
              <th className="pb-2 font-medium">{copy.wordCol}</th>
              <th className="pb-2 font-medium">{copy.translationCol}</th>
              <th className="pb-2 font-medium">{copy.attemptsCol}</th>
              <th className="pb-2 font-medium">{copy.successCol}</th>
            </tr>
          </thead>
          <tbody>
            {vocabulary.words.map((word) => (
              <tr key={word.word} className="border-t border-[#efe9df]">
                <td className="py-2 font-medium text-sh-foreground">{word.word}</td>
                <td className="py-2 text-sh-muted">{word.translationRu || '—'}</td>
                <td className="py-2 text-sh-foreground">{word.attempts}</td>
                <td className="py-2 text-sh-foreground">{word.successes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-auto border-t border-[#efe9df] pt-4">
        <p className="text-sm font-semibold text-sh-foreground">{copy.spellingTitle}</p>
        <div className="mt-2 flex items-center justify-between text-xs text-sh-muted">
          <span>{copy.spellingAnswers(vocabulary.totalAttempts || spelling.answers)}</span>
          <span>{copy.spellingCorrect(successRate)}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f3efe8]">
          <div
            className="h-full rounded-full bg-[#e08a45]"
            style={{ width: `${Math.min(100, Math.max(0, successRate))}%` }}
          />
        </div>
      </div>
    </article>
  );
}
