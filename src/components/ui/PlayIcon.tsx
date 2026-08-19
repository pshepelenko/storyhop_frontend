type PlayIconProps = {
  className?: string;
};

/** Fixed SVG avoids the emoji-style play glyph rendered by mobile Safari. */
export default function PlayIcon({ className = 'h-4 w-4' }: PlayIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13l10-6.5z" />
    </svg>
  );
}
