"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type FocusInsightsData = {
  focusStats: {
    deepFocusSessions: number;
    avgSessionLengthMin: number;
    bestFocusWindow: string;
    breakRate: number;
  };
  sessionBuckets: {
    range: string;
    count: number;
  }[];
  breakPatternInsight: {
    headline: string;
    description: string;
  };
};

const defaultInsights: FocusInsightsData = {
  focusStats: {
    deepFocusSessions: 0,
    avgSessionLengthMin: 0,
    bestFocusWindow: "--",
    breakRate: 0,
  },
  sessionBuckets: [],
  breakPatternInsight: {
    headline: "No focus pattern available yet.",
    description:
      "Complete a few focus sessions to unlock personalized insight.",
  },
};

export function useFocusInsights() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [insights, setInsights] = useState<FocusInsightsData>(defaultInsights);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    const loadFocusInsights = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/analytics/focus-insights`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const json = await res.json();
        if (json?.success) {
          setInsights(json.insights ?? defaultInsights);
        } else {
          setInsights(defaultInsights);
        }
      } catch (error) {
        console.error("Failed to load focus insights", error);
        setInsights(defaultInsights);
      } finally {
        setIsLoading(false);
      }
    };

    loadFocusInsights();
  }, [accessToken]);

  return {
    insights,
    isLoading,
  };
}
