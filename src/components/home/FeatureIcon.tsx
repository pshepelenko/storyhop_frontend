import { HomeFeature } from './home-features';

type FeatureIconProps = {
  type: HomeFeature['icon'];
  className?: string;
};

export default function FeatureIcon({ type, className = 'w-5 h-5' }: FeatureIconProps) {
  switch (type) {
    case 'audio':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 10v4M7 8v8M10 6v12M14 6v12M17 8v8M20 10v4" strokeLinecap="round" />
        </svg>
      );
    case 'choices':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 3v18M5 8l7 4 7-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'speaking':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0M12 17v3" strokeLinecap="round" />
        </svg>
      );
    case 'crystals':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 3 4 9l8 12 8-12-8-6Z" strokeLinejoin="round" />
        </svg>
      );
    case 'storybook':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M5 4h7a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm9 0h5v16h-5" />
        </svg>
      );
    case 'progress':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 18V6M10 18V10M16 18V14M22 18V4" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
