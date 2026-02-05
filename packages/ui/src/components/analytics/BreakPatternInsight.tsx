// BreakPatternInsight.tsx
export type BreakPattern = {
  headline: string;
  description: string;
};

type BreakPatternInsightProps = {
  insight: BreakPattern;
  isLoading?: boolean;
};

export const BreakPatternInsight = ({
  insight,
  isLoading = false,
}: BreakPatternInsightProps) => {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 dark:border-[#1F2933] dark:bg-[#0F1419]">
      <h3 className="mb-3 text-lg font-medium text-[#0F172A] dark:text-[#E6EDF3]">
        Break Pattern Insight
      </h3>

      <div className="rounded-xl bg-white p-4 dark:bg-[#151B22]">
        <p className="text-sm text-[#0F172A] dark:text-[#E6EDF3]">
          {isLoading ? "Loading break pattern..." : insight.headline}
        </p>

        <p className="mt-2 text-sm text-[#64748B] dark:text-[#9FB0C0]">
          {isLoading ? "" : insight.description}
        </p>
      </div>
    </div>
  );
};
