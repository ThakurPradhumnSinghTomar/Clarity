"use client"
import { WeeklyFocus } from "@repo/ui";
import { MetricCard } from "@repo/ui";
import { useWeeklyFocus } from "../../hooks/home/useWeeklyFocus";



export const AnalyticsTrendsSection = () => {
  const weeklyFocus = useWeeklyFocus();
  const insights = weeklyFocus.insights
  const weekOverWeekDisplay =
    typeof insights.weekOverWeekPercent === "number"
      ? insights.weekOverWeekPercent.toFixed(2)
      : "--";

  return (
    <section className="mt-12 rounded-2xl bg-white dark:bg-[#151B22] p-6">
      {/* Header */}
      

      {/* Histogram */}
      <div className="mb-8">
        <WeeklyFocus {...weeklyFocus}/>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Week-over-Week"
          value={`${weekOverWeekDisplay}%`}
          subText="Compared to last week"
        />
        <MetricCard
          label="Best Day"
          value={insights.bestDay?.day ?? "--"}
          subText={
            insights.bestDay ? `${insights.bestDay.minutes} min` : "No data"
          }
        />
        <MetricCard
          label="Lowest Focus"
          value={insights.lowestFocusDay?.day ?? "--"}
          subText={
            insights.lowestFocusDay
              ? `${insights.lowestFocusDay.minutes} min`
              : "No data"
          }
        />
      </div>
    </section>
  );
};
