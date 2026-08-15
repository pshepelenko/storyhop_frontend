import { useEffect, useRef, useState } from 'react';
import type { LibraryCopy } from '../library-copy';
import type { LibrarySeasonItem } from '../types';

type Props = {
  season: LibrarySeasonItem;
  copy: LibraryCopy;
  compact?: boolean;
  onArchive: (seasonId: string) => void;
  onUnarchive: (seasonId: string) => void;
  archiving?: boolean;
};

function DotsIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5 fill-current">
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  );
}

export default function SeasonCardActions({
  season,
  copy,
  compact,
  onArchive,
  onUnarchive,
  archiving,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  return (
    <div className={`relative shrink-0 ${compact ? '' : ''}`} ref={menuRef}>
      <button
        type="button"
        aria-label={copy.more}
        aria-expanded={menuOpen}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sh-border bg-white text-sh-foreground hover:bg-sh-forest-soft/40"
      >
        <DotsIcon />
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-[16px] border border-sh-border bg-white py-1 shadow-lg">
          {season.status === 'archived' ? (
            <button
              type="button"
              disabled={archiving}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUnarchive(season.id);
                setMenuOpen(false);
              }}
              className="block w-full px-4 py-2.5 text-left text-sm text-sh-foreground hover:bg-sh-forest-soft/40 disabled:opacity-50"
            >
              {copy.unarchive}
            </button>
          ) : (
            <button
              type="button"
              disabled={archiving}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onArchive(season.id);
                setMenuOpen(false);
              }}
              className="block w-full px-4 py-2.5 text-left text-sm text-sh-foreground hover:bg-sh-forest-soft/40 disabled:opacity-50"
            >
              {copy.archive}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
