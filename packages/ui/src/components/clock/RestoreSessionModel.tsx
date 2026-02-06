
export function RestoreSessionModal({
  session,
  isSaving,
  onResume,
  onSave,
  onDiscard,
}: {
  session: any;
  isSaving: boolean;
  onResume: () => void;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-[var(--color-surface)] text-[var(--color-text)] rounded-2xl p-6 w-96">
        <h3 className="text-xl font-semibold mb-4">Previous Session Found</h3>

        <div className="mb-6 p-4 rounded-lg bg-[var(--color-surface-elevated)]">
          <p className="mb-2">
            <span className="font-semibold">Type:</span> {session.type}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Duration:</span>{" "}
            {Math.floor(session.currentTime / 60)} minutes
          </p>
          {session.selectedTag && (
            <p className="mb-2">
              <span className="font-semibold">Tag:</span> {session.selectedTag}
            </p>
          )}
          <p className="text-sm text-[var(--color-text-muted)]">
            Session was paused
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-full bg-[var(--color-primary)] text-white font-semibold"
          >
            Resume Session
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="w-full py-3 rounded-full border border-[var(--color-border)]"
          >
            {isSaving ? "Saving..." : "Save & Start Fresh"}
          </button>

          <button
            onClick={onDiscard}
            className="w-full py-3 rounded-full border border-[var(--color-border)] text-[var(--color-accent-red)]"
          >
            Discard Session
          </button>
        </div>
      </div>
    </div>
  );
}
