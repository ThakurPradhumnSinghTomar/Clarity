"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAnimate } from "framer-motion";
import { useSession } from "next-auth/react";

const HOUR = 3600;
const MINUTE = 60;

const useUnmountClear = (
  ref: React.MutableRefObject<NodeJS.Timeout | null>
) => {
  useEffect(() => {
    return () => {
      if (ref.current) {
        clearInterval(ref.current);
        ref.current = null;
      }
    };
  }, [ref]);
};

/* ===================== Animated Digit ===================== */

function AnimatedDigit({ value }: { value: number }) {
  const [ref, animate] = useAnimate();
  const prev = useRef<number>(value);

  useEffect(() => {
    if (prev.current === value) return;

    const run = async () => {
      await animate(
        ref.current,
        { y: ["0%", "-50%"], opacity: [1, 0] },
        { duration: 0.25 }
      );
      prev.current = value;
      await animate(
        ref.current,
        { y: ["50%", "0%"], opacity: [0, 1] },
        { duration: 0.25 }
      );
    };

    run();
  }, [value, animate]);

  return (
    <span
      ref={ref}
      className="block font-mono text-4xl md:text-6xl font-semibold
             text-[#0F172A] dark:text-[#E6EDF3]"
    >
      {String(value).padStart(2, "0")}
    </span>
  );
}

/* ===================== Clock ===================== */

export default function Clock() {
  const [type, setType] = useState<"Stopwatch" | "Timer">("Stopwatch");
  const [timerDuration, setTimerDuration] = useState(3600);
  const [isRunning, setIsRunning] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [pausedAt, setPausedAt] = useState<Date | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [edit, setEdit] = useState(false);
  const [tags, setTags] = useState<string | null>(null);

  const { data: session } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  useUnmountClear(pingIntervalRef);

  useUnmountClear(intervalRef);

  const displayTime =
    type === "Stopwatch"
      ? currentTime
      : Math.max(0, timerDuration - currentTime);

  const hours = Math.floor(displayTime / HOUR);
  const minutes = Math.floor((displayTime % HOUR) / MINUTE);
  const seconds = displayTime % MINUTE;

  /* ===================== Time updates ===================== */

  useEffect(() => {
    if (!isRunning || !sessionStartTime) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const update = () => {
      const now = new Date();
      const elapsed =
        Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000) +
        accumulatedTime;
      setCurrentTime(elapsed);
    };

    update();
    intervalRef.current = setInterval(update, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, sessionStartTime, accumulatedTime]);

  useEffect(() => {
    if (!isRunning || !session?.accessToken) {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      return;
    }

    // ping immediately
    pingNow();

    // then ping every 30 seconds
    pingIntervalRef.current = setInterval(() => {
      pingNow();
    }, 20_000);

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, [isRunning, session?.accessToken]);

  useEffect(() => {
    if (type === "Timer" && isRunning && currentTime >= timerDuration) {
      handleTimerComplete();
    }
  }, [currentTime, timerDuration, isRunning, type]);

  /* ===================== Backend ===================== */

  async function pingNow() {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/ping`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
  }

  async function handleStart() {
    if (isRunning) return;
    setSessionStartTime(new Date());
    setPausedAt(null);
    setIsRunning(true);
  }

  async function handleStop() {
    if (!isRunning || !sessionStartTime) return;
    const now = new Date();
    const elapsed = Math.floor(
      (now.getTime() - sessionStartTime.getTime()) / 1000
    );
    setAccumulatedTime((p) => p + elapsed);
    setPausedAt(now);
    setIsRunning(false);
    setSessionStartTime(null);
  }

  async function handleTimerComplete() {
    setIsRunning(false);
    await handleSave();
  }

  async function handleSave() {
    if (!currentTime) return;
    setIsSavingSession(true);

    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/save-focus-sesssion`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          startTime: sessionStartTime || pausedAt,
          endTime: new Date(),
          durationSec: currentTime,
          tag: tags,
          note: null,
        }),
      }
    );

    alert(
      `Congratulations! Focus session of ${Math.floor(currentTime / 60)} minutes saved 🎉`
    );

    handleReset();
    setIsSavingSession(false);
  }

  function handleReset() {
    setIsRunning(false);
    setCurrentTime(0);
    setAccumulatedTime(0);
    setSessionStartTime(null);
    setPausedAt(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  /* ===================== UI ===================== */

  return (
    <section className=" pt-30 flex flex-col items-center justify-center bg-[#F4F6F8] dark:bg-[#0F1419] px-4">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-[#0F172A] dark:text-[#E6EDF3]">
          {type}
        </h2>
      </div>

      {/* TIME DISPLAY */}
      <div
        className="flex w-full max-w-4xl items-center justify-between rounded-2xl border backdrop-blur-xl px-6 py-10"
        style={{
          borderColor: "#CBD5E1",
        }}
      >
        <TimeUnit label="Hours">
          <AnimatedDigit value={hours} />
        </TimeUnit>
        <TimeUnit label="Minutes">
          <AnimatedDigit value={minutes} />
        </TimeUnit>
        <TimeUnit label="Seconds">
          <AnimatedDigit value={seconds} />
        </TimeUnit>
      </div>

      {/* CONTROLS */}
      <div className="flex gap-4 mt-8">
        {isRunning ? (
          <button
            onClick={handleStop}
            className="px-6 py-3 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-black"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-3 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-black"
          >
            Start
          </button>
        )}

        <button
          onClick={handleReset}
          className="
    px-6 py-3 rounded-full border
    text-[#0F172A] dark:text-[#E6EDF3]
    border-[#CBD5E1] dark:border-[#334155]
  "
        >
          Reset
        </button>

        <button
          disabled={!(currentTime > 0 && !isRunning && !isSavingSession)}
          onClick={handleSave}
          className="
    px-6 py-3 rounded-full border
    text-[#0F172A] dark:text-[#E6EDF3]
    border-[#CBD5E1] dark:border-[#334155]
  "
        >
          {isSavingSession ? "Saving…" : "Save"}
        </button>

        <button
          onClick={() => setEdit(true)}
          className="
    px-6 py-3 rounded-full border
    text-[#0F172A] dark:text-[#E6EDF3]
    border-[#CBD5E1] dark:border-[#334155]
  "
        >
          Edit
        </button>
      </div>

      {/* EDIT MODAL */}
      {edit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white dark:bg-[#151B22] text-[#0F172A] dark:text-[#E6EDF3] rounded-2xl p-6 w-80">
            <div className="flex justify-between mb-4">
              <button
                onClick={() => setType("Stopwatch")}
                className={`px-3 py-1 rounded-full ${
                  type === "Stopwatch"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : ""
                }`}
              >
                Stopwatch
              </button>
              <button
                onClick={() => setType("Timer")}
                className={`px-3 py-1 rounded-full ${
                  type === "Timer"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : ""
                }`}
              >
                Timer
              </button>
            </div>

            {type === "Timer" && (
              <input
                type="number"
                placeholder="Minutes"
                className="w-full mb-4 p-2 rounded border"
                onChange={(e) => setTimerDuration(Number(e.target.value) * 60)}
              />
            )}

            <input
              type="text"
              placeholder="Session tag"
              value={tags || ""}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-2 rounded border"
            />

            <button
              onClick={() => setEdit(false)}
              className="mt-4 w-full py-2 rounded-full border"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ===================== Unit ===================== */

function TimeUnit({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center">
      {children}
      <span className="mt-2 text-sm text-[#64748B] dark:text-[#9FB0C0]">
        {label}
      </span>
      <div className="mt-4 h-px w-full bg-[#CBD5E1] dark:bg-[#334155]" />
    </div>
  );
}
