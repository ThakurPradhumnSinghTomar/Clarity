// auth.ts
// This file configures NextAuth.js (Auth.js v5) for handling authentication
// It exports handlers for API routes, and functions for signing in/out and checking auth status

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

// NextAuth() returns an object with several useful exports:
// - handlers: Used in API routes to handle authentication requests
// - signIn: Function to trigger sign in
// - signOut: Function to trigger sign out
// - auth: Function to get current session (server-side)
export const { handlers, signIn, signOut, auth } = NextAuth({
  
  // PROVIDERS: Define how users can authenticate
  providers: [
    
    // CREDENTIALS PROVIDER: For traditional email/password login
    Credentials({
      // Display name for this provider
      name: "Credentials",
      
      // Define the input fields for the login form
      credentials: {
        email: { 
          label: "Email",      // Display label
          type: "email"        // Input type (for HTML validation)
        },
        password: { 
          label: "Password", 
          type: "password"     // Password input type (hides characters)
        }
      },
      
      // AUTHORIZE FUNCTION: This is called when user submits credentials
      // It should verify the credentials and return user object or null
      authorize: async (credentials) => {
        
        // Make API call to your backend to verify user credentials
        // Your backend should check email/password against database

        //IMPORTANT : here token coming from bakcend is ignored and nextAuth will amnage its own token
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        })

        // Parse the JSON response from backend
        const user = await res.json()

        // If response is OK (status 200-299) and we have a user object
        // Return the user - NextAuth will create a session for them
        if (res.ok && user) {
          // User object should contain: { id, email, name, etc. }
          return user
        }
        
        // If authentication fails, return null
        // This will show an error to the user
        return null
      }
    }),
    
    // GOOGLE OAUTH PROVIDER: For "Sign in with Google"
    // You need to create OAuth credentials in Google Cloud Console
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // GITHUB OAUTH PROVIDER: For "Sign in with GitHub"
    // You need to create OAuth app in GitHub Settings
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  
  // PAGES: Customize the URLs for authentication pages
  pages: {
    signIn: "/login",      // Redirect here when user needs to sign in
    // signOut: "/logout",  // Optional: Custom sign out page
    // error: "/error",     // Optional: Custom error page
  },
  
  // CALLBACKS: Functions that run at specific points in the auth flow
  callbacks: {
    
    // JWT CALLBACK: Runs whenever a JWT is created or updated
    // This is where you can add custom data to the token
    async jwt({ token, user }) {
      // When user signs in, 'user' object is available
      // We add user data to the token so it's available in all requests
      if (user) {
        token.id = user.id           // Add user ID to token
        token.email = user.email     // Add email to token
        token.name = user.name       // Add name to token
        // You can add more custom fields here like roles, permissions, etc.
      }
      
      // Return the token - it will be encrypted and stored
      return token
    },
    
    // SESSION CALLBACK: Runs whenever session is checked
    // This is where you can add token data to the session object
    // The session object is what you get when you call useSession() or auth()
    async session({ session, token }) {
      // Add data from token to session
      // Now this data will be available on the client side
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        // Add any other custom fields you added to the token
      }
      
      // Return the session object
      return session
    }
  },
  
  // SESSION STRATEGY: How to store sessions
  session: {
    strategy: "jwt",  // Use JWT (stateless, stored in HTTP-only cookie)
                      // Alternative: "database" (stores sessions in DB) but not for now, can be implemented in future..
  },
})