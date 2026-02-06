"use client";

import { useEffect, useRef, useState } from "react";

const HOUR = 3600;
const MINUTE = 60;

export type ClockType = "Stopwatch" | "Timer";

export function useClockEngine() {
  const [type, setType] = useState<ClockType>("Stopwatch");
  const [timerDuration, setTimerDuration] = useState(3600);

  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ================= TIME UPDATE =================

  useEffect(() => {
    if (!isRunning || !sessionStartTime) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, sessionStartTime, accumulatedTime]);

  // ================= ACTIONS =================

  function start() {
    if (isRunning) return;
    setSessionStartTime(new Date());
    setIsRunning(true);
  }

  function stop() {
    if (!isRunning || !sessionStartTime) return;

    const now = new Date();
    const elapsed = Math.floor(
      (now.getTime() - sessionStartTime.getTime()) / 1000
    );

    setAccumulatedTime((p) => p + elapsed);
    setSessionStartTime(null);
    setIsRunning(false);
  }

  // ✅ NEW: hydration API (Option A)
  function hydrate(elapsedSeconds: number) {
    setCurrentTime(elapsedSeconds);
    setAccumulatedTime(elapsedSeconds);
    setSessionStartTime(null);
    setIsRunning(false);
  }

  function reset() {
    setIsRunning(false);
    setCurrentTime(0);
    setAccumulatedTime(0);
    setSessionStartTime(null);
  }

  // ================= DERIVED =================

  const displayTime =
    type === "Stopwatch"
      ? currentTime
      : Math.max(0, timerDuration - currentTime);

  const hours = Math.floor(displayTime / HOUR);
  const minutes = Math.floor((displayTime % HOUR) / MINUTE);
  const seconds = displayTime % MINUTE;

  return {
    // mode
    type,
    setType,
    timerDuration,
    setTimerDuration,

    // state
    isRunning,
    currentTime,

    // derived
    hours,
    minutes,
    seconds,

    // actions
    start,
    stop,
    reset,
    hydrate
  };
}
