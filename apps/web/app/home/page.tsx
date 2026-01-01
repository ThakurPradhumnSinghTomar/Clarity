"use client";

import React, { useEffect, useState } from "react";
import {
  CreateRoomModal,
  Footer,
  JoinRoomModal,
  MyRoomsPanel,
  QuoteBox,
  RoomCard,
  RoomTabs,
} from "@repo/ui";
import { Histogram } from "@repo/ui";
import { Leaderboard } from "@repo/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Room } from "@repo/types";
import { transformRoomData } from "@/lib/helpfulFunctions/transformRoomData";
import { fetchMyRooms } from "@/lib/helpfulFunctions/roomsRelated/fetchRoomsData";
import { div } from "framer-motion/client";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import { handleCreateRoom } from "@/lib/helpfulFunctions/roomsRelated/handleCreateRoom";
import { handleJoinRoom } from "@/lib/helpfulFunctions/roomsRelated/handleJoinRoom";

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
  const [noWeeklyData, setNoWeeklyData] = useState(false);
  const [roomSelection, setRoomSelection] = useState("My Rooms");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
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

  const onCreateRoom = (
    roomName: string,
    isPrivate: boolean,
    roomDiscription: string
  ) => {
    if (!accessToken) return;

    handleCreateRoom(
      roomName,
      isPrivate,
      roomDiscription,
      setIsCreatingRoom,
      setIsLoadingRooms,
      setError,
      accessToken,
      setMyRooms
    );
  };

  const onJoinRoom = (inviteCode: string) => {
    if (!accessToken) return;

    handleJoinRoom(
      inviteCode,
      setIsLoadingRooms,
      setError,
      accessToken,
      setMyRooms
    );
  };

  return (
    <div className="flex-col">
      <div className="flex flex-col items-center justify-center text-center px-4 gap-6 mt-10 ">
        {/* FOCUSING / ONLINE BADGE */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="
          flex items-center gap-2
          px-4 py-1.5
          rounded-full
          bg-neutral-800/80
          text-sm
          text-white
        "
        >
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="font-medium tracking-wide">167 FOCUSING NOW</span>
        </motion.div>

        {/* MAIN HEADING */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="
          font-poppins
          font-semibold
          text-[40px]
          sm:text-[48px]
          md:text-[56px]
          lg:text-[64px]
          leading-tight
          tracking-[-0.02em]
          text-neutral-900
          dark:text-white
          max-w-[900px]
        "
        >
          Working towards your dreams is hard.
          <br />
          Not reaching them is harder.
        </motion.h1>

        {/* SUBTEXT */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="
          text-neutral-600
          dark:text-white/70
          text-base
          md:text-lg
        "
        >
          Get work done with others from around the 🌍
        </motion.p>

        {/* CTA BUTTON */}
        <motion.button
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="
          mt-2
          px-6 py-3
          rounded-full
          bg-white
          text-black
          font-medium
          text-sm
          hover:bg-neutral-200
          transition
        "
        >
          Start Focusing Now
        </motion.button>
      </div>

      
   
    </div>
  );
};

export default Home;

/*
<div className="min-h-[675px] pt-10 pb-4">
      <div className="md:flex md:justify-center gap-4">
        <div className="p-4 md:min-w-2xl">
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
    */
