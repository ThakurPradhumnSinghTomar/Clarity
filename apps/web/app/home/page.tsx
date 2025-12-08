"use client"  // Client component - needed for interactivity

import React, { useEffect, useState } from 'react'
import { QuoteBox } from '@repo/ui'
import { Histogram } from '@repo/ui'
import { Leaderboard } from '@repo/ui'
import { dummyStudents } from '@repo/types'
import { useSession } from "next-auth/react"  // ✅ Hook for client components
import { useRouter } from "next/navigation"   // ✅ Router for client components

const Home = () => {  // ✅ Component name in PascalCase
  const { data: session } = useSession()
  const token = session?.accessToken // Your backend JWT token
  const [data, setData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const currentDay = new Date().getDay(); // ✅ FIXED: Date.now() returns timestamp, not day
  const [leaderboard,setLeaderboard] = useState([]);
  const [currentUser,setCurrentUser] = useState(null);

  const loadCurrentWeekStudyHours = async () => {
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
        return; // ✅ Added return to exit early
      }

      const responseData = await response.json(); // ✅ Renamed to avoid conflict
      
      if (!responseData.success) {
        console.error("Failed to fetch study hours, but response is ok:", responseData.message);
        return;
      }

      const weeklyStudyHours = responseData.weeklyStudyHours;
      
      if (!weeklyStudyHours || !weeklyStudyHours.days) {
        console.log("No weekly study hours for this user for current week");
        return;
      }

      // ✅ FIXED: Proper mapping and state update
      const newData = [0, 0, 0, 0, 0, 0, 0]; // Initialize fresh array
      weeklyStudyHours.days.forEach((day: { weekday: number, focusedSec: number }) => {
        if (day.weekday >= 0 && day.weekday <= 6) {
          newData[day.weekday] = Math.round(day.focusedSec/3600 * 100) / 100;
        }
      });
      
      setData(newData); // ✅ Set state ONCE with complete array
      console.log("weekly study hours fetched successfully :",data);

    } catch (e) {
      console.error("error in getting leaderboard", e);
    }
  };

  const loadLeaderboard = async() => {
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

      const responseData = await response.json(); // ✅ Renamed to avoid conflict
      
      if (!responseData.success) {
        console.error("Failed to fetch study hours:", responseData.message);
        return;
      }

      setLeaderboard(responseData.leaderboard);
      setCurrentUser(responseData.currentUser);

      console.log("leaderboard fetched successfull");
      

    }
    catch(error){

      console.error("error in fetching leaderboard",error);

    }
  } 

  useEffect(() => {
    if (session?.accessToken) { // ✅ Only fetch when session is available
      loadCurrentWeekStudyHours();
    }
  }, [session?.accessToken]); // ✅ Added dependency

  useEffect(()=>{
     if (session?.accessToken) {
      loadLeaderboard();
     }

  },[session?.accessToken]);

  return (
    <div className='min-h-[675px] pt-10'>
      <div className='md:flex md:justify-around'>
        <div className='p-4 md:min-w-2xl'>
          <div className='min-h-[185px]'>
            <QuoteBox />
          </div>
          <Histogram data={data} currentDay={currentDay} />
        </div>

        <div>
          <Leaderboard students={leaderboard} />
        </div>
      </div>
    </div>
  )
}

export default Home