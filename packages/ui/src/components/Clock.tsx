"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAnimate } from "framer-motion";
import { useSession } from "next-auth/react";

// Extend the Window interface to include custom storage API
// This tells TypeScript about window.storage
// Without this, TypeScript would show error: "Property 'storage' does not exist"
declare global {
  interface Window {
    storage: {
      // Get a value from storage by key
      get: (
        key: string,
        shared?: boolean
      ) => Promise<{ key: string; value: string; shared: boolean } | null>;
      // Save a value to storage
      set: (
        key: string,
        value: string,
        shared?: boolean
      ) => Promise<{ key: string; value: string; shared: boolean } | null>;
      // Delete a value from storage
      delete: (
        key: string,
        shared?: boolean
      ) => Promise<{ key: string; deleted: boolean; shared: boolean } | null>;
      // List all keys with optional prefix filter
      list: (
        prefix?: string,
        shared?: boolean
      ) => Promise<{ keys: string[]; prefix?: string; shared: boolean } | null>;
    };
  }
}

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
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagMessage, setTagMessage] = useState<string | null>(null);
  const [realStartTime, setRealStartTime] = useState<Date | null>(null);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [storedSession, setStoredSession] = useState<any>(null);
  const [creatingTag, setCreatingTag] = useState(false);
  const [newtag, setnewtag] = useState("");

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
    if (!isRunning || !session?.accessToken) return;

    const handleVisibilityChange = () => {
      pingNow();
    };

    // immediate ping on start
    pingNow();

    pingIntervalRef.current = setInterval(() => {
      pingNow();
    }, 60_000);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, session?.accessToken]);

  useEffect(() => {
    if (type === "Timer" && isRunning && currentTime >= timerDuration) {
      handleTimerComplete();
    }
  }, [currentTime, timerDuration, isRunning, type]);

  useEffect(() => {
    const checkForStoredSession = async () => {
      const stored = await loadStoredState();

      if (stored) {
        // Only show restore modal if session is more than 1 minute (60 seconds)
        if (stored.currentTime > 60) {
          setStoredSession(stored);
          setShowRestoreModal(true);
        } else {
          // Session is too short (less than 1 minute) - auto-discard
          await clearStoredState();
        }
      }
    };

    checkForStoredSession();
  }, []);

  useEffect(() => {
    // Debounce timer
    const timeoutId = setTimeout(() => {
      saveStateToStorage();
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [
    type,
    timerDuration,
    isRunning,
    sessionStartTime,
    pausedAt,
    accumulatedTime,
    currentTime,
    selectedTag,
  ]);

  // Separate effect for frequent saves when running
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      saveStateToStorage();
    }, 10000); // Save every 10 seconds when running

    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveStateToStorage();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    type,
    timerDuration,
    isRunning,
    sessionStartTime,
    pausedAt,
    accumulatedTime,
    currentTime,
    selectedTag,
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab just went to background - save immediately
        saveStateToStorage();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    type,
    timerDuration,
    isRunning,
    sessionStartTime,
    pausedAt,
    accumulatedTime,
    currentTime,
    selectedTag,
  ]);

  /* ===================== Backend ===================== */

  async function updateFocusingStatus(isFocusing: boolean) {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/focusing`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      },
      body: JSON.stringify({ isFocusing }),
    });
  }

  async function pingNow() {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/ping`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
  }

  async function saveStateToStorage() {
    try {
      const state = {
        type,
        timerDuration,
        isRunning,
        realStartTime: realStartTime?.toISOString() || null,
        sessionStartTime: sessionStartTime?.toISOString() || null,
        pausedAt: pausedAt?.toISOString() || null,
        accumulatedTime,
        currentTime,
        selectedTag,
      };

      /*
      🧠 Why ISO?

        survives reload

        timezone-safe

        backend-safe
              */

      // Use localStorage instead of window.storage
      localStorage.setItem("focus-clock-state", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  }

  /**
   * Clears the stored session data from storage
   */
  async function clearStoredState() {
    try {
      localStorage.removeItem("focus-clock-state");
    } catch (error) {
      console.error("Failed to clear state:", error);
    }
  }

  /**
   * Loads previously stored session data from storage
   * Returns null if no stored data exists or if parsing fails
   */
  async function loadStoredState() {
    try {
      const storedData = localStorage.getItem("focus-clock-state");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        return parsed;
      }
    } catch (error) {
      console.error("Failed to load state:", error);
    }
    return null;
  }

  async function handleStart() {
    if (isRunning) return;
    if (!realStartTime) {
      setRealStartTime(new Date());
    }
    setSessionStartTime(new Date());
    setPausedAt(null);
    setIsRunning(true);
    await updateFocusingStatus(true);
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
    await updateFocusingStatus(false);
  }

  async function handleTimerComplete() {
    setIsRunning(false);
    await updateFocusingStatus(false);
    await handleSave();
  }

  async function handleSave() {
    if (!currentTime || !realStartTime) return;
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
          startTime: realStartTime,
          endTime: new Date(),
          durationSec: currentTime,
          tag: selectedTag,
          note: null,
        }),
      }
    );

    alert(
      `Congratulations! Focus session of ${Math.floor(currentTime / 60)} minutes saved 🎉`
    );

    handleReset();
    await clearStoredState();
    setIsSavingSession(false);
  }

  async function handleReset() {
    setIsRunning(false);
    setCurrentTime(0);
    setAccumulatedTime(0);
    setSessionStartTime(null);
    setPausedAt(null);
    updateFocusingStatus(false);
    setRealStartTime(null);
    await clearStoredState();
    if (intervalRef.current) clearInterval(intervalRef.current);
  }
  async function handleCreateTag() {
    if (!newtag.trim() || isCreatingTag) return;

    setIsCreatingTag(true);
    setTagMessage(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/create-tag`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ tag: newtag.trim() }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to create tag");
      }

      setAvailableTags((prev) => [...prev, newtag.trim()]);
      setSelectedTag(newtag.trim());
      setTagMessage("Tag created successfully ✓");
      setnewtag("");
      //setCreatingTag(false);
    } catch (e) {
      console.error(e);
      setTagMessage("Failed to create tag. Try again.");
    } finally {
      setIsCreatingTag(false);
    }
  }

  function handleResumeSession() {
    if (!storedSession) return;

    setType(storedSession.type);
    setTimerDuration(storedSession.timerDuration);
    setIsRunning(false); // Always pause
    setSessionStartTime(null); // Clear start time
    setPausedAt(
      storedSession.pausedAt ? new Date(storedSession.pausedAt) : null
    );
    setAccumulatedTime(storedSession.currentTime);
    setCurrentTime(storedSession.currentTime);
    setSelectedTag(storedSession.selectedTag);

    setShowRestoreModal(false);
    setStoredSession(null);
    setRealStartTime(
      storedSession.realStartTime ? new Date(storedSession.realStartTime) : null
    );
  }

  async function handleSavePreviousSession() {
    if (!storedSession) return;

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
          startTime: new Date(storedSession.realStartTime),
          endTime: new Date(storedSession.pausedAt || Date.now()),
          durationSec: storedSession.currentTime,
          tag: storedSession.selectedTag,
          note: null,
        }),
      }
    );

    alert(
      `Previous session of ${Math.floor(storedSession.currentTime / 60)} minutes saved 🎉`
    );

    await clearStoredState();
    setShowRestoreModal(false);
    setStoredSession(null);
    setIsSavingSession(false);
  }

  async function handleDiscardSession() {
    await clearStoredState();
    setShowRestoreModal(false);
    setStoredSession(null);
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
            className="px-6 py-3 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-black transition-all duration-300 ease-out
    hover:-translate-y-0.5
    hover:shadow-lg hover:dark:shadow-slate-900/30 hover:shadow-[#E6EDF3] hover:dark:shadow-sm cursor-pointer"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-3 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-black transition-all duration-300 ease-out
    hover:-translate-y-0.5
    hover:shadow-lg hover:dark:shadow-slate-900/30 hover:shadow-[#E6EDF3] hover:dark:shadow-sm cursor-pointer"
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
    transition-all duration-300 ease-out
    hover:-translate-y-0.5
    hover:shadow-lg hover:shadow-slate-900/30 hover:dark:shadow-[#E6EDF3] hover:dark:shadow-sm cursor-pointer
  "
        >
          Reset
        </button>

        <button
          disabled={!(currentTime > 0 && !isRunning && !isSavingSession)}
          onClick={handleSave}
          className={`
    px-6 py-3 rounded-full border
    transition-all duration-300 ease-out
    ${
      currentTime > 0 && !isRunning && !isSavingSession
        ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
        : "opacity-40 cursor-not-allowed"
    }
    text-[#0F172A] dark:text-[#E6EDF3]
    border-[#CBD5E1] dark:border-[#334155]
  `}
        >
          {isSavingSession ? "Saving…" : "Save"}
        </button>

        <button
          onClick={() => setEdit(true)}
          className="
    px-6 py-3 rounded-full border
    text-[#0F172A] dark:text-[#E6EDF3]
    border-[#CBD5E1] dark:border-[#334155]
    transition-all duration-300 ease-out
    hover:-translate-y-0.5
    hover:shadow-lg hover:shadow-slate-900/30 hover:dark:shadow-[#E6EDF3] hover:dark:shadow-sm cursor-pointer
  "
        >
          Edit
        </button>
      </div>

      {/* RESTORE SESSION MODAL */}
      {showRestoreModal && storedSession && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white dark:bg-[#151B22] text-[#0F172A] dark:text-[#E6EDF3] rounded-2xl p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">
              Previous Session Found
            </h3>

            <div className="mb-6 p-4 rounded-lg bg-[#F4F6F8] dark:bg-[#0F1419]">
              <p className="mb-2">
                <span className="font-semibold">Type:</span>{" "}
                {storedSession.type}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Duration:</span>{" "}
                {Math.floor(storedSession.currentTime / 60)} minutes
              </p>
              {storedSession.tags && (
                <p className="mb-2">
                  <span className="font-semibold">Tag:</span>{" "}
                  {storedSession.tags}
                </p>
              )}
              <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
                {storedSession.isRunning
                  ? "Session was running"
                  : "Session was paused"}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleResumeSession}
                className="w-full py-3 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-black font-semibold"
              >
                Resume Session
              </button>

              <button
                onClick={handleSavePreviousSession}
                disabled={isSavingSession}
                className="w-full py-3 rounded-full border border-[#CBD5E1] dark:border-[#334155]"
              >
                {isSavingSession ? "Saving..." : "Save & Start Fresh"}
              </button>

              <button
                onClick={handleDiscardSession}
                className="w-full py-3 rounded-full border border-[#CBD5E1] dark:border-[#334155] text-red-600 dark:text-red-400"
              >
                Discard Session
              </button>
            </div>
          </div>
        </div>
      )}

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

            {creatingTag ? (
              <div>
                <input
                  onChange={(e) => setnewtag(e.target.value)}
                  placeholder="create tag"
                  type="text"
                  className="w-full   p-2 text-white rounded-2xl mt-2"
                />
                <button
                  onClick={handleCreateTag}
                  disabled={isCreatingTag}
                  className={`
                        w-full p-2 rounded-2xl my-4
                        transition
                        ${
                          isCreatingTag
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:opacity-90"
                        }
                        bg-[#0F172A] dark:bg-white
                        text-white dark:text-black
                      `}
                >
                  {isCreatingTag ? "Creating…" : "Create tag"}
                </button>
                {tagMessage && (
                  <p
                    className={`text-sm text-center mt-2 ${
                      tagMessage.includes("success")
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {tagMessage}
                  </p>
                )}
              </div>
            ) : (
              <select
                onChange={(e) => {
                  if (e.target.value == "create") {
                    setCreatingTag(true);
                  } else {
                    setSelectedTag(e.target.value);
                  }
                }}
                defaultValue=""
                className="
                    w-full mb-4 px-4 py-2.5
                    rounded-xl
                    text-sm
                    border
                    transition
                    bg-transparent
                    text-[#0F172A] dark:text-[#E6EDF3] 
                  "
              >
                <option value="" disabled>
                  Select a tag
                </option>

                {availableTags.map((tag) => (
                  <option
                    className="text-[#0F172A] dark:text-[#E6EDF3]"
                    key={tag}
                    value={tag}
                  >
                    {tag}
                  </option>
                ))}

                <option onSelect={() => setCreatingTag(true)} value="create">
                  Create a new tag
                </option>
              </select>
            )}

            <button
              onClick={() => {
                setEdit(false);
                setCreatingTag(false);
                setTagMessage("");
              }}
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
