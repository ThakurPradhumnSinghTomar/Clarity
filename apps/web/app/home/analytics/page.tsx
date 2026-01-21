import React from "react";
import { AnalyticsOverview } from "@repo/ui";

const Analytics = () => {
  return (
    <div className="px-6 py-6 dark:bg-[#0F1419] min-h-screen">
      <AnalyticsOverview
        avgDailyTimeMin={142}
        avgSessionLengthMin={38}
        deepFocusRatio={67}
        consistencyScore={81}
      />
    </div>
  );
};

export default Analytics;
