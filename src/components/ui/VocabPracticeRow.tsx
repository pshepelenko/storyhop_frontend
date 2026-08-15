import { useCallback } from 'react';
import type { VocabWord } from './VocabHighlightText';
import SpeakerIcon from './SpeakerIcon';

type VocabPracticeRowProps = {
  words: VocabWord[];
  title?: string;
  className?: string;
};

function speakTerm(term: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(term);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export default function VocabPracticeRow({
  words,
  title = 'Words to practice',
  className = '',
}: VocabPracticeRowProps) {
  const onSpeak = useCallback((term: string) => speakTerm(term), []);

  if (!words.length) return null;

  return (
    <section className={`hidden lg:block ${className}`}>
      <h3 className="text-sm font-semibold text-sh-foreground mb-3">{title}</h3>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {words.map((word) => (
          <div
            key={word.term}
            className="flex items-center gap-3 min-w-[140px] shrink-0 rounded-[var(--sh-radius-lg)] border border-sh-border bg-white px-4 py-3 shadow-[var(--sh-shadow)]"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sh-foreground">{word.term}</p>
              {word.translationRu && (
                <p className="text-xs text-sh-muted mt-0.5">{word.translationRu}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onSpeak(word.term)}
              className="shrink-0 text-sh-muted hover:text-sh-forest transition-colors p-1"
              aria-label={`Listen to ${word.term}`}
            >
              <SpeakerIcon />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
