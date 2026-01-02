"use client";

import React, { useEffect, useState } from "react";
import { QuoteBox, RebuildHero, RoomCard } from "@repo/ui";
import { Histogram } from "@repo/ui";
import { Leaderboard } from "@repo/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Room } from "@repo/types";
import { transformRoomData } from "@/lib/helpfulFunctions/transformRoomData";
import { fetchMyRooms } from "@/lib/helpfulFunctions/roomsRelated/fetchRoomsData";
import { div } from "framer-motion/client";


/* ---------------- Skeletons ---------------- */

const HistogramSkeleton = () => (
  <div className="h-[360px] rounded-2xl border animate-pulse" />
);

/* ---------------- Page ---------------- */

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  /* ---------- State ---------- */

  const [data, setData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const currentDay = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isLoadingHistogram, setIsLoadingHistogram] = useState(true);
  const [histogramPage, setHistogramPage] = useState(0);
  const [stopNow, setStopNow] = useState(false);
  const [noWeeklyData, setNoWeeklyData] = useState(false);

  const accessToken = session?.accessToken;

  /* ---------- Fetch Rooms ---------- */

  useEffect(() => {
    if (!accessToken) return;

    fetchMyRooms({
      setIsLoadingRooms,
      setError,
      accessToken,
      setMyRooms,
    });
  }, [accessToken]);

  /* ---------- Fetch Histogram ---------- */

  const loadCurrentWeekStudyHours = async () => {
    if (!accessToken) return;

    setIsLoadingHistogram(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-current-week-study-hours/${histogramPage}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const json = await response.json();

      if (!json?.success || !json.weeklyStudyHours?.days) {
        setStopNow(true);
        setNoWeeklyData(true);
        return;
      }

      const newData = [0, 0, 0, 0, 0, 0, 0];
      json.weeklyStudyHours.days.forEach(
        (d: { weekday: number; focusedSec: number }) => {
          newData[d.weekday] =
            Math.round((d.focusedSec / 3600) * 100) / 100;
        }
      );

      setData(newData);
    } catch {
      setNoWeeklyData(true);
    } finally {
      setIsLoadingHistogram(false);
    }
  };

  useEffect(() => {
    loadCurrentWeekStudyHours();
  }, [accessToken, histogramPage]);

  /* ---------------- Render ---------------- */

  return (
    <div className="min-h-screen">

      {/* DASHBOARD */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">

          {/* ---------- LEFT COLUMN ---------- */}
          <section className="space-y-10">
            {/* INSIGHTS CARD */}
            <div className="rounded-3xl border backdrop-blur-xl p-8 space-y-10">
              <QuoteBox />

              {isLoadingHistogram ? (
                <HistogramSkeleton />
              ) : (
                <div className="relative">
                  {!stopNow && (
                    <button
                      className="
                        absolute -left-6 top-1/2 -translate-y-1/2
                        h-9 w-9 rounded-full border
                        backdrop-blur-md text-sm
                      "
                      onClick={() => setHistogramPage(histogramPage + 1)}
                    >
                      ←
                    </button>
                  )}

                  {!noWeeklyData ? (
                    <Histogram data={data} currentDay={currentDay} />
                  ) : (
                    <div className="h-[360px] rounded-2xl border flex items-center justify-center">
                      <p className="text-sm opacity-70">
                        No study data for this week
                      </p>
                    </div>
                  )}

                  {histogramPage > 0 && (
                    <button
                      className="
                        absolute -right-6 top-1/2 -translate-y-1/2
                        h-9 w-9 rounded-full border
                        backdrop-blur-md text-sm
                      "
                      onClick={() => {
                        setHistogramPage(Math.max(0, histogramPage - 1));
                        setStopNow(false);
                        setNoWeeklyData(false);
                      }}
                    >
                      →
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ---------- RIGHT COLUMN (ROOMS) ---------- */}
          <aside className="rounded-3xl border p-6 h-[520px] flex flex-col">
            <div className="mb-4 pb-3 border-b">
              <h2 className="text-lg font-semibold">My Rooms</h2>
              <p className="text-sm opacity-70">
                Rooms you’re currently part of
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {!isLoadingRooms && myRooms.length > 0 ? (
                myRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() =>
                      router.push(`/home/rooms/${room.id}`)
                    }
                    className="cursor-pointer"
                  >
                    <RoomCard {...transformRoomData(room)} />
                  </div>
                ))
              ) : isLoadingRooms ? (
                <p className="text-sm opacity-60 text-center mt-10">
                  Loading rooms…
                </p>
              ) : (
                <p className="text-sm opacity-60 text-center mt-10">
                  No rooms joined yet
                </p>
              )}
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
