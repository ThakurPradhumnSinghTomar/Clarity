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
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
      <h3 className="mb-4 text-lg font-medium text-[var(--color-text)]">Time per Tag</h3>

      {isLoading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Loading tag analytics...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No weekly tag data available.</p>
      ) : (
        <div className="space-y-3">
          {data.map(({ tag, totalDurationSec, sessionCount }) => {
            const widthPercent = maxDuration > 0 ? (totalDurationSec / maxDuration) * 100 : 0;

            return (
              <div key={tag}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-[var(--color-text)]">{tag}</span>
                  <span className="text-[var(--color-text-muted)]">
                    {formatDuration(totalDurationSec)} • {sessionCount} session{sessionCount === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-[var(--color-surface-muted)]">
                  <div
                    className="h-2 rounded-full bg-[var(--color-primary)]"
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
