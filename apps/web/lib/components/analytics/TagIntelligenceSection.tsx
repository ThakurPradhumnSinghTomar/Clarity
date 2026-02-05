"use client";

import { TagWeeklyBreakdown, TimePerTag } from "@repo/ui";
import { useTagIntelligence } from "@/lib/hooks/analytics/useTagIntelligence";

export const TagIntelligenceSection = () => {
  const { timePerTag, weeklyBreakdown, isLoading } = useTagIntelligence(0);

  return (
    <section className="mt-16 space-y-10 dark:bg-[#151B22] p-6 rounded-2xl">
      <div>
        <h2 className="text-2xl font-semibold text-[#0F172A] dark:text-[#E6EDF3]">
          Tag Intelligence
        </h2>
        <p className="mt-1 text-sm text-[#64748B] dark:text-[#9FB0C0]">
          Understand how your focus is distributed across subjects.
        </p>
      </div>

      <TimePerTag data={timePerTag} isLoading={isLoading} />
      <TagWeeklyBreakdown data={weeklyBreakdown} isLoading={isLoading} />
    </section>
  );
};
