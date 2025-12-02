// app/api/auth/[...nextauth]/route.ts
// This is the API route that handles ALL authentication requests
// The [...nextauth] syntax is a "catch-all" route that matches:
// - /api/auth/signin
// - /api/auth/signout
// - /api/auth/callback/google
// - /api/auth/session
// - etc.

import { handlers } from "@/lib/auth"  // Import the handlers from our auth config

// Export GET and POST handlers
// NextAuth will automatically handle different endpoints based on the URL path
export const { GET, POST } = handlers