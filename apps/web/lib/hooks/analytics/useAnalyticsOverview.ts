"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type AnalyticsOverviewData = {
  avgDailyTimeMin: number;
  avgSessionLengthMin: number;
  deepFocusRatio: number;
  consistencyScore: number;
};

export function useAnalyticsOverview() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [overview, setOverview] = useState<AnalyticsOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    const loadOverview = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/analytics/overview`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const json = await res.json();
        if (json?.success) {
          setOverview(json.overview ?? null);
        }
      } catch (error) {
        console.error("Failed to load analytics overview", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOverview();
  }, [accessToken]);

  return {
    overview,
    isLoading,
  };
}
