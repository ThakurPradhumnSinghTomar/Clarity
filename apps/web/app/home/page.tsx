
"use client"  // Client component - needed for interactivity

import React, { useEffect } from 'react'
import { QuoteBox } from '@repo/ui'
import { Histogram } from '@repo/ui'
import { Leaderboard } from '@repo/ui'
import { dummyStudents } from '@repo/types'
import { useSession } from "next-auth/react"  // ✅ Hook for client components
import { useRouter } from "next/navigation"   // ✅ Router for client components

const Home = () => {  // ✅ Component name in PascalCase
  
 
  return (
    <div className='min-h-[675px] pt-10'>
      <div className='md:flex md:justify-around'>
        <div className='p-4 md:min-w-2xl'>
          <div className='min-h-[185px]'>
            <QuoteBox />
          </div>
          <Histogram />
        </div>

        <div>
          <Leaderboard students={dummyStudents} />
        </div>
      </div>
    </div>
  )
}

export default Home