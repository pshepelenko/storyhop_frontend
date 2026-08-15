import React from 'react';

export type VocabWord = {
  term: string;
  translationRu?: string;
};

type VocabHighlightTextProps = {
  text: string;
  vocabulary?: VocabWord[];
  className?: string;
};

function highlightVocab(text: string, vocab: VocabWord[] = []): React.ReactNode[] {
  if (!vocab.length) return [text];
  const terms = vocab.map((v) => v.term.toLowerCase()).filter(Boolean);
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
    parts.push(
      <span
        key={`hl-${match.index}`}
        className="inline bg-sh-forest-soft text-sh-forest font-medium rounded px-0.5 cursor-help"
        title={vocabEntry?.translationRu ? `${matchedWord} — ${vocabEntry.translationRu}` : matchedWord}
      >
        {matchedWord}
      </span>,
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export default function VocabHighlightText({ text, vocabulary = [], className = '' }: VocabHighlightTextProps) {
  return (
    <span className={className}>
      {highlightVocab(text, vocabulary)}
    </span>
  );
}
