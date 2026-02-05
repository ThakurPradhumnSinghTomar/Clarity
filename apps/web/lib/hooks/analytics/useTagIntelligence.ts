"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type TimePerTagItem = {
  tag: string;
  totalDurationSec: number;
  sessionCount: number;
};

type WeeklyBreakdownItem = {
  tag: string;
  sessions: number;
  avgSessionDurationSec: number;
  totalDurationSec: number;
};

export function useTagIntelligence(page = 0) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [timePerTag, setTimePerTag] = useState<TimePerTagItem[]>([]);
  const [weeklyBreakdown, setWeeklyBreakdown] = useState<WeeklyBreakdownItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    const loadTagIntelligence = async () => {
      setIsLoading(true);
      try {
        const [timePerTagRes, weeklyBreakdownRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/analytics/time-per-tag/${page}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/analytics/weekly-breakdown-by-tag/${page}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          ),
        ]);

        const [timePerTagJson, weeklyBreakdownJson] = await Promise.all([
          timePerTagRes.json(),
          weeklyBreakdownRes.json(),
        ]);

        if (timePerTagJson?.success) {
          setTimePerTag(timePerTagJson.data ?? []);
        } else {
          setTimePerTag([]);
        }

        if (weeklyBreakdownJson?.success) {
          setWeeklyBreakdown(weeklyBreakdownJson.data ?? []);
        } else {
          setWeeklyBreakdown([]);
        }
      } catch (error) {
        console.error("Failed to load tag intelligence", error);
        setTimePerTag([]);
        setWeeklyBreakdown([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTagIntelligence();
  }, [accessToken, page]);

  return {
    timePerTag,
    weeklyBreakdown,
    isLoading,
  };
}
