"use client";

export type StoredClockState = {
  type: "Stopwatch" | "Timer";
  timerDuration: number;
  currentTime: number;
  selectedTag: string | null;
  isRunning : boolean
};

const STORAGE_KEY = "focus-clock-state";

export function useClockPersistence() {
  function load(): StoredClockState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function save(state: StoredClockState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  return { load, save, clear };
}
