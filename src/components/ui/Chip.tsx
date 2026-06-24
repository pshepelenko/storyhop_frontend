type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export default function Chip({ label, selected, disabled, onClick }: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'min-h-[36px] px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
        selected
          ? 'bg-sh-green-soft border-sh-green text-sh-green'
          : 'bg-white border-sh-border text-sh-foreground hover:border-sh-mint-dark',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
