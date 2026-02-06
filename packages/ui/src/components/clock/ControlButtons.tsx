export function ControlButtons({
  isRunning,
  currentTime,
  isSavingSession,
  onStart,
  onStop,
  onReset,
  onSave,
  onEdit,
}: {
  isRunning: boolean;
  currentTime: number;
  isSavingSession: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSave: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex gap-4 mt-8">
      {isRunning ? (
        <button
          onClick={onStop}
          className="
            px-6 py-3 rounded-full
            bg-[var(--color-primary)]
            text-white
            transition-all duration-300 ease-out
            hover:-translate-y-0.5
            hover:shadow-lg
            hover:shadow-[var(--color-primary-soft)]
            cursor-pointer
          "
        >
          Stop
        </button>
      ) : (
        <button
          onClick={onStart}
          className="
            px-6 py-3 rounded-full
            bg-[var(--color-primary)]
            text-white
            transition-all duration-300 ease-out
            hover:-translate-y-0.5
            hover:shadow-lg
            hover:shadow-[var(--color-primary-soft)]
            cursor-pointer
          "
        >
          Start
        </button>
      )}

      <button
        onClick={onReset}
        className="
          px-6 py-3 rounded-full border
          text-[var(--color-text)]
          border-[var(--color-border-strong)]
          transition-all duration-300 ease-out
          hover:-translate-y-0.5
          hover:shadow-lg
          hover:shadow-slate-900/30
          hover:shadow-[var(--color-border-strong)]
          cursor-pointer
        "
      >
        Reset
      </button>

      <button
        disabled={!(currentTime > 0 && !isRunning && !isSavingSession)}
        onClick={onSave}
        className={`
          px-6 py-3 rounded-full border
          text-[var(--color-text)]
          border-[var(--color-border-strong)]
          transition-all duration-300 ease-out
          ${
            currentTime > 0 && !isRunning && !isSavingSession
              ? "hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
              : "opacity-40 cursor-not-allowed"
          }
        `}
      >
        {isSavingSession ? "Saving…" : "Save"}
      </button>

      <button
        onClick={onEdit}
        className="
          px-6 py-3 rounded-full border
          text-[var(--color-text)]
          border-[var(--color-border-strong)]
          transition-all duration-300 ease-out
          hover:-translate-y-0.5
          hover:shadow-lg
          hover:shadow-slate-900/30
          hover:shadow-[var(--color-border-strong)]
          cursor-pointer
        "
      >
        Edit
      </button>
    </div>
  );
}
