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
    <div className="rounded-2xl border p-6 dark:text-white dark:bg-[#151B22]">
      <h3 className="text-lg font-medium mb-4">Weekly Breakdown by Tag</h3>

      {isLoading ? (
        <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">Loading weekly breakdown...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">No weekly breakdown data available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((tag) => (
            <div key={tag.tag} className="rounded-xl border p-4">
              <p className="font-medium">{tag.tag}</p>

              <p className="mt-2 text-sm text-[#64748B]">Sessions: {tag.sessions}</p>

              <p className="text-sm text-[#64748B]">
                Avg session: {toMinutes(tag.avgSessionDurationSec)} min
              </p>

              <p className="text-sm text-[#64748B]">
                Total: {toMinutes(tag.totalDurationSec)} min
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
