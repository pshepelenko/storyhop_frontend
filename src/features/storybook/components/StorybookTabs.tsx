import type { StorybookCopy } from '../storybook-copy';
import type { StorybookTab } from '../types';

type Props = {
  value: StorybookTab;
  onChange: (tab: StorybookTab) => void;
  copy: StorybookCopy;
};

const TABS: StorybookTab[] = ['all', 'favorites', 'recent'];

export default function StorybookTabs({ value, onChange, copy }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Storybook filters">
      {TABS.map((tab) => {
        const active = value === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? 'bg-sh-forest text-white'
                : 'border border-sh-border bg-white text-sh-foreground hover:bg-sh-forest-soft/40'
            }`}
          >
            {tab === 'favorites' && (
              <svg aria-hidden viewBox="0 0 20 20" className={`h-3.5 w-3.5 ${active ? 'fill-white' : 'fill-none stroke-current stroke-[1.8]'}`}>
                <path d="M10 16.2 4.8 11.7A3.4 3.4 0 0 1 9.7 6.4L10 6.7l.3-.3a3.4 3.4 0 0 1 4.9 5.3L10 16.2Z" />
              </svg>
            )}
            {tab === 'recent' && (
              <svg aria-hidden viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current stroke-[1.8]">
                <circle cx="10" cy="10" r="6.5" />
                <path d="M10 6.5V10l2.5 1.5" />
              </svg>
            )}
            {copy.tabs[tab]}
          </button>
        );
      })}
    </div>
  );
}
