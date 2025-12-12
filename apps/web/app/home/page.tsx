"use client"

import React, { useEffect, useState } from 'react'
import { QuoteBox } from '@repo/ui'
import { Histogram } from '@repo/ui'
import { Leaderboard } from '@repo/ui'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

// Loading Skeleton Components
const HistogramSkeleton = () => (
  <div className="animate-pulse p-4 bg-gray-100 dark:bg-zinc-800 h-[400px] md:w-[650px] rounded-2xl border border-gray-200 dark:border-zinc-800">
  </div>
)

const LeaderboardSkeleton = () => (
  <div className="animate-pulse p-4 md:w-[800px] rounded-2xl">
    <div className='m-6 w-full h-22 bg-gray-100 dark:bg-zinc-800 ml-0 rounded-2xl border border-gray-200 dark:border-zinc-800'></div>
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-100 dark:bg-zinc-800 rounded border border-gray-200 dark:border-zinc-800"></div>
      ))}
    </div>
  </div>
)

const Home = () => {
  const { data: session } = useSession()
  const token = session?.accessToken
  const [data, setData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const currentDay = new Date().getDay();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingHistogram, setIsLoadingHistogram] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);

  const loadCurrentWeekStudyHours = async () => {
    setIsLoadingHistogram(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/get-current-week-study-hours`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      if (!response.ok) {
        console.error("unable to fetch current week study hours for this user");
        return;
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        console.error("Failed to fetch study hours, but response is ok:", responseData.message);
        return;
      }

      const weeklyStudyHours = responseData.weeklyStudyHours;
      
      if (!weeklyStudyHours || !weeklyStudyHours.days) {
        console.log("No weekly study hours for this user for current week");
        return;
      }

      const newData = [0, 0, 0, 0, 0, 0, 0];
      weeklyStudyHours.days.forEach((day: { weekday: number, focusedSec: number }) => {
        if (day.weekday >= 0 && day.weekday <= 6) {
          newData[day.weekday-1] = Math.round(day.focusedSec/3600 * 100) / 100;
        }
      });
      
      setData(newData);
      console.log("weekly study hours fetched successfully :",data);

    } catch (e) {
      console.error("error in getting leaderboard", e);
    } finally {
      setIsLoadingHistogram(false);
    }
  };

  const loadLeaderboard = async() => {
    setIsLoadingLeaderboard(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/leaderboard`,{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      if(!response.ok){
        console.error("error fetching leaderboard");
        return ;
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        console.error("Failed to fetch study hours:", responseData.message);
        return;
      }

      console.log("leaderboard data we fetch from backend is : ",responseData.leaderboard);
      setLeaderboard(responseData.leaderboard);
      setCurrentUser(responseData.currentUser);

      console.log("leaderboard fetched successfull");
      
    }
    catch(error){
      console.error("error in fetching leaderboard",error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  } 

  useEffect(() => {
    if (session?.accessToken) {
      loadCurrentWeekStudyHours();
    }
  }, [session?.accessToken]);

  useEffect(()=>{
     if (session?.accessToken) {
      loadLeaderboard();
     }
  },[session?.accessToken]);

  return (
    <div className='min-h-[675px] pt-10'>
      <div className='md:flex md:justify-around'>
        <div className='p-4 md:min-w-2xl'>
          <div className='min-h-[165px] mb-6 md:mb-0'>
            <QuoteBox />
          </div>
          {isLoadingHistogram ? (
            <HistogramSkeleton />
          ) : (
            <Histogram data={data} currentDay={currentDay} />
          )}
        </div>

        <div>
          {isLoadingLeaderboard ? (
            <LeaderboardSkeleton />
          ) : (
            <Leaderboard students={leaderboard} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Home