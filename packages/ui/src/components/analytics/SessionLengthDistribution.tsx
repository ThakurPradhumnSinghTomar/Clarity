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
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 dark:border-[#1F2933] dark:bg-[#0F1419]">
      <h3 className="mb-4 text-lg font-medium text-[#0F172A] dark:text-[#E6EDF3]">
        Session Length Distribution
      </h3>

      {isLoading ? (
        <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
          Loading session distribution...
        </p>
      ) : buckets.length === 0 ? (
        <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
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
                <span className="w-24 text-sm text-[#0F172A] dark:text-[#E6EDF3]">
                  {bucket.range}
                </span>

                <div className="h-2 flex-1 rounded-full bg-[#E5E7EB] dark:bg-[#1F2933]">
                  <div
                    className="h-2 rounded-full bg-[#475569] dark:bg-[#7C8FA3]"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>

                <span className="w-6 text-sm text-[#64748B] dark:text-[#9FB0C0]">
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
