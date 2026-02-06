
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
      <div className="bg-white dark:bg-[#151B22] text-[#0F172A] dark:text-[#E6EDF3] rounded-2xl p-6 w-96">
        <h3 className="text-xl font-semibold mb-4">Previous Session Found</h3>

        <div className="mb-6 p-4 rounded-lg bg-[#F4F6F8] dark:bg-[#0F1419]">
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
          <p className="text-sm text-[#64748B] dark:text-[#9FB0C0]">
            Session was paused
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-black font-semibold"
          >
            Resume Session
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="w-full py-3 rounded-full border"
          >
            {isSaving ? "Saving..." : "Save & Start Fresh"}
          </button>

          <button
            onClick={onDiscard}
            className="w-full py-3 rounded-full border text-red-600 dark:text-red-400"
          >
            Discard Session
          </button>
        </div>
      </div>
    </div>
  );
}