"use client"
import { Histogram, WeeklyFocus } from "@repo/ui";
import { MetricCard } from "@repo/ui";
import { useWeeklyFocus } from "../../hooks/home/useWeeklyFocus";



export const AnalyticsTrendsSection = () => {
  const weeklyFocus = useWeeklyFocus();
  const insights = weeklyFocus.insights

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
          value={`${insights.weekOverWeekPercent}%`}
          subText="Compared to last week"
        />
        <MetricCard
          label="Best Day"
          value={insights.bestDay.day}
          subText={`${insights.bestDay.minutes} min`}
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
