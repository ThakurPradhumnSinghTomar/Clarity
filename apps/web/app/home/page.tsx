"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Histogram, ClassicLoader, RoomCard, OrbitalClock } from "@repo/ui";
import { Room } from "@repo/types";

import { transformRoomData } from "@/lib/helpfulFunctions/transformRoomData";
import { fetchMyRooms } from "@/lib/helpfulFunctions/roomsRelated/fetchRoomsData";

type FocusSession = {
  id: string;
  startTime: string;
  endTime: string | null;
  durationSec: number;
};

const getTimeBucket = (date: Date) => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 18) return "Day";
  return "Night";
};

/* ---------------- Skeleton ---------------- */

const HistogramSkeleton = () => (
  <div className="w-full min-h-[480px] rounded-2xl border-[#475661] backdrop-blur-xl shadow-sm p-8 flex justify-center items-center">
    <ClassicLoader />
  </div>
);

/* ---------------- Icons ---------------- */

const ArrowLeftIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const getActivityColor = (sec: number) => {
  if (sec === 0) return "bg-[#E5E7EB] dark:bg-[#1F2933]";
  if (sec < 30 * 60) return "bg-[#C7D2FE]";
  if (sec < 90 * 60) return "bg-[#818CF8]";
  return "bg-[#4F6EF7]";
};

