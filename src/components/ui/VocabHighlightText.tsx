import React, { useEffect, useState } from 'react';
import Card from './Card';
import ModalOverlay from './ModalOverlay';

export type VocabWord = {
  term: string;
  meaningInContext?: string;
};

export type ReadingTextRange = {
  start: number;
  end: number;
};

type VocabHighlightTextProps = {
  text: string;
  vocabulary?: VocabWord[];
  className?: string;
  activeRange?: ReadingTextRange | null;
};

type VocabMatch = {
  entry: VocabWord;
  start: number;
  end: number;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function inflectionPattern(word: string) {
  if (!/^[a-z]+$/i.test(word)) return escapeRegex(word);

  const normalized = word.toLowerCase();
  const forms = new Set([normalized]);
  const endsWithConsonantY = /[^aeiou]y$/.test(normalized);
  const endsWithEs = /(s|x|z|ch|sh)$/.test(normalized);

  if (endsWithConsonantY) {
    const stem = normalized.slice(0, -1);
    forms.add(`${stem}ies`);
    forms.add(`${stem}ied`);
    forms.add(`${normalized}ing`);
  } else {
    forms.add(endsWithEs ? `${normalized}es` : `${normalized}s`);
    if (normalized.endsWith('e')) {
      forms.add(`${normalized}d`);
      forms.add(`${normalized.slice(0, -1)}ing`);
    } else {
      forms.add(`${normalized}ed`);
      forms.add(`${normalized}ing`);
    }
  }

  // Covers common CVC verbs such as stop -> stopped/stopping without a language service.
  if (/[^aeiou][aeiou][^aeiou]$/.test(normalized) && !/[wxy]$/.test(normalized)) {
    const finalLetter = normalized[normalized.length - 1];
    forms.add(`${normalized}${finalLetter}ed`);
    forms.add(`${normalized}${finalLetter}ing`);
  }

  return Array.from(forms)
    .sort((left, right) => right.length - left.length)
    .map(escapeRegex)
    .join('|');
}

function entryPattern(entry: VocabWord) {
  const words = entry.term.match(/[a-z]+(?:[-'’][a-z]+)*/gi) || [];
  if (!words.length) return null;

  return words.map(inflectionPattern).join('\\s+');
}

export function findVocabularyMatches(text: string, vocabulary: VocabWord[]): VocabMatch[] {
  const candidates: VocabMatch[] = [];

  for (const entry of vocabulary) {
    if (!entry.term?.trim() || !entry.meaningInContext?.trim()) continue;
    const pattern = entryPattern(entry);
    if (!pattern) continue;

    const regex = new RegExp(`\\b(?:${pattern})\\b`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      candidates.push({ entry, start: match.index, end: regex.lastIndex });
    }
  }

  candidates.sort((left, right) =>
    left.start - right.start || right.end - right.start - (left.end - left.start),
  );

  const accepted: VocabMatch[] = [];
  let previousEnd = 0;
  for (const candidate of candidates) {
    if (candidate.start < previousEnd) continue;
    accepted.push(candidate);
    previousEnd = candidate.end;
  }

  return accepted;
}

function highlightVocab(
  text: string,
  vocab: VocabWord[],
  onSelect: (word: VocabWord) => void,
  activeRange?: ReadingTextRange | null,
): React.ReactNode[] {
  const matches = findVocabularyMatches(text, vocab);
  const boundaries = new Set<number>([0, text.length]);
  for (const match of matches) {
    boundaries.add(match.start);
    boundaries.add(match.end);
  }
  if (activeRange) {
    boundaries.add(Math.max(0, Math.min(text.length, activeRange.start)));
    boundaries.add(Math.max(0, Math.min(text.length, activeRange.end)));
  }

  const parts: React.ReactNode[] = [];
  const ordered = [...boundaries].sort((left, right) => left - right);
  for (let index = 0; index < ordered.length - 1; index += 1) {
    const start = ordered[index];
    const end = ordered[index + 1];
    if (start === end) continue;
    const value = text.slice(start, end);
    const match = matches.find((item) => item.start <= start && item.end >= end);
    const isActive = Boolean(activeRange && start < activeRange.end && end > activeRange.start);
    const readingClass = isActive
      ? 'rounded bg-[color:var(--sh-lavender)]/20 text-sh-foreground shadow-[inset_0_-2px_0_var(--sh-lavender)] transition-colors duration-150'
      : '';
    if (match) {
      parts.push(
        <button
          type="button"
          key={`hl-${start}-${end}`}
          className={`inline px-0.5 font-medium text-sh-forest underline decoration-sh-forest/40 underline-offset-2 ${isActive ? readingClass : 'rounded bg-sh-forest-soft'}`}
          onClick={() => onSelect(match.entry)}
          aria-label={`Explain ${value}`}
        >
          {value}
        </button>,
      );
    } else if (isActive) {
      parts.push(<span key={`reading-${start}-${end}`} className={readingClass}>{value}</span>);
    } else {
      parts.push(value);
    }
  }
  return parts;
}

export default function VocabHighlightText({ text, vocabulary = [], className = '', activeRange = null }: VocabHighlightTextProps) {
  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);

  useEffect(() => {
    if (!selectedWord) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedWord(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedWord]);

  return (
    <>
      <span className={className}>{highlightVocab(text, vocabulary, setSelectedWord, activeRange)}</span>
      {selectedWord && (
        <ModalOverlay
          className="items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={selectedWord.term}
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedWord(null);
          }}
        >
          <Card className="w-full max-w-md bg-white px-5 py-5 shadow-[var(--sh-shadow-card)] sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-semibold text-sh-foreground">{selectedWord.term}</p>
                <p className="mt-3 text-base leading-relaxed text-sh-muted">{selectedWord.meaningInContext}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWord(null)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-2xl leading-none text-sh-muted"
                aria-label="Close explanation"
              >
                ×
              </button>
            </div>
          </Card>
        </ModalOverlay>
      )}
    </>
  );
}
