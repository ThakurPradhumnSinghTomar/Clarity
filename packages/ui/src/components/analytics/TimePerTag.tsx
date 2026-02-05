// TimePerTag.tsx

type TimePerTagItem = {
  tag: string;
  totalDurationSec: number;
  sessionCount: number;
};

type TimePerTagProps = {
  data: TimePerTagItem[];
  isLoading?: boolean;
};

function formatDuration(totalDurationSec: number) {
  const totalMinutes = Math.round(totalDurationSec / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

export const TimePerTag = ({ data, isLoading = false }: TimePerTagProps) => {
  const maxDuration = data[0]?.totalDurationSec ?? 0;

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 dark:border-[#1F2933] dark:bg-[#0F1419] dark:text-white">
      <h3 className="mb-4 text-lg font-medium text-[#0F172A] dark:text-[#E6EDF3]">Time per Tag</h3>

      {isLoading ? (
        <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">Loading tag analytics...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">No weekly tag data available.</p>
      ) : (
        <div className="space-y-3">
          {data.map(({ tag, totalDurationSec, sessionCount }) => {
            const widthPercent = maxDuration > 0 ? (totalDurationSec / maxDuration) * 100 : 0;

            return (
              <div key={tag}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-[#0F172A] dark:text-[#E6EDF3]">{tag}</span>
                  <span className="text-[#64748B] dark:text-[#9FB0C0]">
                    {formatDuration(totalDurationSec)} • {sessionCount} session{sessionCount === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-[#E5E7EB] dark:bg-[#1F2933]">
                  <div
                    className="h-2 rounded-full bg-[#475569] dark:bg-[#7C8FA3]"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
