"use client";

// This shared RoomTab union centralizes all available tab keys for room pages.
export type RoomTab = "members" | "leaderboard" | "pending requests" | "chat";

type RoomTabsProps = {
  // The currently selected tab key.
  activeTab: RoomTab;
  // Parent callback that updates selected tab state.
  onChange: (tab: RoomTab) => void;
  isHost?: boolean;
};

export function RoomTabs({
  activeTab,
  onChange,
  isHost = false,
}: RoomTabsProps) {
  return (
    <div className="mb-6 border-b border-gray-300 dark:border-gray-700">
      <div className="flex gap-8 overflow-x-auto">
        <TabButton
          label="Members"
          isActive={activeTab === "members"}
          onClick={() => onChange("members")}
        />

        <TabButton
          label="Leaderboard"
          isActive={activeTab === "leaderboard"}
          onClick={() => onChange("leaderboard")}
        />

        <TabButton
          label="chat"
          isActive={activeTab == "chat"}
          onClick={() => onChange("chat")}
        />

        {isHost ? (
          <TabButton
            label="Pending requests.."
            isActive={activeTab === "pending requests"}
            onClick={() => onChange("pending requests")}
          />
        ) : null}
      </div>
    </div>
  );
}

type TabButtonProps = {
  // Text label rendered inside the tab button.
  label: string;
  // Whether this tab is the active one.
  isActive: boolean;
  // Click callback to activate this tab.
  onClick: () => void;
};

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-2 font-semibold transition-colors relative whitespace-nowrap ${
        isActive
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
      }`}
    >
      {label}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
      )}
    </button>
  );
}
