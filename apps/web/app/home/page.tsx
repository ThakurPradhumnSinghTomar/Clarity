"use client";

import { useRouter } from "next/navigation";
import {
  WeeklyFocus,
  ActivitySection,
  RoomsSection,
  CTASection,
  DailyFocusSection,
} from "@repo/ui";
import { useActivity } from "@/lib/hooks/home/useActivity";

import { transformRoomData } from "@/lib/helpfulFunctions/transformRoomData";
import { HeroSection } from "@repo/ui";
import { useDailyFocus } from "@/lib/hooks/home/useDailyFocus";
import { useRooms } from "@/lib/hooks/home/useRooms";
import { useWeeklyFocus } from "@/lib/hooks/home/useWeeklyFocus";

/* ---------------- Page ---------------- */

export default function Home() {
  const router = useRouter();
  const currentDay = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const activity = useActivity();
  const dailyFocus = useDailyFocus();
  const rooms = useRooms();
  const weeklyFocus = useWeeklyFocus();

  return (
    <main
      className="
        max-w-8xl mx-auto px-12 pb-32 space-y-32
         bg-gray-100 dark:bg-gray-950 transition-colors
      "
    >
      <HeroSection />

      <WeeklyFocus {...weeklyFocus} currentDay={currentDay} />

      <ActivitySection
        isLoading={activity.isLoading}
        activityWeeks={activity.activityWeeks}
        currentStreak={activity.currentStreak}
        longestStreak={activity.longestStreak}
      />

      <DailyFocusSection
        isLoading={dailyFocus.isLoading}
        dailyLabel={dailyFocus.dailyLabel}
        dailySessions={dailyFocus.dailySessions}
      />

      <RoomsSection
        isLoading={rooms.isLoading}
        rooms={rooms.rooms.map(transformRoomData)}
        onRoomClick={(id) => router.push(`/home/rooms/${id}`)}
      />

      <CTASection onStart={() => router.push("/home/study-session")} />
    </main>
  );
}



/*

2️⃣ What Object.values(activityWeeks) does
👉 Removes the keys (0,1,2...) and gives you only the arrays.

3️⃣ What .flat() does (this is the key)
👉 Flattens one level deep

Meaning:

[
  [a, b, c],
  [d, e, f]
].flat()


becomes

[a, b, c, d, e, f]

*/
