"use client";

// FocusInsightsSection.tsx
import React from "react";
import {
  BreakPatternInsight,
  FocusQualityCards,
  SessionLengthDistribution,
} from "@repo/ui";
import { useFocusInsights } from "@/lib/hooks/analytics/useFocusInsights";

export const FocusInsightsSection = () => {
  const { insights, isLoading } = useFocusInsights();

  return (
    <section className="mt-16 space-y-10 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-[#1F2933] dark:bg-[#151B22]">
      <div>
        <h2 className="text-2xl font-semibold text-[#0F172A] dark:text-[#E6EDF3]">
          Focus Quality Insights
        </h2>
        <p className="mt-1 text-sm text-[#64748B] dark:text-[#9FB0C0]">
          Go beyond hours — understand the quality of your sessions.
        </p>
      </div>

      <FocusQualityCards stats={insights.focusStats} isLoading={isLoading} />
      <SessionLengthDistribution
        buckets={insights.sessionBuckets}
        isLoading={isLoading}
      />
      <BreakPatternInsight
        insight={insights.breakPatternInsight}
        isLoading={isLoading}
      />
    </section>
  );
};
