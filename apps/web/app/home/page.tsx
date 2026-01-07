"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Histogram, ClassicLoader, RoomCard, OrbitalClock } from "@repo/ui";
import { Room } from "@repo/types";

import { transformRoomData } from "@/lib/helpfulFunctions/transformRoomData";
import { fetchMyRooms } from "@/lib/helpfulFunctions/roomsRelated/fetchRoomsData";

/* ---------------- Skeleton ---------------- */

const HistogramSkeleton = () => (
  <div
    className="
      h-[420px] min-w-[720px] rounded-3xl border
      bg-white border-[#E2E8F0]
      dark:bg-[#151B22] dark:border-[#1F2933]
      animate-pulse flex items-center justify-center
    "
  >
    <ClassicLoader />
  </div>
);

/* ---------------- Icons ---------------- */

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

/* ---------------- Page ---------------- */

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const accessToken = session?.accessToken;

  const [data, setData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const currentDay = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const [isLoadingHistogram, setIsLoadingHistogram] = useState(true);
  const [noWeeklyData, setNoWeeklyData] = useState(false);
  const [histogramPage, setHistogramPage] = useState(0);
  const [stopNow, setStopNow] = useState(false);

  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetchMyRooms({
      setIsLoadingRooms,
      accessToken,
      setMyRooms,
      setError: () => {},
    });
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    const load = async () => {
      setIsLoadingHistogram(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-current-week-study-hours/${histogramPage}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
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

  return (
    <main
      className="
        max-w-8xl mx-auto px-12 pb-32 space-y-32
        bg-[#F4F6F8] text-[#1F2937]
        dark:bg-[#0F1419] dark:text-[#E6EDF3]
      "
    >
      {/* ---------------- HERO ---------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center pt-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-[0.4em] text-[#64748B] dark:text-[#9FB0C0] mb-6">
            Daily Focus
          </p>

          <h1 className="text-4xl font-semibold leading-tight mb-6">
            Build consistency.
            <br />
            <span className="text-[#4F6EF7] dark:text-[#7C9AFF]">
              Let the hours compound.
            </span>
          </h1>

          <p className="text-[#64748B] dark:text-[#9FB0C0] max-w-md">
            Track deep work, stay accountable with rooms, and enter flow without friction.
          </p>
        </motion.div>

        <div className="relative flex justify-center">
          <div className="absolute inset-0 rounded-full bg-[#4F6EF7]/10 dark:bg-[#7C9AFF]/10 blur-3xl" />
          <OrbitalClock />
        </div>
      </section>

      {/* ---------------- WEEKLY FOCUS ---------------- */}
      <section className="space-y-8">
        <header>
          <h2 className="text-2xl font-semibold">Weekly Focus</h2>
          <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
            Your actual work, not intentions.
          </p>
        </header>

        <div
          className="
            relative rounded-3xl border p-8
            bg-white border-[#E2E8F0]
            dark:bg-[#151B22] dark:border-[#1F2933] min-h-[520px]
          "
        >
          {!stopNow && (
            <button
              onClick={() => setHistogramPage((p) => p + 1)}
              className="
                absolute left-4 top-1/2 -translate-y-1/2
                h-9 w-9 rounded-full border
                bg-white border-[#E2E8F0] hover:bg-[#F1F5F9]
                dark:bg-[#1F2933] dark:border-[#1F2933] dark:hover:bg-[#263241]
                flex items-center justify-center
              "
            >
              <ArrowLeftIcon />
            </button>
          )}

          <div className="flex justify-center">
            {isLoadingHistogram ? (
              <HistogramSkeleton />
            ) : noWeeklyData ? (
              <div className="h-[320px] flex text-center items-center justify-center text-sm opacity-70 leading-loose mt-10">
                No study data this week <br/> Start your study session now
              </div>
            ) : (
              <Histogram data={data} currentDay={currentDay} isCurrentWeek={histogramPage === 0} />
            )}
          </div>

          {histogramPage > 0 && (
            <button
              onClick={() => setHistogramPage((p) => Math.max(0, p - 1))}
              className="
                absolute right-4 top-1/2 -translate-y-1/2
                h-9 w-9 rounded-full border
                bg-white border-[#E2E8F0] hover:bg-[#F1F5F9]
                dark:bg-[#1F2933] dark:border-[#1F2933] dark:hover:bg-[#263241]
                flex items-center justify-center
              "
            >
              <ArrowRightIcon />
            </button>
          )}
        </div>
      </section>

      {/* ---------------- ROOMS ---------------- */}
      <section className="space-y-6">
        <header>
          <h2 className="text-2xl font-semibold">Your Rooms</h2>
          <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
            Accountability works better with people.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingRooms ? (
            <p className="opacity-60">Loading rooms…</p>
          ) : myRooms.length ? (
            myRooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ y: -6 }}
                className="
                  cursor-pointer transition
                  hover:shadow-lg
                  dark:hover:shadow-[0_20px_40px_rgba(124,154,255,0.15)]
                "
                onClick={() => router.push(`/home/rooms/${room.id}`)}
              >
                <RoomCard {...transformRoomData(room)} />
              </motion.div>
            ))
          ) : (
            <p className="opacity-60">No rooms joined yet</p>
          )}
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section
        className="
          rounded-3xl p-12 text-center border
          bg-white border-[#E2E8F0]
          dark:bg-[#151B22] dark:border-[#1F2933]
        "
      >
        <h2 className="text-3xl font-semibold mb-4">Ready to enter flow?</h2>

        <p className="text-[#64748B] dark:text-[#9FB0C0] max-w-xl mx-auto mb-8">
          One click. Timer on. Distractions out. Your future self will thank you.
        </p>

        <button
          onClick={() => router.push("/home/study-session")}
          className="
            h-12 px-8 rounded-full
            bg-[#4F6EF7] text-white hover:bg-[#3B5BDB]
            dark:bg-[#7C9AFF] dark:text-[#0F1419] dark:hover:bg-[#93AEFF]
            transition
          "
        >
          Start Study Session
        </button>
      </section>
    </main>
  );
}
