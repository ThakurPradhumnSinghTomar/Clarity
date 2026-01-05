"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Histogram, ClassicLoader, RoomCard } from "@repo/ui";
import { OrbitalClock } from "@repo/ui";
import { Room } from "@repo/types";

import { transformRoomData } from "@/lib/helpfulFunctions/transformRoomData";
import { fetchMyRooms } from "@/lib/helpfulFunctions/roomsRelated/fetchRoomsData";

/* ---------------- Skeleton ---------------- */

const HistogramSkeleton = () => (
  <div className="h-[450px] rounded-2xl border animate-pulse bg-[#F6F8F4] flex items-center justify-center"><ClassicLoader></ClassicLoader></div>
);

type PanelTab = "overview" | "rooms" | "session";

/* ---------------- Page ---------------- */

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const accessToken = session?.accessToken;

  /* ---------- UI State ---------- */

  const [activeTab, setActiveTab] = useState<PanelTab>("overview");

  /* ---------- Histogram State ---------- */

  const [data, setData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const currentDay = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const [isLoadingHistogram, setIsLoadingHistogram] = useState(true);
  const [noWeeklyData, setNoWeeklyData] = useState(false);
  const [histogramPage, setHistogramPage] = useState(0);
  const [stopNow, setStopNow] = useState(false);

  /* ---------- Rooms State ---------- */

  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  /* ---------- Fetch Rooms ---------- */

  useEffect(() => {
    if (!accessToken) return;

    fetchMyRooms({
      setIsLoadingRooms,
      accessToken,
      setMyRooms,
      setError: () => {},
    });
  }, [accessToken]);

  /* ---------- Fetch Histogram ---------- */

  useEffect(() => {
    if (!accessToken) return;

    const load = async () => {
      setIsLoadingHistogram(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-current-week-study-hours/${histogramPage}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const json = await res.json();

        if (!json?.weeklyStudyHours?.days?.length) {
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
        setNoWeeklyData(false);
        setStopNow(false);
      } catch {
        setNoWeeklyData(true);
      } finally {
        setIsLoadingHistogram(false);
      }
    };

    load();
  }, [accessToken, histogramPage]);

  /* ---------------- Render ---------------- */

  return (
    <main className="max-w-8xl mx-auto px-6 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-14 items-start">

        {/* ---------- LEFT : CLOCK ---------- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center min-h-[520px]"
        >
          <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-mono">
            Local Time
          </p>

          <OrbitalClock />

          <p className="mt-12 text-xs font-mono tracking-wide text-muted-foreground">
            [ focus matters ]
          </p>
        </motion.section>

        {/* ---------- RIGHT : PANEL ---------- */}
        <motion.section
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="
            rounded-3xl border
            bg-white/70 dark:bg-card/70
            backdrop-blur-xl
            shadow-xl
            p-8 mr-8 min-h-[560]
          "
        >
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { id: "overview", label: "Overview" },
              { id: "rooms", label: "My Rooms" },
              { id: "session", label: "Session" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PanelTab)}
                className={`
                  px-4 py-2 rounded-full text-sm transition
                  ${
                    activeTab === tab.id
                      ? "bg-neutral-900 text-white"
                      : "border hover:bg-neutral-100 dark:hover:bg-muted"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-[360px]">
            {activeTab === "overview" && (
              <div className="relative">
                {!stopNow && (
                  <button
                    onClick={() => setHistogramPage((p) => p + 1)}
                    className="
                      absolute -left-5 top-1/2 -translate-y-1/2
                      h-9 w-9 rounded-full border
                      bg-white/70 dark:bg-card/70
                      backdrop-blur-md
                      hover:bg-neutral-100 dark:hover:bg-muted
                      transition z-10
                    "
                  >
                    ←
                  </button>
                )}

                {isLoadingHistogram ? (
                  <HistogramSkeleton />
                ) : noWeeklyData ? (
                  <div className="h-[320px] flex items-center justify-center text-sm opacity-70">
                    No study data this week
                  </div>
                ) : (
                  <Histogram data={data} currentDay={currentDay} />
                )}

                {histogramPage > 0 && (
                  <button
                    onClick={() =>
                      setHistogramPage((p) => Math.max(0, p - 1))
                    }
                    className="
                      absolute -right-5 top-1/2 -translate-y-1/2
                      h-9 w-9 rounded-full border
                      bg-white/70 dark:bg-card/70
                      backdrop-blur-md
                      hover:bg-neutral-100 dark:hover:bg-muted
                      transition
                    "
                  >
                    →
                  </button>
                )}
              </div>
            )}

            {activeTab === "rooms" && (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {isLoadingRooms ? (
                  <p className="text-sm opacity-60 text-center mt-10">
                    Loading rooms…
                  </p>
                ) : myRooms.length > 0 ? (
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
                ) : (
                  <p className="text-sm opacity-60 text-center mt-10">
                    No rooms joined yet
                  </p>
                )}
              </div>
            )}

            {activeTab === "session" && (
              <div className="h-[320px] flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-semibold mb-4">
                  Ready to focus?
                </h3>
                <p className="text-sm opacity-70 mb-6 max-w-sm">
                  Start a focused study session and track your progress in real time.
                </p>
                <button
                  onClick={() => router.push("/session")}
                  className="
                    h-12 px-6 rounded-full
                    bg-neutral-900 text-white
                    hover:bg-neutral-800 transition
                  "
                >
                  Start Study Session
                </button>
              </div>
            )}
          </div>
        </motion.section>
      </div>

       {/* FOOTER */}
      <footer className="text-center text-xs text-neutral-500 pt-30">
        © {new Date().getFullYear()} Rebuild — Built for focused minds.
      </footer>
    </main>
  );
}
