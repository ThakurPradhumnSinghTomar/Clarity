"use client"
import React from 'react'
import {QuoteBox} from '@repo/ui'
import { Histogram } from '@repo/ui'
import {Leaderboard} from '@repo/ui'
import { Student } from '@repo/types'

const dummyStudents: Student[] = [
  {
    name: "Aarav Sharma",
    studyHours: 42,
    uid: "stu-001",
    profileImg: "https://randomuser.me/api/portraits/men/75.jpg"
  },
  {
    name: "Priya Verma",
    studyHours: 38,
    uid: "stu-002",
    profileImg: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    name: "Rohan Gupta",
    studyHours: 31,
    uid: "stu-003",
    profileImg: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Sneha Patel",
    studyHours: 27,
    uid: "stu-004",
    profileImg: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "Kabir Singh",
    studyHours: 20,
    uid: "stu-005",
    profileImg: "https://randomuser.me/api/portraits/men/12.jpg"
  },
  {
    name: "Priya Verma",
    studyHours: 18,
    uid: "stu-702",
    profileImg: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    name: "Priya Verma",
    studyHours: 23,
    uid: "stu-602",
    profileImg: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    name: "Priya Verma",
    studyHours: 48,
    uid: "stu-052",
    profileImg: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    name: "Priya Verma",
    studyHours: 38,
    uid: "stu-402",
    profileImg: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    name: "Priya Verma",
    studyHours: 28,
    uid: "stu-302",
    profileImg: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    name: "Priya Verma",
    studyHours: 32,
    uid: "stu-102",
    profileImg: "https://randomuser.me/api/portraits/women/65.jpg"
  }
];

const home = () => {
  console.log('HOME PAGE RENDERING') 
  return (
    <div className='min-h-[600px] bg-[#F1F5F9] dark:bg-[#0F172A] pt-10'>
      
      <div className='md:flex md:justify-around'>
          <div className='p-4 md:min-w-2xl'>
          <div className='min-h-[185px]'><QuoteBox></QuoteBox></div>
          <Histogram></Histogram>
          </div>



           <div>
            <Leaderboard students={dummyStudents}></Leaderboard>
          </div>
      
      </div>

     
      
      
    </div>
  )
}

export default home