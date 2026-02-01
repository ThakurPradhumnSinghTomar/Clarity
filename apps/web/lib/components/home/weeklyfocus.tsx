import React from "react";
import { Histogram, MetricCard } from "@repo/ui";
import { useWeeklyFocus } from "@/lib/hooks/home/useWeeklyFocus";

const weeklyHistogramMock = {
  data: [4, 9, 13, 10, 8, 1, 4], // minutes per day (Mon → Sun)
  currentDay: 2, // Wednesday
  isCurrentWeek: true,
  insights: {
    changePercent: 11.4,
    bestDay: "Wednesday",
    bestDayMinutes: 160,
    worstDay: "Sunday",
    worstDayMinutes: 45,
  },
};

export const LocalWeeklyFocus = () => {
  const { data, currentDay, isCurrentWeek, insights } = weeklyHistogramMock;

  const weeklyFocus = useWeeklyFocus();

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
          currentDay={currentDay}
          isCurrentWeek={isCurrentWeek}
        />
      </div>

      {/* Insights */}
      {/* Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Week-over-Week"
          value={`${insights.changePercent}%`}
          subText="Compared to last week"
        />
        <MetricCard
          label="Best Day"
          value={insights.bestDay}
          subText={`${insights.bestDayMinutes} min`}
        />
        <MetricCard
          label="Lowest Focus"
          value={insights.worstDay}
          subText={`${insights.worstDayMinutes} min`}
        />
      </div>
    </section>
  );
};
