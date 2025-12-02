// components/providers/session-provider.tsx
// This is a CLIENT COMPONENT that wraps your app with NextAuth's session context
// It allows all child components to access session data using useSession() hook

"use client"  // This directive marks this as a Client Component

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

// Create our own SessionProvider component that wraps NextAuth's provider
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    // NextAuthSessionProvider makes session data available throughout the app
    // Any component wrapped by this can use the useSession() hook
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  )
}