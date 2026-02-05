// FocusQualityCards.tsx
export type FocusStats = {
  deepFocusSessions: number;
  avgSessionLengthMin: number;
  bestFocusWindow: string;
  breakRate: number;
};

type FocusQualityCardsProps = {
  stats: FocusStats;
  isLoading?: boolean;
};

export const FocusQualityCards = ({
  stats,
  isLoading = false,
}: FocusQualityCardsProps) => {
  const focusStats = [
    {
      label: "Deep Focus Sessions",
      value: String(stats.deepFocusSessions),
      sub: "≥45 min sessions",
    },
    {
      label: "Avg Session Length",
      value: `${stats.avgSessionLengthMin} min`,
      sub: "Last 7 days",
    },
    {
      label: "Best Focus Window",
      value: stats.bestFocusWindow,
      sub: "Based on session duration",
    },
    {
      label: "Break Rate",
      value: `${stats.breakRate}%`,
      sub: "Sessions ended early",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {focusStats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 dark:border-[#1F2933] dark:bg-[#0F1419]"
        >
          <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
            {stat.label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#0F172A] dark:text-white">
            {isLoading ? "--" : stat.value}
          </p>

          <p className="mt-1 text-xs text-[#94A3B8]">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
};
