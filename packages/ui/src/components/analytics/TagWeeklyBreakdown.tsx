// TagWeeklyBreakdown.tsx

type WeeklyBreakdownItem = {
  tag: string;
  sessions: number;
  avgSessionDurationSec: number;
  totalDurationSec: number;
};

type TagWeeklyBreakdownProps = {
  data: WeeklyBreakdownItem[];
  isLoading?: boolean;
};

function toMinutes(seconds: number) {
  return Math.round(seconds / 60);
}

export const TagWeeklyBreakdown = ({
  data,
  isLoading = false,
}: TagWeeklyBreakdownProps) => {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
      <h3 className="mb-4 text-lg font-medium text-[var(--color-text)]">Weekly Breakdown by Tag</h3>

      {isLoading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Loading weekly breakdown...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No weekly breakdown data available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((tag) => (
            <div key={tag.tag} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="font-medium text-[var(--color-text)]">{tag.tag}</p>

              <p className="mt-2 text-sm text-[var(--color-text-muted)]">Sessions: {tag.sessions}</p>

              <p className="text-sm text-[var(--color-text-muted)]">
                Avg session: {toMinutes(tag.avgSessionDurationSec)} min
              </p>

              <p className="text-sm text-[var(--color-text-muted)]">
                Total: {toMinutes(tag.totalDurationSec)} min
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
