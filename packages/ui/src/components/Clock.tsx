"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../button";
import { useSession } from "next-auth/react";

// localStorage key for persisting focus session data across page refreshes
const PENDING_SESSION_KEY = "pending_focus_session";

/**
 * Custom hook to clear intervals on component unmount
 * Prevents memory leaks by ensuring intervals are cleaned up
 */
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

const Clock = () => {
  // ========================================
  // UI-ONLY STATES
  // These don't need to be refs because they don't affect timer continuity
  // ========================================
  const [edit, setEdit] = useState(false); // Controls edit modal visibility
  const [isSavingSession, setisSavingSession] = useState(false); // Shows saving status
  const [showRecoveryModal, setShowRecoveryModal] = useState(false); // Shows on page load if pending session exists
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false); // Shows when user clicks reset with active time
  
  /**
   * Force re-render mechanism for refs
   * Since refs don't trigger re-renders, we need this to update the UI
   * when ref values change. We use an empty object that changes on each call.
   */
  const [, forceUpdate] = useState({});
  const rerender = () => forceUpdate({});

  const { data: session } = useSession(); // NextAuth session for API calls

  // ========================================
  // TIMER STATE REFS
  // Using refs instead of state so timer continues running even after page refresh
  // Refs persist their values and don't cause re-renders when updated
  // ========================================
  const typeRef = useRef("Stopwatch"); // "Stopwatch" or "Timer" mode
  const timerDurationRef = useRef(3600); // Target duration for timer mode (in seconds)
  const isRunningRef = useRef(false); // Whether timer is currently running
  const sessionStartTimeRef = useRef<Date | null>(null); // When current session started (null if paused)
  const pausedAtRef = useRef<Date | null>(null); // When session was paused
  const accumulatedTimeRef = useRef(0); // Total seconds accumulated before current run/pause
  const tagsRef = useRef<string | null>(null); // User-defined tag for the session

  // ========================================
  // UTILITY REFS
  // ========================================
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // For heartbeat interval
  const displayIntervalRef = useRef<NodeJS.Timeout | null>(null); // For updating display every 100ms
  const hasPersistedRef = useRef(false); // Prevents duplicate persistence on page unload
  const hasLoadedRef = useRef(false); // Ensures session loads only once on mount

  // Clean up intervals on unmount
  useUnmountClear(intervalRef);
  useUnmountClear(displayIntervalRef);

  /**
   * CORE FUNCTION: Calculate current elapsed time dynamically
   * 
   * How it works:
   * 1. If timer is NOT running: return accumulated time from previous runs
   * 2. If timer IS running: calculate time since sessionStartTime + accumulated time
   * 
   * This allows the timer to show correct time even after page refresh,
   * because we recalculate from the stored sessionStartTime
   */
  const getCurrentTime = () => {
    // If not running, just return what we've accumulated so far
    if (!isRunningRef.current || !sessionStartTimeRef.current) {
      return accumulatedTimeRef.current;
    }

    // Timer is running: calculate elapsed time since start
    const now = new Date();
    const elapsedMs = now.getTime() - sessionStartTimeRef.current.getTime();
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    
    // Total time = previously accumulated + current run time
    return accumulatedTimeRef.current + elapsedSeconds;
  };

  /**
   * Calculate display values for the UI
   * For Stopwatch: show elapsed time
   * For Timer: show remaining time (duration - elapsed)
   */
  const currentTime = getCurrentTime();
  const displayTime =
    typeRef.current === "Stopwatch"
      ? currentTime
      : Math.max(0, timerDurationRef.current - currentTime);
  const hours = Math.floor(displayTime / 3600);
  const minutes = Math.floor((displayTime % 3600) / 60);
  const seconds = displayTime % 60;

  /**
   * PERSISTENCE FUNCTION: Save current session state to localStorage
   * 
   * Why we persist:
   * - User closes tab/browser
   * - Page refreshes
   * - Browser crashes
   * 
   * What we save:
   * - All timer settings (type, duration, tags)
   * - Current running state
   * - Time data (start time, accumulated time)
   * - Timestamp of last save
   */
  const persistPendingSession = () => {
    // Don't save if there's no session data
    if (!sessionStartTimeRef.current && accumulatedTimeRef.current === 0) return;

    const dataToSave = {
      type: typeRef.current,
      timerDuration: timerDurationRef.current,
      isRunning: isRunningRef.current,
      // Convert Date objects to ISO strings for JSON serialization
      sessionStartTime: sessionStartTimeRef.current?.toISOString() || null,
      pausedAt: pausedAtRef.current?.toISOString() || null,
      accumulatedTime: accumulatedTimeRef.current,
      tags: tagsRef.current,
      lastSeen: Date.now(), // When this was last persisted
    };

    localStorage.setItem(PENDING_SESSION_KEY, JSON.stringify(dataToSave));
  };

  /**
   * EFFECT: Load persisted session on component mount
   * 
   * Flow:
   * 1. Check if already loaded (prevent double-loading in React StrictMode)
   * 2. Try to load from localStorage
   * 3. Restore all ref values from saved data
   * 4. Show recovery modal if there's a pending session
   * 5. If timer was running, restart the display interval
   */
  useEffect(() => {
    // Prevent loading twice in development (React StrictMode)
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const saved = localStorage.getItem(PENDING_SESSION_KEY);
    if (!saved) return;

    try {
      const data = JSON.parse(saved);

      // Restore all timer state from localStorage
      typeRef.current = data.type || "Stopwatch";
      timerDurationRef.current = data.timerDuration || 3600;
      isRunningRef.current = data.isRunning || false;
      
      // Convert ISO strings back to Date objects
      sessionStartTimeRef.current = data.sessionStartTime
        ? new Date(data.sessionStartTime)
        : null;
      pausedAtRef.current = data.pausedAt ? new Date(data.pausedAt) : null;
      
      accumulatedTimeRef.current = data.accumulatedTime || 0;
      tagsRef.current = data.tags || null;

      // Force UI to show loaded data
      rerender();

      // Show recovery modal if there's any time recorded
      if (accumulatedTimeRef.current > 0 || sessionStartTimeRef.current) {
        setShowRecoveryModal(true);
      }

      // If timer was running when page closed, resume it
      if (isRunningRef.current && sessionStartTimeRef.current) {
        // Use setTimeout to ensure state is rendered first, then start interval
        setTimeout(() => {
          startDisplayInterval();
        }, 0);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    }
  }, []);

  /**
   * EFFECT: Auto-save session when page is about to close or hide
   * 
   * Two events we listen for:
   * 1. visibilitychange: When user switches tabs or minimizes browser
   * 2. beforeunload: When user closes tab/browser or refreshes page
   * 
   * Why hasPersistedRef:
   * Both events can fire together (e.g., closing tab), so we use a flag
   * to ensure we only persist once per close action
   */
  useEffect(() => {
    const persistOnce = () => {
      if (hasPersistedRef.current) return; // Already persisted, skip
      hasPersistedRef.current = true;
      persistPendingSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Page is hidden (tab switched, minimized, etc.)
        persistOnce();
      } else {
        // Page is visible again, reset the flag
        hasPersistedRef.current = false;
      }
    };

    const handleBeforeUnload = () => {
      // Page is about to close/refresh
      persistOnce();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  /**
   * EFFECT: Periodic persistence while timer is running
   * 
   * Why every 5 seconds:
   * - Ensures recent data is saved if browser crashes
   * - Not too frequent (would be wasteful)
   * - Not too infrequent (could lose several minutes of data)
   */
  useEffect(() => {
    if (!isRunningRef.current) return;

    const persistInterval = setInterval(() => {
      persistPendingSession();
    }, 5000);

    return () => clearInterval(persistInterval);
  }, [isRunningRef.current]);

  /**
   * Start the display update interval
   * 
   * Updates UI every 100ms for smooth timer display
   * Also checks if Timer mode has completed
   */
  const startDisplayInterval = () => {
    // Clear any existing interval first
    if (displayIntervalRef.current) {
      clearInterval(displayIntervalRef.current);
    }
    setSessionStartTime(new Date());
    setPausedAt(null);
    setIsRunning(true);
    await updateFocusingStatus(true);
  }

    displayIntervalRef.current = setInterval(() => {
      // Check if Timer mode has reached its target duration
      if (
        typeRef.current === "Timer" &&
        isRunningRef.current &&
        getCurrentTime() >= timerDurationRef.current
      ) {
        handleTimerComplete();
      }

      // Trigger UI re-render to show updated time
      rerender();
    }, 100);
  };

  /**
   * Stop the display update interval
   * Called when timer is paused or stopped
   */
  const stopDisplayInterval = () => {
    if (displayIntervalRef.current) {
      clearInterval(displayIntervalRef.current);
      displayIntervalRef.current = null;
    }
  };

  /**
   * HANDLER: Start the focus session
   * 
   * Flow:
   * 1. If there's accumulated time from previous session, show recovery modal
   * 2. Otherwise, start new session:
   *    - Set start time to now
   *    - Mark as running
   *    - Start display interval
   *    - Persist to localStorage
   */
  async function handleStartFocusingClick() {
    // If there's leftover time from previous session, ask user what to do
    if (!isRunningRef.current && accumulatedTimeRef.current > 0) {
      setShowRecoveryModal(true);
      return;
    }
  }

    // Start new session
    if (!isRunningRef.current) {
      const now = new Date();
      sessionStartTimeRef.current = now;
      pausedAtRef.current = null;
      isRunningRef.current = true;

      startDisplayInterval(); // Start updating display
      persistPendingSession(); // Save to localStorage
      rerender(); // Update UI
    }
  }

  /**
   * HANDLER: Pause/Stop the focus session
   * 
   * Flow:
   * 1. Calculate elapsed time since session started
   * 2. Add to accumulated time
   * 3. Clear session start time (marks as paused)
   * 4. Stop display updates
   * 5. Persist state
   */
  async function handleStopFocusingClick() {
    if (isRunningRef.current && sessionStartTimeRef.current) {
      const now = new Date();
      pausedAtRef.current = now;

      // Calculate time elapsed in this run
      const elapsedMs = now.getTime() - sessionStartTimeRef.current.getTime();
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      
      // Add to accumulated time
      accumulatedTimeRef.current = accumulatedTimeRef.current + elapsedSeconds;

      // Mark as not running
      isRunningRef.current = false;
      sessionStartTimeRef.current = null;

      stopDisplayInterval(); // Stop UI updates
      persistPendingSession(); // Save state
      rerender(); // Update UI
    }
  }

  /**
   * HANDLER: Timer mode has completed
   * 
   * Called automatically when timer reaches target duration
   * Stops the timer and auto-saves the session
   */
  async function handleTimerComplete() {
    isRunningRef.current = false;
    stopDisplayInterval();

    // Automatically save the completed session
    await handleSaveSessionClick();
  }

  /**
   * HANDLER: Save the focus session to backend
   * 
   * Flow:
   * 1. Get final time
   * 2. Prepare payload with session data
   * 3. Send POST request to backend
   * 4. On success: clear localStorage, reset timer, show success message
   * 5. On failure: log error, keep data (user can try again)
   */
  async function handleSaveSessionClick() {
    const finalTime = getCurrentTime();
    if (finalTime === 0) return; // Nothing to save

    setisSavingSession(true);

    // Prepare data for backend
    const payload = {
      startTime: sessionStartTimeRef.current || pausedAtRef.current,
      endTime: new Date(),
      durationSec: finalTime,
      tag: tagsRef.current,
      note: null,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/save-focus-sesssion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        console.log("unable to save focus session");
        setisSavingSession(false);
        return;
      }

      const res = await response.json();
      console.log("focus session saved successfully...", res.data.focusSession);

      alert(
        `Congratulations, focus duration of ${Math.floor(finalTime / 60)} minutes saved!`
      );

      // Clear saved session from localStorage
      localStorage.removeItem(PENDING_SESSION_KEY);
      setShowRecoveryModal(false);

      // Reset timer completely
      performReset();

      setisSavingSession(false);
      return true;
    } catch (error) {
      console.log("unable to save focus session, got an error: " + error);
      setisSavingSession(false);
      return;
    }
  }

  /**
   * HANDLER: Reset button clicked
   * 
   * If there's time recorded, show confirmation modal (save or discard?)
   * If no time recorded, just reset immediately
   */
  function handleReset() {
    const currentTimeValue = getCurrentTime();
    
    // If there's time recorded, ask user what to do with it
    if (currentTimeValue > 0) {
      setShowResetConfirmModal(true);
      return;
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

    // No time recorded, just reset
    performReset();
  }

  /**
   * UTILITY: Actually perform the reset
   * 
   * Clears all timer data and removes from localStorage
   * Called after user confirms in modal or if no time recorded
   */
  function performReset() {
    isRunningRef.current = false;
    accumulatedTimeRef.current = 0;
    sessionStartTimeRef.current = null;
    pausedAtRef.current = null;

    stopDisplayInterval();
    localStorage.removeItem(PENDING_SESSION_KEY);
    rerender();
  }

  /**
   * EFFECT: Send heartbeat to server while focusing
   * 
   * Why:
   * - Lets server know user is actively focusing
   * - Can be used for real-time status, analytics, etc.
   * 
   * Sends immediately when focusing starts, then every 30 seconds
   */
  useEffect(() => {
    if (!isRunningRef.current || !session?.accessToken) return;

    const sendHeartbeat = () => {
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/focusing/heartbeat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      ).catch(() => {}); // Silently fail if network error
    };

    sendHeartbeat(); // Send immediately
    const intervalId = setInterval(sendHeartbeat, 30_000); // Then every 30s

    return () => clearInterval(intervalId);
  }, [isRunningRef.current, session?.accessToken]);

  return (
    <div className="min-h-screen flex justify-center bg-white dark:bg-[#232630]">
      <div className="flex-col">
        <div className="md:w-100 md:h-100 w-80 h-80 rounded-full bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white flex items-center justify-center shadow-2xl border-2 border-gray-300 dark:border-zinc-800 mt-10 m-8">
          <div className="flex-col justify-between">
            <div className="flex justify-center items-center md:mb-20 mb-15 font-bold text-lg">
              {typeRef.current}
            </div>
            <div className="flex justify-around text-7xl font-bold">
              <div>{hours > 9 ? `${hours}` : `0${hours}`}</div>
              <div>:</div>
              <div>{minutes > 9 ? `${minutes}` : `0${minutes}`}</div>
              <div>:</div>
              <div>{seconds > 9 ? `${seconds}` : `0${seconds}`}</div>
            </div>

            <div className="flex justify-center">
              <div
                className="flex justify-center items-center md:mt-20 mt-15 ml-4 font-bold cursor-pointer p-2 px-4 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-2xl transition-colors"
                onClick={() => setEdit(true)}
              >
                Edit🛠️
              </div>

              {edit && (
                <div className="absolute top-50 min-h-100 w-100 rounded-2xl z-50 bg-gray-100 dark:bg-zinc-900 shadow-2xl border border-gray-200 dark:border-zinc-800">
                  <div className="flex p-4 pl-2 justify-around font-bold">
                    <div
                      className={`rounded-2xl cursor-pointer transition-all ${typeRef.current == "Stopwatch" ? "p-4 bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg" : "pt-4 text-gray-900 dark:text-white"}`}
                      onClick={() => {
                        typeRef.current = "Stopwatch";
                        persistPendingSession();
                        rerender();
                      }}
                    >
                      Stopwatch
                    </div>
                    <div
                      className={`rounded-2xl cursor-pointer transition-all ${typeRef.current == "Timer" ? "p-4 bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg" : "pt-4 text-gray-900 dark:text-white"}`}
                      onClick={() => {
                        typeRef.current = "Timer";
                        persistPendingSession();
                        rerender();
                      }}
                    >
                      Timer
                    </div>
                  </div>

                  <div>
                    {typeRef.current == "Stopwatch" ? (
                      <div className="p-6 flex justify-center text-gray-900 dark:text-white">
                        <p>
                          To save session, you can stop focusing and click on
                          save session
                        </p>
                      </div>
                    ) : (
                      <div className="flex-col">
                        <div className="flex-col justify-center gap-4 m-4">
                          <div className="font-bold p-2 text-gray-900 dark:text-white">
                            <h1>Set Timer</h1>
                          </div>
                          <div>
                            <input
                              type="number"
                              placeholder="30 minutes"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700
                                                                focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white
                                                                bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                if (v < 0.1) {
                                  timerDurationRef.current = 0;
                                  return;
                                }
                                timerDurationRef.current = v * 60;
                                persistPendingSession();
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="m-4">
                      <h1 className="m-2 text-gray-900 dark:text-white font-medium">
                        Add tag to session:
                      </h1>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700
                                                    focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white
                                                    bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                        placeholder="College Study"
                        value={tagsRef.current || ""}
                        onChange={(e) => {
                          tagsRef.current = e.target.value;
                          persistPendingSession();
                          rerender();
                        }}
                      />
                    </div>

                    <div className="flex justify-center items-center">
                      <p
                        className="font-bold border-gray-900 dark:border-white border-2 m-4 w-10 h-10 cursor-pointer text-2xl rounded-full flex justify-center items-center bg-gray-900 dark:bg-white text-white dark:text-black transition-transform duration-200 hover:scale-105"
                        onClick={() => setEdit(false)}
                      >
                        X
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div
                className="flex justify-center items-center md:mt-20 mt-12 ml-4 font-bold cursor-pointer text-3xl hover:scale-110 transition-transform"
                onClick={handleReset}
              >
                🔄️
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-around gap-4">
          <div className="flex justify-center">
            {isRunningRef.current ? (
              <button
                onClick={handleStopFocusingClick}
                className="bg-gray-900 dark:bg-white text-white dark:text-black font-bold p-4 rounded-2xl mt-4 fade-slide-up cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Stop Focusing
              </button>
            ) : (
              <button
                onClick={handleStartFocusingClick}
                className="bg-gray-900 dark:bg-white text-white dark:text-black font-bold p-4 rounded-2xl mt-4 fade-slide-up cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Start Focusing
              </button>
            )}
          </div>

          <button
            className="
                            bg-gray-900 dark:bg-white text-white dark:text-black font-bold p-4 rounded-2xl mt-4 fade-slide-up
                            hover:bg-gray-800 dark:hover:bg-gray-100
                            disabled:opacity-40
                            disabled:bg-gray-500 dark:disabled:bg-gray-400
                            disabled:cursor-not-allowed 
                            disabled:hover:bg-gray-500 dark:disabled:hover:bg-gray-400
                            cursor-pointer
                            transition-colors
                        "
            disabled={
              !(currentTime > 0 && !isRunningRef.current && !isSavingSession)
            }
            onClick={() => {
              handleSaveSessionClick();
            }}
          >
            {isSavingSession ? "saving session" : "save session"}
          </button>
        </div>
      </div>

      {showRecoveryModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 pointer-events-auto">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl w-96 shadow-xl">
            <h2 className="font-bold text-lg mb-2">
              Unfinished focus session found
            </h2>

            <p className="mb-4 text-gray-900 dark:text-white">
              You have an unfinished session ({Math.floor(currentTime / 60)}{" "}
              min). Would you like to continue or discard it?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  performReset();
                  setShowRecoveryModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600 transition-colors"
              >
                Discard
              </button>

              <button
                onClick={() => {
                  setShowRecoveryModal(false);
                  if (sessionStartTimeRef.current) {
                    isRunningRef.current = true;
                    startDisplayInterval();
                    rerender();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 pointer-events-auto">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl w-96 shadow-xl">
            <h2 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
              Reset Timer
            </h2>

            <p className="mb-4 text-gray-900 dark:text-white">
              You have {Math.floor(currentTime / 60)} minutes recorded. Do you
              want to save this session or discard it?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowResetConfirmModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  performReset();
                  setShowResetConfirmModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Discard
              </button>

              <button
                onClick={async () => {
                  setShowResetConfirmModal(false);
                  await handleSaveSessionClick();
                }}
                className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Save Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clock;
