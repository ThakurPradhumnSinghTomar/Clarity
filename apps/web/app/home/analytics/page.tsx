"use client";

import React from "react";
import { AnalyticsOverview } from "@repo/ui";
import { AnalyticsTrendsSection } from "../../../lib/components/analytics/AnalyticsTrendsSection";
import { TagIntelligenceSection } from "@/lib/components/analytics/TagIntelligenceSection";
import { FocusInsightsSection } from "@/lib/components/analytics/FocusInsightsSection";
import { useAnalyticsOverview } from "@/lib/hooks/analytics/useAnalyticsOverview";

const Analytics = () => {
  const { overview } = useAnalyticsOverview();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-6 py-8 transition-colors">
      <AnalyticsOverview
        avgDailyTimeMin={overview?.avgDailyTimeMin ?? 0}
        avgSessionLengthMin={overview?.avgSessionLengthMin ?? 0}
        deepFocusRatio={overview?.deepFocusRatio ?? 0}
        consistencyScore={overview?.consistencyScore ?? 0}
      />

      <AnalyticsTrendsSection />

      <TagIntelligenceSection />

      <FocusInsightsSection />
    </div>
  );
};

export default Analytics;
