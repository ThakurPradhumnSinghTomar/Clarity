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
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
      <h3 className="mb-3 text-lg font-medium text-[var(--color-text)]">
        Break Pattern Insight
      </h3>

      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <p className="text-sm text-[var(--color-text)]">
          {isLoading ? "Loading break pattern..." : insight.headline}
        </p>

        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {isLoading ? "" : insight.description}
        </p>
      </div>
    </div>
  );
};
