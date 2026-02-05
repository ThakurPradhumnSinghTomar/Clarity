// FocusQualityCards.tsx
const FOCUS_STATS = [
  { label: "Deep Focus Sessions", value: "8", sub: "≥45 min sessions" },
  { label: "Avg Session Length", value: "38 min", sub: "Last 7 days" },
  { label: "Best Focus Window", value: "Morning", sub: "6–11 AM peak" },
  { label: "Break Rate", value: "22%", sub: "Sessions ended early" },
];


export const FocusQualityCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {FOCUS_STATS.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 dark:border-[#1F2933] dark:bg-[#0F1419]"
        >
          <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
            {stat.label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#0F172A] dark:text-white">
            {stat.value}
          </p>

          <p className="mt-1 text-xs text-[#94A3B8]">
            {stat.sub}
          </p>
        </div>
      ))}
    </div>
  );
};
