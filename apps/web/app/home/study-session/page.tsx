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
      //setCreatingTag(false);
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
    <section className=" pt-30 flex flex-col items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-[var(--color-text)]">
          {type}
        </h2>
      </div>

      {!isRunning && (
        <>
          {/* TIME DISPLAY */}
          <TimeDisplay hours={hours} minutes={minutes} seconds={seconds} />

          {/* CONTROLS */}
          <ControlButtons
            isRunning={isRunning}
            currentTime={currentTime}
            isSavingSession={isSavingSession}
            onStart={() => {
              start();
              updateFocusingStatus(true);
            }}
            onStop={() => {
              stop();
              updateFocusingStatus(false);
            }}
            onReset={() => {
              reset();
              updateFocusingStatus(false);
            }}
            onSave={handleSave}
            onEdit={() => setEdit(true)}
          />
        </>
      )}

      {isRunning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-[1px] pt-44">
          <div className="w-full max-w-4xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-2xl">
            <div className="flex flex-col  items-center justify-center">
              <TimeDisplay hours={hours} minutes={minutes} seconds={seconds} />
              <ControlButtons
                isRunning={isRunning}
                currentTime={currentTime}
                isSavingSession={isSavingSession}
                onStart={() => {
                  start();
                  updateFocusingStatus(true);
                }}
                onStop={() => {
                  stop();
                  updateFocusingStatus(false);
                }}
                onReset={() => {
                  reset();
                  updateFocusingStatus(false);
                }}
                onSave={handleSave}
                onEdit={() => setEdit(true)}
              />
              <p className="mt-2 pt-4 text-sm text-[var(--color-text-muted)]">
                You can&apos;t interact with anything else during a focus
                session.
              </p>
            </div>
          </div>
        </div>
      )}

      

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
    <main className="min-h-screen bg-[var(--color-bg)] transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1], // same calm easing you use elsewhere
        }}
        className="max-w-6xl mx-auto px-6 py-12 pt-0"
      >
        <Clock />
      </motion.div>
    </main>
  );
};

export default StudySession;
