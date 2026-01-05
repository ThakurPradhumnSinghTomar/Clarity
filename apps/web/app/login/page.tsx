// app/login/page.tsx
// Login page component with email/password form and OAuth buttons
// Now with full dark mode support using Tailwind's dark: classes

"use client"  // Client component because we need interactivity (forms, state)

import { signIn } from "next-auth/react"  // Function to trigger authentication
import { useEffect, useState } from "react"           // React hook for managing state
import { useRouter } from "next/navigation"  // Next.js router for navigation
import { useSession } from "next-auth/react"  // ✅ Hook for client components

// ✅ NEW: animated UI component
import { LoginPage as AnimatedLogin } from "@repo/ui"

export default function LoginPage() {

  // STATE: Track form inputs and UI state
  const [email, setEmail] = useState("")           // Email input value
  const [password, setPassword] = useState("")     // Password input value
  const [error, setError] = useState("")           // Error message to display
  const [loading, setLoading] = useState(false)    // Loading state for button

  const { data: session, status } = useSession()
  const router = useRouter()

  // FORM SUBMIT HANDLER: Called when user clicks "Sign in" button
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()  // Prevent default form submission (page reload)

    setLoading(true)    // Show loading state
    setError("")        // Clear any previous errors

    try {
      // Call NextAuth's signIn function with credentials
      const result = await signIn("credentials", {
        email,           // Email from form
        password,        // Password from form
        redirect: false, // Don't auto-redirect, we'll handle it manually
      })

      // Check if authentication failed
      if (result?.error) {
        setError("Invalid credentials")  // Show error message
      } else {
        // Success! Redirect to home
        router.push("/home")
        router.refresh()  // Refresh to update server components
      }
    } catch (error) {
      // Handle any unexpected errors
      setError("Something went wrong")
    } finally {
      setLoading(false)  // Always turn off loading state
    }
  }

  // OAUTH HANDLER: Called when user clicks Google/GitHub button
  const handleOAuthSignIn = (provider: "google" | "github") => {
    // signIn with OAuth provider - will redirect to provider's auth page
    signIn(provider, { 
      callbackUrl: "/home"  // Where to redirect after successful auth
    })
  }

  useEffect(() => {
    // Check if session has finished loading
    if (status === "loading") {
      return  // Still loading, do nothing
    }

    // If authenticated, redirect to home
    if (status === "authenticated") {
      router.push("/home")
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

  // ✅ RENDER ANIMATED LOGIN UI
  return (
    <AnimatedLogin
      // controlled values
      email={email}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}

      // auth actions
      onSubmit={handleSubmit}
      onOAuth={handleOAuthSignIn}

      // ui state
      error={error}
      loading={loading}

      // routing
      onSignup={() => router.push("/signup")}
    />
  )
}
