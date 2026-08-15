import { useUiLanguage } from '@/lib/use-ui-language';
import Button from '../ui/Button';
import { getHomeWithSeasonsCopy } from './home-with-seasons-copy';

export default function MySeasonsHeader() {
  const copy = getHomeWithSeasonsCopy(useUiLanguage());

  return (
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <h2 className="shrink-0 text-sm font-semibold text-sh-foreground">{copy.mySeasons}</h2>
      <Button
        href="/seasons/new"
        variant="secondary"
        className="h-7 !min-h-[28px] shrink-0 whitespace-nowrap px-2.5 py-0 text-xs font-semibold"
      >
        {copy.createSeason}
      </Button>
    </div>
  );
}
