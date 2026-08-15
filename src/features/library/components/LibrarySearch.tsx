import type { LibraryCopy } from '../library-copy';

type Props = {
  value: string;
  onChange: (value: string) => void;
  copy: LibraryCopy;
};

export default function LibrarySearch({ value, onChange, copy }: Props) {
  return (
    <div className="w-full min-w-0">
      <input
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={copy.searchPlaceholder}
        aria-label={copy.searchPlaceholder}
        className="box-border w-full min-h-[48px] rounded-[18px] border border-sh-border bg-white px-4 text-sm text-sh-foreground placeholder:text-sh-muted focus:outline-none focus:ring-2 focus:ring-sh-forest/30"
      />
    </div>
  );
}
