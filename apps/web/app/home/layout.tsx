'use client'
import React, { useEffect } from 'react'
import { Header } from "@repo/ui";
import { useSession } from "next-auth/react"  // ✅ Hook for client components
import { useRouter } from "next/navigation"   // ✅ Router for client components




const layout = ({children} : { children: React.ReactNode }) => {

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
  
  
  
  return (
    
    <div className=''>
      <div className='fixed top-0 left-0 w-full z-50'><Header></Header></div>
      <div className='pt-[65px]'>
        {children}
      </div>
      </div>
  )
}

export default layout