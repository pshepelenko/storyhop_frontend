import { useEffect, useMemo, useState } from 'react';
import type { LibrarySeasonItem } from '../types';
import { seasonCoverUrl } from '../utils';

type Props = {
  season: LibrarySeasonItem;
  alt: string;
  className?: string;
};

export default function SeasonCoverImage({ season, alt, className }: Props) {
  const primarySrc = useMemo(() => season.coverImageUrl || null, [season.coverImageUrl]);
  const fallbackSrc = useMemo(() => seasonCoverUrl({ ...season, coverImageUrl: null }), [season]);
  const [src, setSrc] = useState(primarySrc || fallbackSrc);

  useEffect(() => {
    setSrc(primarySrc || fallbackSrc);
  }, [primarySrc, fallbackSrc]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        if (src !== fallbackSrc) {
          setSrc(fallbackSrc);
        }
      }}
    />
  );
}
