type IconProps = { className?: string; filled?: boolean };

export function IconHome({ className = 'w-5 h-5', filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 3 3 10.2V20a1 1 0 0 0 1 1h6v-7h4v7h6a1 1 0 0 0 1-1v-9.8L12 3Z" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLibrary({ className = 'w-5 h-5', filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M5.5 4A1.5 1.5 0 0 0 4 5.5V18a2 2 0 0 0 2 2h3V4H5.5ZM15 4v16h3a2 2 0 0 0 2-2V5.5A1.5 1.5 0 0 0 18.5 4H15Z" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H9v16H6a2 2 0 0 1-2-2V5.5ZM15 4h3.5A1.5 1.5 0 0 1 20 5.5V18a2 2 0 0 1-2 2h-3V4Z" />
      <path d="M9 4h6v16H9V4Z" />
    </svg>
  );
}

export function IconParent({ className = 'w-5 h-5', filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14H4V5Zm4 12v-6h2v6H8Zm4 0V11h2v6h-2Zm4 0v-3h2v3h-2Z" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" />
      <path d="M8 17v-6M12 17V9M16 17v-3" strokeLinecap="round" />
    </svg>
  );
}

export function IconProgress({ className = 'w-5 h-5', filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <rect x="3" y="14" width="4" height="6" rx="1" />
        <rect x="9" y="9" width="4" height="11" rx="1" />
        <rect x="15" y="12" width="4" height="8" rx="1" />
        <rect x="20" y="4" width="4" height="16" rx="1" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 19V5M10 19V9M16 19V14M22 19V4" strokeLinecap="round" />
    </svg>
  );
}

export function IconProfile({ className = 'w-5 h-5', filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6H4Z" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" strokeLinecap="round" />
    </svg>
  );
}

export function IconSettings({ className = 'w-5 h-5', filled }: IconProps) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Zm9.17 4.28-.98-.17a6.9 6.9 0 0 0-.5-1.2l.56-.82a1 1 0 0 0-.15-1.28l-1.2-1.2a1 1 0 0 0-1.28-.15l-.82.56c-.37-.2-.77-.37-1.2-.5l-.17-.98A1 1 0 0 0 14.72 5h-1.7a1 1 0 0 0-.98.8l-.17.98c-.43.13-.83.3-1.2.5l-.82-.56a1 1 0 0 0-1.28.15l-1.2 1.2a1 1 0 0 0-.15 1.28l.56.82c-.2.37-.37.77-.5 1.2l-.98.17a1 1 0 0 0-.8.98v1.7a1 1 0 0 0 .8.98l.98.17c.13.43.3.83.5 1.2l-.56.82a1 1 0 0 0 .15 1.28l1.2 1.2a1 1 0 0 0 1.28.15l.82-.56c.37.2.77.37 1.2.5l.17.98a1 1 0 0 0 .98.8h1.7a1 1 0 0 0 .98-.8l.17-.98c.43-.13.83-.3 1.2-.5l.82.56a1 1 0 0 0 1.28-.15l1.2-1.2a1 1 0 0 0 .15-1.28l-.56-.82c.2-.37.37-.77.5-1.2l.98-.17a1 1 0 0 0 .8-.98v-1.7a1 1 0 0 0-.8-.98Z" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
    </svg>
  );
}
