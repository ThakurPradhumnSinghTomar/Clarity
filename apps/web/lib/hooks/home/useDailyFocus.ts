"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { getTimeBucket } from "@/lib/home/dailyFocus";

type FocusSession = {
  id: string;
  startTime: string;
  endTime: string | null;
  durationSec: number;
};

type DailySessions = {
  Morning: FocusSession[];
  Day: FocusSession[];
  Night: FocusSession[];
};

export function useDailyFocus() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [dailySessions, setDailySessions] = useState<DailySessions>({
    Morning: [],
    Day: [],
    Night: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [dailyLabel, setDailyLabel] = useState<"Today" | "Yesterday">("Today");

  useEffect(() => {
    if (!accessToken) return;

    const loadDailyFocus = async () => {
      setIsLoading(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/focus-sessions/recent`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const json = await res.json();
        if (!json?.success) return;

        const sessions =
          json.today.length > 0 ? json.today : json.pastSessions;

        setDailyLabel(json.today.length > 0 ? "Today" : "Yesterday");

        const grouped: DailySessions = {
          Morning: [],
          Day: [],
          Night: [],
        };

        sessions.forEach((s: FocusSession) => {
          const bucket = getTimeBucket(new Date(s.startTime));
          grouped[bucket].push(s);
        });

        setDailySessions(grouped);
      } catch (e) {
        console.error("Failed to load daily focus", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadDailyFocus();
  }, [accessToken]);

  return {
    isLoading,
    dailyLabel,
    dailySessions,
  };
}
