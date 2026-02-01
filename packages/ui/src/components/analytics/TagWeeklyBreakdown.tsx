// TagWeeklyBreakdown.tsx
const TAG_WEEKLY = [
  { tag: "DSA", sessions: 12, avgSession: 42 },
  { tag: "Web Dev", sessions: 9, avgSession: 35 },
  { tag: "AI/ML", sessions: 5, avgSession: 55 },
];


export const TagWeeklyBreakdown = () => {
  return (
    <div className="rounded-2xl border p-6 dark:text-white dark:bg-[#151B22]">
      <h3 className="text-lg font-medium mb-4">
        Weekly Breakdown by Tag
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TAG_WEEKLY.map((tag) => (
          <div
            key={tag.tag}
            className="rounded-xl border p-4"
          >
            <p className="font-medium">{tag.tag}</p>

            <p className="mt-2 text-sm text-[#64748B]">
              Sessions: {tag.sessions}
            </p>

            <p className="text-sm text-[#64748B]">
              Avg session: {tag.avgSession} min
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
