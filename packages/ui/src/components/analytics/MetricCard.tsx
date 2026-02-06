type MetricCardProps = {
  label: string;
  value: string;
  subText?: string;
  hint?: string;
};

export function MetricCard({
  label,
  value,
  subText,
  hint,
}: MetricCardProps) {
  return (
    <div
      className="
        rounded-2xl
        bg-[var(--color-surface)]
        border border-[var(--color-border)]
        p-5
        transition
        hover:shadow-sm
      "
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">
          {label}
        </p>

        {hint && (
          <span className="text-xs text-[var(--color-text-subtle)] cursor-help">
            ⓘ
          </span>
        )}
      </div>

      <div className="mt-2">
        <p className="text-2xl font-semibold text-[var(--color-text)]">
          {value}
        </p>

        {subText && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {subText}
          </p>
        )}
      </div>
    </div>
  );
}
