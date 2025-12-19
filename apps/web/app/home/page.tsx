"use client";

import React, { useEffect, useState } from "react";
import { QuoteBox, RoomCard } from "@repo/ui";
import { Histogram } from "@repo/ui";
import { Leaderboard } from "@repo/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Room } from "@repo/types";
import { transformRoomData } from "@/lib/helpfulFunctions/transformRoomData";
import { fetchMyRooms } from "@/lib/helpfulFunctions/roomsRelated/fetchRoomsData";
import { div } from "framer-motion/client";

// Loading Skeleton Components
const HistogramSkeleton = () => (
  <div className="animate-pulse p-4 bg-gray-100 dark:bg-zinc-800 h-[400px] md:w-[650px] rounded-2xl border border-gray-200 dark:border-zinc-800"></div>
);

const LeaderboardSkeleton = () => (
  <div className="animate-pulse p-4 md:w-[800px] rounded-2xl">
    <div className="m-6 w-full h-22 bg-gray-100 dark:bg-zinc-800 ml-0 rounded-2xl border border-gray-200 dark:border-zinc-800"></div>
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-20 bg-gray-100 dark:bg-zinc-800 rounded border border-gray-200 dark:border-zinc-800"
        ></div>
      ))}
    </div>
  </div>
);

const Home = () => {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [data, setData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const currentDay = new Date().getDay() == 0 ? 6 : new Date().getDay() - 1; //Sunday is 0
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingHistogram, setIsLoadingHistogram] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [histogramPage, setHistogramPage] = useState(0);
  const [stopNow, setStopNow] = useState(false);
  const [noWeeklyData,setNoWeeklyData]=useState(false);
  const router = useRouter();
  const accessToken = session?.accessToken;
  if (!accessToken) {
    console.log("no access token in the session..");
    throw error;
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchMyRooms({ setIsLoadingRooms, setError, accessToken, setMyRooms });
    }
  }, [session]);

  const loadCurrentWeekStudyHours = async () => {
    setIsLoadingHistogram(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-current-week-study-hours/${histogramPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error("unable to fetch current week study hours for this user");
        return;
      }

      const responseData = await response.json();

      if (!responseData.success) {
        console.error(
          "Failed to fetch study hours, but response is ok:",
          responseData.message
        );
        return;
      }

      const weeklyStudyHours = responseData.weeklyStudyHours;

      if (!weeklyStudyHours || !weeklyStudyHours.days) {
        console.log("No weekly study hours for this user for current week");
        setStopNow(true);
        setNoWeeklyData(true);
        return;
      }

      const newData = [0, 0, 0, 0, 0, 0, 0];
      weeklyStudyHours.days.forEach(
        (day: { weekday: number; focusedSec: number }) => {
          if (day.weekday >= 0 && day.weekday <= 6) {
            newData[day.weekday] =
              Math.round((day.focusedSec / 3600) * 100) / 100;
          }
        }
      );

      setData(newData);
      console.log("weekly study hours fetched successfully :", data);
    } catch (e) {
      console.error("error in getting leaderboard", e);
    } finally {
      setIsLoadingHistogram(false);
    }
  };

  const loadLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/leaderboard`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error("error fetching leaderboard");
        return;
      }

      const responseData = await response.json();

      if (!responseData.success) {
        console.error("Failed to fetch study hours:", responseData.message);
        return;
      }

      console.log(
        "leaderboard data we fetch from backend is : ",
        responseData.leaderboard
      );
      setLeaderboard(responseData.leaderboard);
      setCurrentUser(responseData.currentUser);

      console.log("leaderboard fetched successfull");
    } catch (error) {
      console.error("error in fetching leaderboard", error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      loadCurrentWeekStudyHours();
    }
  }, [session?.accessToken, histogramPage]);

  useEffect(() => {
    if (session?.accessToken) {
      loadLeaderboard();
    }
  }, [session?.accessToken]);

  return (
    <div className="min-h-[675px] pt-10 pb-4">
      <div className="md:flex md:justify-center gap-4">
        <div className="p-4 md:min-w-2xl">
          <div className="min-h-[165px] mb-6 md:mb-0">
            <QuoteBox />
          </div>
          {isLoadingHistogram ? (
            <HistogramSkeleton />
          ) : (
            <div className="relative flex px-6">
              {!stopNow && (
                <div
                  className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-700 absolute mt-40 z-5 left-0 font-bold text-white text-sm flex justify-center items-center"
                  onClick={() => {
                    setHistogramPage(histogramPage + 1);
                  }}
                >
                  Prev
                </div>
              )}
              {!noWeeklyData?<Histogram data={data} currentDay={currentDay} />:<div className="bg-gray-100 dark:bg-zinc-800 h-[400px] md:w-[600px] rounded-2xl border border-gray-200 dark:border-zinc-800 flex justify-center items-center"><p>No weekly Study hours for this week</p></div>}
              {histogramPage > 0 && (
                <div
                  className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-700 absolute mt-40 z-5 right-0 font-bold text-white text-sm flex justify-center items-center"
                  onClick={() => {
                    let temp = histogramPage - 1;
                    temp < 0 ? setHistogramPage(0) : setHistogramPage(temp);
                    setStopNow(false);
                    setNoWeeklyData(false);
                  }}
                >
                  Next
                </div>
              )}
            </div>
          )}
        </div>

        <div className="max-w-xl text-gray-900 dark:text-white  bg-linear-to-br from-indigo-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800 p-6 rounded-xl border border-indigo-200 dark:border-zinc-700 shadow-lg md:min-w-[750px] relative overflow-hidden mb-4 h-[608px] mt-4">
          <h1 className="text-2xl font-semibold">My Rooms : </h1>

          {!isLoadingRooms && !error && myRooms.length > 0 && (
            <div className="grid grid-cols-1 gap-2 mt-6  overflow-y-auto w-full scrollbar-hide py-4">
              {myRooms.map((room) => (
                <div
                  className="mx-2"
                  key={room.id}
                  onClick={() => {
                    router.push(`/home/rooms/${room.id}`);
                  }}
                >
                  <RoomCard {...transformRoomData(room)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
