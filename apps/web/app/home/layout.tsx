'use client'
import React, { useEffect } from 'react'
import { Header } from "@repo/ui";
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const layout = ({children} : { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <div className=' top-0 left-0 w-full z-50 pt-4'>
        <Header />
      </div>
      <div className='pt-[65px]'>
        {children}
      </div>
    </div>
  )
}

export default layout