const calculateStreaks = (days: { date: string; focusedSec: number }[]) => {
  let currentStreak = 0;
  let longestStreak = 0;
  let temp = 0;

  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].focusedSec > 0) {
      temp++;
      if (i === days.length - 1) currentStreak = temp;
      longestStreak = Math.max(longestStreak, temp);
    } else {
      temp = 0;
    }
  }

  return { currentStreak, longestStreak };
};

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
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState("All Tags");
  const [tagContributionMap, setTagContributionMap] = useState<
    Record<string, number>
  >({});

  const [dailySessions, setDailySessions] = useState<{
    Morning: FocusSession[];
    Day: FocusSession[];
    Night: FocusSession[];
  }>({
    Morning: [],
    Day: [],
    Night: [],
  });

  const [isLoadingDaily, setIsLoadingDaily] = useState(true);
  const [dailyLabel, setDailyLabel] = useState<"Today" | "Yesterday">("Today");

  const [activityWeeks, setActivityWeeks] = useState<Record<number, number[]>>(
    {}
  );

  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  //load activity chart
  useEffect(() => {
    if (!accessToken) return;

    const loadActivity = async () => {
      setIsLoadingActivity(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-heatmap-data`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const json = await res.json();
        if (json?.success) {
          setActivityWeeks(json.finalWeekData || {});
        }
      } catch (e) {
        console.error("Failed to load activity chart", e);
      } finally {
        setIsLoadingActivity(false);
      }
    };

    loadActivity();
  }, [accessToken]);

  //load recent focus sessions
  useEffect(() => {
    if (!accessToken) return;

    const loadDailyFocus = async () => {
      setIsLoadingDaily(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/focus-sessions/recent`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const json = await res.json();
        if (!json?.success) return;

        const sessions = json.today.length > 0 ? json.today : json.pastSessions;

        setDailyLabel(json.today.length > 0 ? "Today" : "Yesterday");

        const grouped = {
          Morning: [],
          Day: [],
          Night: [],
        } as any;

        sessions.forEach((s: FocusSession) => {
          const bucket = getTimeBucket(new Date(s.startTime));
          grouped[bucket].push(s);
        });

        setDailySessions(grouped);
      } catch (e) {
        console.error("Failed to load daily focus", e);
      } finally {
        setIsLoadingDaily(false);
      }
    };

    loadDailyFocus();
  }, [accessToken]);

  //load tags
  useEffect(() => {
    if (!session?.accessToken) return;

    const fetchTags = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/tags`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        setAvailableTags(data.tags || []);
      } catch (e) {
        console.error("Failed to fetch tags", e);
      }
    };

    fetchTags();
  }, [session?.accessToken]);

  //fetch rooms
  useEffect(() => {
    if (!accessToken) return;
    fetchMyRooms({
      setIsLoadingRooms,
      accessToken,
      setMyRooms,
      setError: () => {},
    });
  }, [accessToken]);

  //get current week study hours by tags
  useEffect(() => {
    if (!accessToken) return;

    if (selectedTag == "All Tags") {
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
    } else {
      //load weekly study hours by tag
      const load = async () => {
        setIsLoadingHistogram(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-weekly-study-hours-by-tags/${histogramPage}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const json = await res.json();

          if (!json?.data) {
            setStopNow(true);
            setNoWeeklyData(true);
            return;
          }

          const newData = [0, 0, 0, 0, 0, 0, 0];

          const tagData = json.data[selectedTag];
          if (tagData.byDay.length == 0) {
            setStopNow(true);
            setNoWeeklyData(true);
            return;
          }

          if (tagData) {
            tagData.byDay.forEach((day: any, index: number) => {
              newData[index] =
                Math.round((day.totalDuration / 3600) * 100) / 100;
            });
          }

          const totalWeekDuration = json.week.totalDuration || 0;
          const contributionMap: Record<string, number> = {};

          Object.entries(json.data).forEach(([tagName, tagInfo]: any) => {
            contributionMap[tagName] =
              totalWeekDuration > 0
                ? Math.round((tagInfo.totalDuration / totalWeekDuration) * 100)
                : 0;
          });

          setTagContributionMap(contributionMap);

          setData(newData);
          setNoWeeklyData(false);
          setStopNow(false);
        } catch (e) {
          setNoWeeklyData(true);
        } finally {
          setIsLoadingHistogram(false);
        }
      };
      load();
    }
  }, [accessToken, histogramPage, selectedTag]);

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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
            Track deep work, stay accountable with rooms, and enter flow without
            friction.
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
            relative rounded-3xl border lg:p-8
            bg-white border-[#E2E8F0]
            dark:bg-[#151B22] dark:border-[#1F2933] min-h-[520px]
          "
        >
          <div className="">
            <div className="grid grid-cols-1 lg:grid-cols-[75%_25%] gap-6">
              <div className="relative">
                <div>
                  {isLoadingHistogram ? (
                    <HistogramSkeleton />
                  ) : noWeeklyData ? (
                    <div>
                      <div className="h-[460px] flex text-center items-center justify-center text-sm opacity-70 leading-loose  border rounded-2xl">
                        No study data this week <br /> Start your study session
                        now
                      </div>
                    </div>
                  ) : (
                    <Histogram
                      data={data}
                      currentDay={currentDay}
                      isCurrentWeek={histogramPage === 0}
                    />
                  )}
                </div>
                <div className="absolute z-10 flex justify-between w-full">
                  <div className="">
                    <button
                      onClick={() => setHistogramPage((p) => p + 1)}
                      disabled={stopNow}
                      className={`
                      -translate-y-1/2 z-10
                      h-9 w-9 rounded-full border
                      flex items-center justify-center
                      bg-white border-[#E2E8F0]
                      dark:bg-[#1F2933] dark:border-[#1F2933] 

                      ${
                        stopNow
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-[#F1F5F9] dark:hover:bg-[#263241] cursor-pointer"
                      }
                    `}
                    >
                      <ArrowLeftIcon />
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() =>
                        setHistogramPage((p) => Math.max(0, p - 1))
                      }
                      disabled={histogramPage === 0}
                      className={`
                        -translate-y-1/2
                        h-9 w-9 rounded-full border
                        flex items-center justify-center
                        bg-white border-[#E2E8F0]
                        dark:bg-[#1F2933] dark:border-[#1F2933] 

                        ${
                          histogramPage === 0
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-[#F1F5F9] dark:hover:bg-[#263241] cursor-pointer"
                        }
                      `}
                    >
                      <ArrowRightIcon />
                    </button>
                  </div>
                </div>
              </div>
              <div className="">
                <div className="mt-2 flex-col justify-between">
                  <div className="flex lg:flex-col gap-3 overflow-x-auto lg:h-[380px] overflow-y-auto scrollbar-hide px-1">
                    {["All Tags", ...availableTags, "untagged"].map((tag) => {
                      const isActive = selectedTag === tag;
                      const contribution =
                        tag === "All Tags"
                          ? 100
                          : (tagContributionMap[tag] ?? 0);

                      return (
                        <motion.button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          className={`
                        px-4 py-2 rounded-2xl text-sm whitespace-nowrap
                        border transition-all cursor-pointer
                        ${
                          isActive
                            ? "bg-[#4F6EF7] text-white border-transparent shadow-md dark:bg-[#7C9AFF] dark:text-[#0F1419]"
                            : "bg-white/60 text-[#334155] border-[#E2E8F0] hover:bg-[#F1F5F9] dark:bg-[#1F2933] dark:text-[#CBD5E1] dark:border-[#263241] dark:hover:bg-[#263241]"
                        }
                      `}
                        >
                          {tag}
                          {selectedTag == "All Tags" ? (
                            <div></div>
                          ) : (
                            <div>
                              {
                                <div className="mt-1 text-[11px] opacity-70">
                                  {contribution > 0
                                    ? `${contribution}% of week`
                                    : "No contribution"}
                                </div>
                              }
                              <div className="w-full h-1 mt-1 rounded bg-black/10 dark:bg-white/10 overflow-hidden">
                                <div
                                  className="h-full bg-current transition-all"
                                  style={{ width: `${contribution}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="text-[#64748B] dark:text-[#9FB0C0] p-4 pt-4">
                    <p>
                      Select above tags and check how much they contributed to
                      your studies
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <header>
          <h2 className="text-2xl font-semibold">Activity</h2>
          <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
            Your consistency over the last 8 weeks.
          </p>
        </header>

        <div
          className="
    rounded-3xl border p-6
    bg-white border-[#E2E8F0]
    dark:bg-[#151B22] dark:border-[#1F2933]
  "
        >
          {isLoadingActivity ? (
            <div className="h-[140px] flex items-center justify-center">
              <ClassicLoader />
            </div>
          ) : (
            (() => {
              const flattenedDays = Object.values(activityWeeks).flat();

              const { currentStreak, longestStreak } = calculateStreaks(
                flattenedDays.map((focusedSec, i) => ({
                  date: String(i),
                  focusedSec,
                }))
              );

              return (
                <div className="flex flex-col lg:flex-row gap-10 items-start">
                  {/* HEATMAP */}
                  <div className="flex gap-1">
                    {Object.entries(activityWeeks).map(([weekIdx, days]) => (
                      <div key={weekIdx} className="flex flex-col gap-1">
                        {days.map((focusedSec, dayIdx) => (
                          <div
                            key={dayIdx}
                            title={`${focusedSec > 0 ? Math.round(focusedSec / 60) : 0} min`}
                            className={`
            h-4 w-4 rounded-sm
            ${getActivityColor(focusedSec)}
          `}
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* STATS */}
                  <div className="space-y-6 flex justify-around w-full items-center">
                    <div>
                      <p className="text-sm text-[#9FB0C0]">Current streak</p>
                      <p className="text-lg font-semibold flex items-center gap-2">
                        🔥 {currentStreak} day{currentStreak !== 1 && "s"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-[#9FB0C0]">Best streak</p>
                      <p className="text-lg font-medium flex items-center gap-2">
                        🏆 {longestStreak} days
                      </p>
                    </div>

                    <div className="">
                      <p className="text-xs uppercase tracking-wide opacity-60 mb-2">
                        Activity level
                      </p>
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <span>Less</span>
                        <div className="flex gap-1">
                          <div className="h-3 w-3 rounded-sm bg-[#1F2933]" />
                          <div className="h-3 w-3 rounded-sm bg-[#C7D2FE]" />
                          <div className="h-3 w-3 rounded-sm bg-[#818CF8]" />
                          <div className="h-3 w-3 rounded-sm bg-[#4F6EF7]" />
                        </div>
                        <span>More</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </section>

      {/* ---------------- DAILY FOCUS ---------------- */}
      <section className="space-y-8">
        <header>
          <h2 className="text-2xl font-semibold">Daily Focus</h2>
          <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
            {dailyLabel}'s sessions, split by time of day.
          </p>
        </header>

        <div
          className="
      rounded-3xl border p-8
      bg-white border-[#E2E8F0]
      dark:bg-[#151B22] dark:border-[#1F2933]
    "
        >
          {isLoadingDaily ? (
            <div className="h-[240px] flex items-center justify-center">
              <ClassicLoader />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(["Morning", "Day", "Night"] as const).map((bucket) => (
                <div
                  key={bucket}
                  className="
              rounded-2xl border p-4
              bg-[#F8FAFC] border-[#E2E8F0]
              dark:bg-[#0F1419] dark:border-[#1F2933]
            "
                >
                  <h3 className="font-medium mb-3">{bucket}</h3>

                  {dailySessions[bucket].length === 0 ? (
                    <p className="text-sm opacity-60">No sessions</p>
                  ) : (
                    <div className="space-y-2">
                      {dailySessions[bucket].map((s) => (
                        <div
                          key={s.id}
                          className="
                      flex justify-between items-center
                      rounded-xl px-3 py-2
                      bg-white dark:bg-[#151B22]
                      border border-[#E2E8F0] dark:border-[#1F2933]
                      text-sm
                    "
                        >
                          <span>
                            {new Date(s.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {" - "}
                            {s.endTime
                              ? new Date(s.endTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Ongoing"}
                          </span>

                          <span className="opacity-70">
                            {Math.round(s.durationSec / 60)} min
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
          One click. Timer on. Distractions out. Your future self will thank
          you.
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

/*

2️⃣ What Object.values(activityWeeks) does
👉 Removes the keys (0,1,2...) and gives you only the arrays.

3️⃣ What .flat() does (this is the key)
👉 Flattens one level deep

Meaning:

[
  [a, b, c],
  [d, e, f]
].flat()


becomes

[a, b, c, d, e, f]

*/