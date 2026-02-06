// SessionLengthDistribution.tsx
export type SessionBucket = {
  range: string;
  count: number;
};

type SessionLengthDistributionProps = {
  buckets: SessionBucket[];
  isLoading?: boolean;
};

export const SessionLengthDistribution = ({
  buckets,
  isLoading = false,
}: SessionLengthDistributionProps) => {
  const maxCount = buckets.reduce(
    (highestCount, bucket) => Math.max(highestCount, bucket.count),
    0
  );

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
      <h3 className="mb-4 text-lg font-medium text-[var(--color-text)]">
        Session Length Distribution
      </h3>

      {isLoading ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          Loading session distribution...
        </p>
      ) : buckets.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          No session distribution data available.
        </p>
      ) : (
        <div className="space-y-3">
          {buckets.map((bucket) => {
            const widthPercent =
              maxCount > 0
                ? Math.min((bucket.count / maxCount) * 100, 100)
                : 0;

            return (
              <div key={bucket.range} className="flex items-center gap-4">
                <span className="w-24 text-sm text-[var(--color-text)]">
                  {bucket.range}
                </span>

                <div className="h-2 flex-1 rounded-full bg-[var(--color-surface-muted)]">
                  <div
                    className="h-2 rounded-full bg-[var(--color-primary)]"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>

                <span className="w-6 text-sm text-[var(--color-text-muted)]">
                  {bucket.count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
