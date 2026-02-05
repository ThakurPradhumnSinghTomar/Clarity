const SESSION_BUCKETS = [
  { range: "0–15 min", count: 6 },
  { range: "15–30 min", count: 10 },
  { range: "30–45 min", count: 5 },
  { range: "45–60 min", count: 3 },
  { range: "60+ min", count: 2 },
];

// SessionLengthDistribution.tsx
export const SessionLengthDistribution = () => {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 dark:border-[#1F2933] dark:bg-[#0F1419]">
      <h3 className="mb-4 text-lg font-medium text-[#0F172A] dark:text-[#E6EDF3]">
        Session Length Distribution
      </h3>

      <div className="space-y-3">
        {SESSION_BUCKETS.map((b) => (
          <div key={b.range} className="flex items-center gap-4">
            <span className="w-24 text-sm text-[#0F172A] dark:text-[#E6EDF3]">{b.range}</span>

            <div className="flex-1 h-2 rounded-full bg-[#E5E7EB] dark:bg-[#1F2933]">
              <div
                className="h-2 rounded-full bg-[#475569] dark:bg-[#7C8FA3]"
                style={{ width: `${b.count * 8}%` }}
              />
            </div>

            <span className="w-6 text-sm text-[#64748B] dark:text-[#9FB0C0]">
              {b.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
