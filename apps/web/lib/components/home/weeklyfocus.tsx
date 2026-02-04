import React from "react";
import { Histogram, MetricCard } from "@repo/ui";
import { useWeeklyFocus } from "@/lib/hooks/home/useWeeklyFocus";

export const LocalWeeklyFocus = () => {
  const weeklyFocus = useWeeklyFocus();
  const insights = weeklyFocus.insights;
  const weekOverWeekDisplay =
    typeof insights.weekOverWeekPercent === "number"
      ? insights.weekOverWeekPercent.toFixed(2)
      : "--";

  return (
    <section className="mt-12 rounded-2xl bg-transparent">
      {/* Header */}
      <header className="mb-8">
          <h2 className="text-2xl font-semibold dark:text-white">Weekly Focus</h2>
          <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
            Your actual work, not intentions.
          </p>
        </header>

      {/* Histogram */}
      <div className="mb-8">
        <Histogram
          data={weeklyFocus.data}
          meta={weeklyFocus.meta}
          currentDay={new Date().getDay() === 0 ? 6 : new Date().getDay() - 1}
          isCurrentWeek={weeklyFocus.histogramPage === 0}
        />
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
