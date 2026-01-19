
export function EditSessionModal({
  type,
  setType,
  timerDuration,
  setTimerDuration,
  availableTags,
  selectedTag,
  setSelectedTag,
  creatingTag,
  setCreatingTag,
  newtag,
  setnewtag,
  isCreatingTag,
  tagMessage,
  onCreateTag,
  onClose,
}: {
  type: "Stopwatch" | "Timer";
  setType: (t: "Stopwatch" | "Timer") => void;
  timerDuration: number;
  setTimerDuration: (v: number) => void;
  availableTags: string[];
  selectedTag: string | null;
  setSelectedTag: (v: string | null) => void;
  creatingTag: boolean;
  setCreatingTag: (v: boolean) => void;
  newtag: string;
  setnewtag: (v: string) => void;
  isCreatingTag: boolean;
  tagMessage: string | null;
  onCreateTag: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white dark:bg-[#151B22] rounded-2xl p-6 w-80">
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
          <>
            <input
              value={newtag}
              onChange={(e) => setnewtag(e.target.value)}
              placeholder="Create tag"
              className="w-full p-2 rounded-xl mt-2"
            />

            <button
              onClick={onCreateTag}
              disabled={isCreatingTag}
              className="w-full p-2 rounded-xl my-4 bg-[#0F172A] dark:bg-white text-white dark:text-black"
            >
              {isCreatingTag ? "Creating…" : "Create tag"}
            </button>

            {tagMessage && <p className="text-sm text-center">{tagMessage}</p>}
          </>
        ) : (
          <select
            defaultValue={selectedTag ?? ""}
            onChange={(e) => {
              if (e.target.value === "create") {
                setCreatingTag(true);
              } else {
                setSelectedTag(e.target.value);
              }
            }}
            className="w-full mb-4 p-2 rounded-xl border bg-transparent"
          >
            <option value="" disabled>
              Select a tag
            </option>

            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}

            <option value="create">Create a new tag</option>
          </select>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-full border"
        >
          Close
        </button>
      </div>
    </div>
  );
}