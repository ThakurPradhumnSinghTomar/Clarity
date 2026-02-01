// FocusInsightsSection.tsx
import React from "react";
import { BreakPatternInsight, FocusQualityCards, SessionLengthDistribution } from "@repo/ui";


export const FocusInsightsSection = () => {
  return (
    <section className="mt-16 space-y-10">
      <div>
        <h2 className="text-2xl font-semibold text-[#0F172A] dark:text-[#E6EDF3]">
          Focus Quality Insights
        </h2>
        <p className="mt-1 text-sm text-[#64748B] dark:text-[#9FB0C0]">
          Go beyond hours — understand the quality of your sessions.
        </p>
      </div>

      <FocusQualityCards />
      <SessionLengthDistribution />
      <BreakPatternInsight />
    </section>
  );
};
