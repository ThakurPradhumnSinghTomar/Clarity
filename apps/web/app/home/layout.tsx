'use client'
import React, { useEffect } from 'react'
import { Header } from "@repo/ui";
import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"

const layout = ({children} : { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (
      status === "authenticated" &&
      session?.user?.hasPassword === false &&
      pathname !== "/home/create-password"
    ) {
      router.push("/home/create-password")
    }
  }, [status, router, session?.user?.hasPassword, pathname])

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

  if (
    status === "authenticated" &&
    session?.user?.hasPassword === false &&
    pathname !== "/home/create-password"
  ) {
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
         {/* FOOTER */}
      <footer className="text-center text-xs text-neutral-500 pb-6 pt-4">
        © {new Date().getFullYear()} Rebuild — Built for focused minds.
      </footer>
    </div>
  )
}

export default layout