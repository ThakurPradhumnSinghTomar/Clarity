"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useWeeklyFocus() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [data, setData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [meta, setMeta] = useState({
    weekStart: new Date(),
  });
  const [insights, setInsights] = useState({
    changePercent: 0,
    bestDay: "Wednesday",
    bestDayMinutes: 0,
    worstDay: "Sunday",
    worstDayMinutes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [histogramPage, setHistogramPage] = useState(0);
  const [stopNext, setStopNext] = useState(false);

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState("All Tags");
  const [tagContributionMap, setTagContributionMap] = useState<
    Record<string, number>
  >({});

  /* -------- Fetch tags -------- */
  useEffect(() => {
    if (!accessToken) return;

    const fetchTags = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/tags`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        if (!res.ok) return;

        const json = await res.json();
        setAvailableTags(json.tags || []);
      } catch (e) {
        console.error("Failed to fetch tags", e);
      }
    };

    fetchTags();
  }, [accessToken]);

  /* -------- Fetch weekly data -------- */
  useEffect(() => {
    if (!accessToken) return;

    const loadWeekly = async () => {
      setIsLoading(true);

      try {
        if (selectedTag === "All Tags") {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-current-week-study-hours/${histogramPage}`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
          );

          const json = await res.json();

          if (!json?.weeklyStudyHours?.days) {
            setNoData(true);
            setStopNext(true);
            return;
          }

          const nextData = [0, 0, 0, 0, 0, 0, 0];

          if (json.weeklyStudyHours.days.length > 0) {
            json.weeklyStudyHours.days.forEach(
              (d: { weekday: number; focusedSec: number }) => {
                nextData[d.weekday] =
                  Math.round((d.focusedSec / 3600) * 100) / 100;
              },
            );
          }

          setMeta({
            weekStart: json.weeklyStudyHours.weekStart,
          });
          setInsights(json.weeklyStudyHours.meta)
          setData(nextData);
          setNoData(false);
          setStopNext(false);
        } else {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-weekly-study-hours-by-tags/${histogramPage}`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
          );

          const json = await res.json();
          const tagData = json?.data?.[selectedTag];

          if (!tagData || tagData.byDay.length === 0) {
            setNoData(true);
            setStopNext(true);
            return;
          }

          const nextData = [0, 0, 0, 0, 0, 0, 0];
          tagData.byDay.forEach((day: any, index: number) => {
            nextData[index] =
              Math.round((day.totalDuration / 3600) * 100) / 100;
          });

          const totalWeek = json.week?.totalDuration || 0;
          const contributionMap: Record<string, number> = {};

          Object.entries(json.data).forEach(([tag, info]: any) => {
            contributionMap[tag] =
              totalWeek > 0
                ? Math.round((info.totalDuration / totalWeek) * 100)
                : 0;
          });

          setTagContributionMap(contributionMap);
          setData(nextData);
          setNoData(false);
          setStopNext(false);
        }
      } catch (e) {
        setNoData(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadWeekly();
  }, [accessToken, histogramPage, selectedTag]);

  return {
    data,
    meta,
    insights,
    isLoading,
    noData,
    histogramPage,
    stopNext,
    availableTags,
    selectedTag,
    tagContributionMap,

    onNextWeek: () => setHistogramPage((p) => p + 1),
    onPrevWeek: () => setHistogramPage((p) => Math.max(0, p - 1)),
    onTagSelect: setSelectedTag,
  };
}
