import { setUiLanguage } from '@/lib/ui-language';
import { useUiLanguage } from '@/lib/use-ui-language';

export default function LanguageSelector() {
  const uiLang = useUiLanguage();

  return (
    <label className="flex items-center gap-1.5 text-sm border border-sh-border rounded-full px-3 py-1.5 bg-white min-h-[36px] shadow-[var(--sh-shadow)] cursor-pointer">
      <svg className="w-4 h-4 text-sh-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </svg>
      <select
        className="bg-transparent text-sm text-sh-foreground outline-none pr-1 cursor-pointer appearance-none"
        value={uiLang}
        onChange={(e) => {
          const v = e.target.value as 'english' | 'russian';
          setUiLanguage(v);
        }}
        aria-label="Interface language"
      >
        <option value="english">English</option>
        <option value="russian">Russian</option>
      </select>
      <svg className="w-3 h-3 text-sh-muted -ml-1 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}
