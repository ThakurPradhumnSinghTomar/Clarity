
"use client"  // Client component - needed for interactivity

import React, { useEffect } from 'react'
import { QuoteBox } from '@repo/ui'
import { Histogram } from '@repo/ui'
import { Leaderboard } from '@repo/ui'
import { dummyStudents } from '@repo/types'
import { useSession } from "next-auth/react"  // ✅ Hook for client components
import { useRouter } from "next/navigation"   // ✅ Router for client components

const Home = () => {  // ✅ Component name in PascalCase
  
  // ✅ Use useSession hook to get session in client components
  const { data: session, status } = useSession()
  const router = useRouter()

  // ✅ Proper useEffect without async
  useEffect(() => {
    // Check if session has finished loading
    if (status === "loading") {
      return  // Still loading, do nothing
    }

    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])  // ✅ Dependencies array

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-[675px] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // If not authenticated, show nothing (will redirect)
  if (status === "unauthenticated") {
    return null
  }

  // ✅ User is authenticated, render the page
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