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
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 dark:border-[#1F2933] dark:bg-[#0F1419] dark:text-white">
      <h3 className="mb-4 text-lg font-medium text-[#0F172A] dark:text-[#E6EDF3]">Weekly Breakdown by Tag</h3>

      {isLoading ? (
        <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">Loading weekly breakdown...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">No weekly breakdown data available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((tag) => (
            <div key={tag.tag} className="rounded-xl border border-[#E2E8F0] bg-white p-4 dark:border-[#1F2933] dark:bg-[#151B22]">
              <p className="font-medium text-[#0F172A] dark:text-[#E6EDF3]">{tag.tag}</p>

              <p className="mt-2 text-sm text-[#64748B] dark:text-[#9FB0C0]">Sessions: {tag.sessions}</p>

              <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
                Avg session: {toMinutes(tag.avgSessionDurationSec)} min
              </p>

              <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
                Total: {toMinutes(tag.totalDurationSec)} min
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
