import { MetricCard } from "./MetricCard";

type AnalyticsOverviewProps = {
  avgDailyTimeMin: number;
  avgSessionLengthMin: number;
  deepFocusRatio: number; // 0–100
  consistencyScore: number; // 0–100
};

export function AnalyticsOverview({
  avgDailyTimeMin,
  avgSessionLengthMin,
  deepFocusRatio,
  consistencyScore,
}: AnalyticsOverviewProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold text-[#0F172A] dark:text-[#E6EDF3]">
        Overview
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Avg Daily Time"
          value={`${avgDailyTimeMin} min`}
          subText="Per active day"
          hint="Average focused time on days you studied"
        />

        <MetricCard
          label="Avg Session Length"
          value={`${avgSessionLengthMin} min`}
          subText="Per session"
          hint="Longer sessions usually mean deeper focus"
        />

        <MetricCard
          label="Deep Focus Ratio"
          value={`${deepFocusRatio}%`}
          subText="Sessions > 25 min"
          hint="Higher means fewer distractions"
        />

        <MetricCard
          label="Consistency Score"
          value={`${consistencyScore}/100`}
          subText="Based on weekly activity"
          hint="Measures how regularly you study"
        />
      </div>
    </section>
  );
}
