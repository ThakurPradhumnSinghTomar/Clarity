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
        bg-white dark:bg-[#0F1419]
        border border-[#E2E8F0] dark:border-[#1E293B]
        p-5
        transition
        hover:shadow-sm
      "
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
          {label}
        </p>

        {hint && (
          <span className="text-xs text-[#94A3B8] cursor-help">
            ⓘ
          </span>
        )}
      </div>

      <div className="mt-2">
        <p className="text-2xl font-semibold text-[#0F172A] dark:text-[#E6EDF3]">
          {value}
        </p>

        {subText && (
          <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
            {subText}
          </p>
        )}
      </div>
    </div>
  );
}
