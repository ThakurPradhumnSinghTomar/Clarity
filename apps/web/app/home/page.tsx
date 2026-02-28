"use client";

import { useRouter } from "next/navigation";
import {LocalWeeklyFocus} from "../../lib/components/home/weeklyfocus"
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
import {messaging} from "@/lib/firebase"
import { getToken } from "firebase/messaging";

/* ---------------- Page ---------------- */

export default function Home() {
  const router = useRouter();
  const activity = useActivity();
  const dailyFocus = useDailyFocus();
  const rooms = useRooms();

  async function requestPremission(){
    const permission = await Notification.requestPermission()
    if(permission == "granted"){
      //generate token
      const token = await getToken(messaging,{vapidKey : process.env.vapidKey})
      //save ths token to db for a user and use it in backend for sending notifications
      console.log("token : ",token)
    }
    else if(permission == "denied"){
      alert("you denied for the notification permission buddy.. i mean seriously..")
    } 
  }

  useEffect(()=>{
    //get permission from user of notifications of app load
    requestPremission()

  },[])
  

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
