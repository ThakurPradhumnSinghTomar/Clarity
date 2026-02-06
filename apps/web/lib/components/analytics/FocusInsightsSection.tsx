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
    <section className="mt-16 space-y-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          Focus Quality Insights
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
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
