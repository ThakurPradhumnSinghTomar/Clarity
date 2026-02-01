import React from "react";
import {AnalyticsTrendsSection } from "../../../lib/components/analytics/AnalyticsTrendsSection";
import {AnalyticsOverview} from "@repo/ui"
import { TagIntelligenceSection } from "@/lib/components/analytics/TagIntelligenceSection";
import { FocusInsightsSection } from "@/lib/components/analytics/FocusInsightsSection";

const Analytics = () => {
  return (
    <div className="px-6 py-6 dark:bg-[#0F1419] min-h-screen">
      <AnalyticsOverview
        avgDailyTimeMin={142}
        avgSessionLengthMin={38}
        deepFocusRatio={67}
        consistencyScore={81}
      />

      <AnalyticsTrendsSection></AnalyticsTrendsSection>

      <TagIntelligenceSection></TagIntelligenceSection>

      <FocusInsightsSection></FocusInsightsSection>

      

    </div>
  );
};

export default Analytics;
