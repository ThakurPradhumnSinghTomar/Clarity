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
    <div className="rounded-2xl border p-6">
      <h3 className="text-lg font-medium mb-4">
        Session Length Distribution
      </h3>

      <div className="space-y-3">
        {SESSION_BUCKETS.map((b) => (
          <div key={b.range} className="flex items-center gap-4">
            <span className="w-24 text-sm">{b.range}</span>

            <div className="flex-1 h-2 rounded-full bg-[#E5E7EB] dark:bg-[#1F2933]">
              <div
                className="h-2 rounded-full bg-[#0F172A] dark:bg-white"
                style={{ width: `${b.count * 8}%` }}
              />
            </div>

            <span className="text-sm text-[#64748B] w-6">
              {b.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
