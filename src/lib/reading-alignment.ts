export type ReadingRange = {
  start: number;
  end: number;
};

export type TimedReadingRange = ReadingRange & {
  startSeconds: number;
  endSeconds: number;
};

type WordSpan = ReadingRange & { value: string };

const WORD_PATTERN = /[a-z]+(?:['’][a-z]+)?/gi;

function wordsIn(text: string): WordSpan[] {
  const words: WordSpan[] = [];
  const pattern = new RegExp(WORD_PATTERN.source, 'gi');
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    words.push({
      value: match[0].toLowerCase().replace(/’/g, "'"),
      start: match.index,
      end: pattern.lastIndex,
    });
  }
  return words;
}

/**
 * TTS chunks carry character ranges relative to their own text. Convert them
 * to chapter coordinates by matching words in order, rather than adding raw
 * string lengths (which breaks on normalized whitespace and repeated words).
 */
export function createChapterRangeProjectors(chapterText: string, chunkTexts: string[]) {
  const chapterWords = wordsIn(chapterText);
  let chapterCursor = 0;

  return chunkTexts.map((chunkText) => {
    const localWords = wordsIn(chunkText);
    const mapped = localWords.map((localWord) => {
      let matchedIndex = -1;
      for (let index = chapterCursor; index < chapterWords.length; index += 1) {
        if (chapterWords[index].value === localWord.value) {
          matchedIndex = index;
          break;
        }
      }
      if (matchedIndex < 0) {
        return null;
      }
      chapterCursor = matchedIndex + 1;
      return { local: localWord, chapter: chapterWords[matchedIndex] };
    });

    return (range: ReadingRange | null): ReadingRange | null => {
      if (!range) return null;
      const overlapping = mapped.filter((item): item is NonNullable<typeof item> =>
        Boolean(item && item.local.start < range.end && item.local.end > range.start),
      );
      if (!overlapping.length) return null;
      return {
        start: overlapping[0].chapter.start,
        end: overlapping[overlapping.length - 1].chapter.end,
      };
    };
  });
}
