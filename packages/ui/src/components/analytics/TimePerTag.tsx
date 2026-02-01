// TimePerTag.tsx

const TIME_PER_TAG = [
  { tag: "DSA", minutes: 420 },
  { tag: "Web Dev", minutes: 310 },
  { tag: "AI/ML", minutes: 180 },
  { tag: "OS", minutes: 140 },
];


export const TimePerTag = () => {
  return (
    <div className="rounded-2xl border p-6 dark:text-white">
      <h3 className="text-lg font-medium mb-4">Time per Tag</h3>

      <div className="space-y-3">
        {TIME_PER_TAG.map(({ tag, minutes }) => (
          <div key={tag}>
            <div className="flex justify-between text-sm mb-1">
              <span>{tag}</span>
              <span>{Math.floor(minutes / 60)}h {minutes % 60}m</span>
            </div>

            <div className="h-2 rounded-full bg-[#E5E7EB] dark:bg-[#1F2933]">
              <div
                className="h-2 rounded-full bg-[#0F172A] dark:bg-white"
                style={{ width: `${minutes / 6}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
