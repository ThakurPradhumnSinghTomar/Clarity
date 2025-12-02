// app/login/page.tsx
// Login page component with email/password form and OAuth buttons
// Now with full dark mode support using Tailwind's dark: classes

"use client"  // Client component because we need interactivity (forms, state)

import { signIn } from "next-auth/react"  // Function to trigger authentication
import { useState } from "react"           // React hook for managing state
import { useRouter } from "next/navigation"  // Next.js router for navigation

export default function LoginPage() {
  // STATE: Track form inputs and UI state
  const [email, setEmail] = useState("")           // Email input value
  const [password, setPassword] = useState("")     // Password input value
  const [error, setError] = useState("")           // Error message to display
  const [loading, setLoading] = useState(false)    // Loading state for button
  
  const router = useRouter()  // Router instance for programmatic navigation

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

  return (
    // MAIN CONTAINER: Full screen with centered content
    // Light mode: bg-gray-50 (light gray background)
    // Dark mode: dark:bg-gray-900 (dark background)
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      
      {/* FORM CONTAINER: Max width card with spacing */}
      <div className="max-w-md w-full space-y-8">
        
        {/* HEADER SECTION */}
        <div>
          {/* PAGE TITLE */}
          {/* Light mode: text-gray-900 (dark text) */}
          {/* Dark mode: dark:text-white (white text) */}
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>
        
        {/* LOGIN FORM */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {/* ERROR MESSAGE BOX: Only shows when there's an error */}
          {/* Light mode: bg-red-50 text-red-500 (light red background, red text) */}
          {/* Dark mode: dark:bg-red-900/20 dark:text-red-400 (dark red background, lighter red text) */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-3 rounded-md text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          
          {/* FORM FIELDS CONTAINER */}
          <div className="space-y-4">
            
            {/* EMAIL INPUT FIELD */}
            <div>
              {/* EMAIL LABEL */}
              {/* Light mode: text-gray-700 (medium gray text) */}
              {/* Dark mode: dark:text-gray-300 (light gray text) */}
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              
              {/* EMAIL INPUT */}
              {/* Light mode: white background, gray border, dark text */}
              {/* Dark mode: dark:bg-gray-800 (dark input bg), dark:border-gray-700 (darker border), dark:text-white (white text) */}
              {/* Focus states also have dark mode variants */}
              <input
                id="email"
                type="email"              // HTML5 email validation
                required                  // Field is required
                value={email}             // Controlled input - value from state
                onChange={(e) => setEmail(e.target.value)}  // Update state on change
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="you@example.com"
              />
            </div>
            
            {/* PASSWORD INPUT FIELD */}
            <div>
              {/* PASSWORD LABEL */}
              {/* Same dark mode styling as email label */}
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              
              {/* PASSWORD INPUT */}
              {/* Same dark mode styling as email input */}
              <input
                id="password"
                type="password"           // Hides password characters
                required                  // Field is required
                value={password}          // Controlled input
                onChange={(e) => setPassword(e.target.value)}  // Update state
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          {/* Light mode: bg-blue-600, hover:bg-blue-700 */}
          {/* Dark mode: dark:bg-blue-600, dark:hover:bg-blue-700 (slightly different blue for dark mode) */}
          {/* Disabled state: disabled:opacity-50 (50% opacity when disabled) */}
          <button
            type="submit"
            disabled={loading}  // Disable button while loading
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {/* Show different text based on loading state */}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* DIVIDER SECTION: "Or continue with" */}
        <div className="mt-6">
          <div className="relative">
            {/* DIVIDER LINE */}
            <div className="absolute inset-0 flex items-center">
              {/* Light mode: border-gray-300, Dark mode: dark:border-gray-700 */}
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            
            {/* DIVIDER TEXT */}
            <div className="relative flex justify-center text-sm">
              {/* Light mode: bg-gray-50 text-gray-500 */}
              {/* Dark mode: dark:bg-gray-900 dark:text-gray-400 */}
              <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* OAUTH BUTTONS SECTION */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            
            {/* GOOGLE BUTTON */}
            {/* Light mode: bg-white, border-gray-300, text-gray-500 */}
            {/* Dark mode: dark:bg-gray-800, dark:border-gray-700, dark:text-gray-300 */}
            <button
              onClick={() => handleOAuthSignIn("google")}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {/* GOOGLE ICON (SVG) */}
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            
            {/* GITHUB BUTTON */}
            {/* Same dark mode styling as Google button */}
            <button
              onClick={() => handleOAuthSignIn("github")}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {/* GITHUB ICON (SVG) */}
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </button>
          </div>
        </div>
        
        {/* SIGN UP LINK SECTION - This was causing the error */}
        {/* Removed the incomplete/malformed JSX that was at the end */}
      </div>
    </div>
  )
}