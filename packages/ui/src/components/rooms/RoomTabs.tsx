"use client";

type RoomTab = "members" | "leaderboard" | "pending requests";

type RoomTabsProps = {
  activeTab: RoomTab;
  onChange: (tab: RoomTab) => void;
};

export function RoomTabs({ activeTab, onChange }: RoomTabsProps) {
  return (
    <div className="mb-6 border-b border-gray-300 dark:border-gray-700">
      <div className="flex gap-8">
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
          label="Pending requests.."
          isActive={activeTab === "pending requests"}
          onClick={() => onChange("pending requests")}
        />
      </div>
    </div>
  );
}

type TabButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-2 font-semibold transition-colors relative ${
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
