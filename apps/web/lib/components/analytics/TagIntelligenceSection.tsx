"use client";

import { TagWeeklyBreakdown, TimePerTag } from "@repo/ui";
import { useTagIntelligence } from "@/lib/hooks/analytics/useTagIntelligence";

export const TagIntelligenceSection = () => {
  const { timePerTag, weeklyBreakdown, isLoading } = useTagIntelligence(0);

  return (
    <section className="mt-16 space-y-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          Tag Intelligence
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Understand how your focus is distributed across subjects.
        </p>
      </div>

      <TimePerTag data={timePerTag} isLoading={isLoading} />
      <TagWeeklyBreakdown data={weeklyBreakdown} isLoading={isLoading} />
    </section>
  );
};
