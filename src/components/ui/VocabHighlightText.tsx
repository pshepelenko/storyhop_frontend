import React, { useEffect, useState } from 'react';
import Card from './Card';
import ModalOverlay from './ModalOverlay';

export type VocabWord = {
  term: string;
  meaningInContext?: string;
};

type VocabHighlightTextProps = {
  text: string;
  vocabulary?: VocabWord[];
  className?: string;
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
): React.ReactNode[] {
  const matches = findVocabularyMatches(text, vocab);
  if (!matches.length) return [text];

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  for (const match of matches) {
    if (match.start > lastIndex) {
      parts.push(text.slice(lastIndex, match.start));
    }
    const matchedWord = text.slice(match.start, match.end);
    parts.push(
      <button
        type="button"
        key={`hl-${match.start}`}
        className="inline rounded bg-sh-forest-soft px-0.5 font-medium text-sh-forest underline decoration-sh-forest/40 underline-offset-2"
        onClick={() => onSelect(match.entry)}
        aria-label={`Explain ${matchedWord}`}
      >
        {matchedWord}
      </button>,
    );
    lastIndex = match.end;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export default function VocabHighlightText({ text, vocabulary = [], className = '' }: VocabHighlightTextProps) {
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
      <span className={className}>{highlightVocab(text, vocabulary, setSelectedWord)}</span>
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
