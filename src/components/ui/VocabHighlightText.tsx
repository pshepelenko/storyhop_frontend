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

function highlightVocab(
  text: string,
  vocab: VocabWord[],
  onSelect: (word: VocabWord) => void,
): React.ReactNode[] {
  if (!vocab.length) return [text];
  const terms = vocab
    .filter((v) => v.meaningInContext?.trim())
    .map((v) => v.term.toLowerCase())
    .filter(Boolean);
  if (!terms.length) return [text];

  const pattern = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length)
    .join('|');

  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const matchedWord = match[0];
    const vocabEntry = vocab.find((v) => v.term.toLowerCase() === matchedWord.toLowerCase());
    if (!vocabEntry?.meaningInContext?.trim()) {
      parts.push(matchedWord);
      lastIndex = regex.lastIndex;
      continue;
    }
    parts.push(
      <button
        type="button"
        key={`hl-${match.index}`}
        className="inline rounded bg-sh-forest-soft px-0.5 font-medium text-sh-forest underline decoration-sh-forest/40 underline-offset-2"
        onClick={() => onSelect(vocabEntry)}
        aria-label={`Explain ${matchedWord}`}
      >
        {matchedWord}
      </button>,
    );
    lastIndex = regex.lastIndex;
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
