"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { calculateStreaks } from "@/lib/home/activity";

export function useActivity() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [activityWeeks, setActivityWeeks] = useState<Record<number, number[]>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    const loadActivity = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-heatmap-data`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const json = await res.json();
        if (json?.success) {
          setActivityWeeks(json.finalWeekData || {});
        }
      } catch (e) {
        console.error("Failed to load activity chart", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, [accessToken]);

  const flattenedDays = Object.values(activityWeeks).flat();

  const { currentStreak, longestStreak } = calculateStreaks(
    flattenedDays.map((focusedSec, i) => ({
      date: String(i),
      focusedSec,
    })),
  );

  return {
    isLoading,
    activityWeeks,
    currentStreak,
    longestStreak,
  };
}
