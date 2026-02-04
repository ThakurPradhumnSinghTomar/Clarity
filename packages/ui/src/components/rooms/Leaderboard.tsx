"use client";

import { Leaderboard } from "@repo/ui";

type LeaderboardStudent = {
  name: string;
  totalHours: number;
  image?: string;
  isFocusing: boolean;
};

type LeaderboardTabProps = {
  students: LeaderboardStudent[];
};

export function LeaderboardTab({ students }: LeaderboardTabProps) {
  return (
    <div className="flex justify-center w-full">
      <Leaderboard students={students} />
    </div>
  );
}
