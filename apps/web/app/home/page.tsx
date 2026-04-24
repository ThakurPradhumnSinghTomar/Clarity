"use client";

import { useRouter } from "next/navigation";
import { LocalWeeklyFocus } from "../../lib/components/home/weeklyfocus";

import {
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

import { useEffect } from "react";

import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import { useSession } from "next-auth/react";

/* ---------------- Page ---------------- */

export default function Home() {
  const router = useRouter();

  // Fetch activity stats
  const activity = useActivity();

  // Fetch today's focus stats
  const dailyFocus = useDailyFocus();

  // Fetch study rooms
  const rooms = useRooms();

  // Session info from NextAuth
  const { data: session } = useSession();


  // Function to request notification permission
  // and save the Firebase token to backend
  async function requestPermissionAndSaveToken() {

    // If user is not authenticated we stop
    if (!session?.accessToken) return;

    // Check if we already sent token earlier
    const alreadySent = localStorage.getItem("fcm-token-sent");

    if (alreadySent === "true") {
      return;
    }

    // Ask browser permission for notifications
    const permission = await Notification.requestPermission();

    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    if (permission === "granted") {

      // Get device/browser FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (!token) return;

      // Send token to backend
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/fcm-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ token }),
      });

      // Save flag so we don't send token again
      localStorage.setItem("fcm-token-sent", "true");
    }

    else if (permission === "denied") {
      alert("You denied notification permission.");
    }
  }


  // Run this when session becomes available
  useEffect(() => {
    requestPermissionAndSaveToken();
  }, [session?.accessToken]);


  return (
    <main
      className="
        max-w-8xl mx-auto px-12 pb-32 space-y-32
        bg-[#F4F6F8] text-[#1F2937]
        dark:bg-[#0F1419] dark:text-[#E6EDF3]
      "
    >
      <HeroSection />

      <LocalWeeklyFocus />

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

Extra Notes

Object.values(activityWeeks)
Removes object keys and returns only values.

Example

{
  0: [a,b],
  1: [c,d]
}

becomes

[
  [a,b],
  [c,d]
]


.flat()

Flattens nested arrays one level deep.

Example

[
  [a,b,c],
  [d,e,f]
].flat()

becomes

[a,b,c,d,e,f]

*/