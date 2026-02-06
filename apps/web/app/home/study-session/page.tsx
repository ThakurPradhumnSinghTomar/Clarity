"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useClockEngine } from "@/lib/hooks/study-session/useClockEngine";
import { useClockPersistence } from "@/lib/hooks/study-session/useClockPersistence";
import {
  ControlButtons,
  EditSessionModal,
  RestoreSessionModal,
  TimeDisplay,
} from "@repo/ui";

function Clock() {
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [edit, setEdit] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagMessage, setTagMessage] = useState<string | null>(null);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [storedSession, setStoredSession] = useState<any>(null);
  const [creatingTag, setCreatingTag] = useState(false);
  const [newtag, setnewtag] = useState("");
  const clockStorage = useClockPersistence();

  const { data: session } = useSession();
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    type,
    setType,
    timerDuration,
    setTimerDuration,
    isRunning,
    currentTime,
    hours,
    minutes,
    seconds,
    start,
    stop,
    reset,
    hydrate,
  } = useClockEngine();

  useEffect(() => {
    if (!currentTime && !isRunning) return;

    clockStorage.save({
      type,
      timerDuration,
      isRunning,
      currentTime,
      selectedTag,
    });
  }, [type, timerDuration, isRunning, currentTime, selectedTag]);

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
          },
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
    const stored = clockStorage.load();

    if (!stored) return;

    if (stored.currentTime > 60) {
      setStoredSession(stored);
      setShowRestoreModal(true);
    } else {
      clockStorage.clear();
    }
  }, []);

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

  async function handleSave() {
    if (!currentTime) return;

    setIsSavingSession(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/save-focus-sesssion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            startTime: new Date(Date.now() - currentTime * 1000),
            endTime: new Date(),
            durationSec: currentTime,
            tag: selectedTag,
            note: null,
          }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to save focus session");
      }

      alert(
        `Congratulations! Focus session of ${Math.floor(currentTime / 60)} minutes saved 🎉`,
      );

      reset();
      clockStorage.clear();
    } catch (err: any) {
      console.error("Save session error:", err);
      alert(
        err?.message ||
          "Something went wrong while saving your session. Try again.",
      );
    } finally {
      setIsSavingSession(false);
    }
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
        },
      );

      if (!res.ok) {
        throw new Error("Failed to create tag");
      }

      setAvailableTags((prev) => [...prev, newtag.trim()]);
      setSelectedTag(newtag.trim());
      setTagMessage("Tag created successfully ✓");
      setnewtag("");
    } catch (e) {
      console.error(e);
      setTagMessage("Failed to create tag. Try again.");
    } finally {
      setIsCreatingTag(false);
    }
  }

  function handleTimerComplete() {
    stop();
    handleSave();
  }

  function handleResumeSession() {
    if (!storedSession) return;

    setType(storedSession.type);
    setTimerDuration(storedSession.timerDuration);

    hydrate(storedSession.currentTime);
    setSelectedTag(storedSession.selectedTag ?? null);

    setShowRestoreModal(false);
    setStoredSession(null);
    updateFocusingStatus(true);
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
          startTime: new Date(Date.now() - storedSession.currentTime * 1000),
          endTime: new Date(),
          durationSec: storedSession.currentTime,
          tag: storedSession.selectedTag,
          note: null,
        }),
      },
    );

    alert(
      `Previous session of ${Math.floor(storedSession.currentTime / 60)} minutes saved 🎉`,
    );

    clockStorage.clear();
    setShowRestoreModal(false);
    setStoredSession(null);
    setIsSavingSession(false);
  }

  async function handleDiscardSession() {
    clockStorage.clear();
    setShowRestoreModal(false);
    setStoredSession(null);
  }

  /* ===================== UI ===================== */

  return (
    <section className="flex flex-col items-center justify-center px-4">
      {/* Page Header */}
      <div className="w-full max-w-4xl mb-8">
        <div className="border-l-4 border-blue-600 pl-4 py-2 bg-linear-to-r from-blue-50 to-transparent dark:from-blue-950/20">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
            Study Session Timer
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Focus Mode - {type}
          </p>
        </div>
      </div>

      {/* Main Timer Card */}
      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
          {/* Card Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4 border-b-2 border-blue-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                Active Session
              </h3>
              {isRunning && (
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-bold uppercase">Live</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8 md:p-12">
            {/* Session Type Badge */}
            <div className="flex justify-center mb-8">
              <div className="bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 px-6 py-2">
                <span className="text-lg font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  {type}
                </span>
              </div>
            </div>

            {/* TIME DISPLAY */}
            <TimeDisplay hours={hours} minutes={minutes} seconds={seconds} />

            {/* Selected Tag Display */}
            {selectedTag && (
              <div className="flex justify-center mt-6">
                <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">
                      Subject:
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {selectedTag}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CONTROLS */}
            <div className="mt-8">
              <ControlButtons
                isRunning={isRunning}
                currentTime={currentTime}
                isSavingSession={isSavingSession}
                onStart={start}
                onStop={stop}
                onReset={() => {
                  reset();
                  updateFocusingStatus(false);
                }}
                onSave={handleSave}
                onEdit={() => setEdit(true)}
              />
            </div>

            {/* Info Banner */}
            {!isRunning && currentTime === 0 && (
              <div className="mt-8 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-600 p-4">
                <div className="flex items-start gap-3">
                  <div className="text-xl">💡</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">
                      Getting Started
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Click "Start" to begin your study session. Use "Edit" to configure timer settings and select a subject tag.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RESTORE SESSION MODAL */}
      {showRestoreModal && storedSession && (
        <RestoreSessionModal
          session={storedSession}
          isSaving={isSavingSession}
          onResume={handleResumeSession}
          onSave={handleSavePreviousSession}
          onDiscard={handleDiscardSession}
        />
      )}

      {/* EDIT MODAL */}
      {edit && (
        <EditSessionModal
          type={type}
          setType={setType}
          timerDuration={timerDuration}
          setTimerDuration={setTimerDuration}
          availableTags={availableTags}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          creatingTag={creatingTag}
          setCreatingTag={setCreatingTag}
          newtag={newtag}
          setnewtag={setnewtag}
          isCreatingTag={isCreatingTag}
          tagMessage={tagMessage}
          onCreateTag={handleCreateTag}
          onClose={() => {
            setEdit(false);
            setCreatingTag(false);
            setTagMessage(null);
          }}
        />
      )}
    </section>
  );
}

const StudySession = () => {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="max-w-7xl mx-auto px-4 md:px-6 py-12"
      >
        <Clock />
      </motion.div>
    </main>
  );
};

export default StudySession;