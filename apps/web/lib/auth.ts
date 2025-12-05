// auth.ts ..
// This file configures NextAuth.js (Auth.js v5) for handling authentication
// Now includes OAuth user creation in your database

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
  
  providers: [
    
    // CREDENTIALS PROVIDER: For traditional email/password login
    Credentials({
      name: "Credentials",
      credentials: {
        email: { 
          label: "Email",
          type: "email"
        },
        password: { 
          label: "Password", 
          type: "password"
        }
      },
      authorize: async (credentials) => {
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

        const user = await res.json()

        if (res.ok && user) {
          return user
        }
        
        return null
      }
    }),
    
    // GOOGLE OAUTH PROVIDER
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // GITHUB OAUTH PROVIDER
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  
  pages: {
    signIn: "/login",
  },
  
  callbacks: {
    
    // SIGN IN CALLBACK: Runs when user signs in
    // This is where we create/update OAuth users in our database
    async signIn({ user, account, profile }) {
      
      // Only process OAuth sign-ins (not credentials)
      // account.provider tells us which OAuth provider was used
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          // Call your backend API to create/update user
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/oauth-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account.provider, // "google" or "github" - from account object
              providerId: account.providerAccountId, // Unique ID from OAuth provider
            }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            // Successfully created/updated user in database
            return true; // Allow sign in
          } else {
            console.error("Failed to create/update OAuth user:", data.error);
            return false; // Deny sign in
          }
          
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false; // Deny sign in on error
        }
      }
      
      // For credentials login, allow sign in (already handled in authorize)
      return true;
    },
    
    // JWT CALLBACK: Add user data to JWT token
    async jwt({ token, user, account }) {
      // When user first signs in, add their data to the token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image // OAuth profile picture
      }
      
      // Store provider info from account (only available on first sign in)
      if (account) {
        token.provider = account.provider
      }
      
      return token
    },
    
    // SESSION CALLBACK: Add token data to session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
        
        // Add provider info to session if it exists in token
        if (token.provider) {
          session.user.provider = token.provider as string
        }
      }
      
      return session
    }
  },
  
  session: {
    strategy: "jwt",
  },
  
  // Optional: Add custom error page
  // If OAuth user creation fails, user will be redirected to sign-in page
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log successful sign-ins
      console.log(`User ${user.email} signed in with ${account?.provider}`);
    },
  },
})
