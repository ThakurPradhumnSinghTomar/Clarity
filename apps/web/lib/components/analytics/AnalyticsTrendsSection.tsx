"use client"
import { Histogram, WeeklyFocus } from "@repo/ui";
import { MetricCard } from "@repo/ui";
import { useWeeklyFocus } from "../../hooks/home/useWeeklyFocus";

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


export const AnalyticsTrendsSection = () => {
  const { data, currentDay, isCurrentWeek, insights } = weeklyHistogramMock;
  const weeklyFocus = useWeeklyFocus();

  return (
    <section className="mt-12 rounded-2xl bg-white dark:bg-[#151B22] p-6">
      {/* Header */}
      

      {/* Histogram */}
      <div className="mb-8">
        <WeeklyFocus {...weeklyFocus} currentDay={currentDay} />
      </div>

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
