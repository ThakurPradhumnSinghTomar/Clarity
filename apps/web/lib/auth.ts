// auth.ts - FIXED VERSION
// This file configures NextAuth.js (Auth.js v5) for handling authentication
// Modified to use JWT tokens returned by your backend

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { error } from "console"

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

        const data = await res.json()

        if (res.ok && data) {
          // Return user data along with the backend token
          console.log(data.user.id,"this is current user id")
          console.log(data.user.email,"this is current user email")

          if(!data.user.id){ throw error("no userid to set in the token")}
          return {
            id: data.id || data.user?.id,
            email: data.email || data.user?.email,
            name: data.name || data.user?.name,
            image: data.image || data.user?.image, // ✅ This will be the Cloudinary URL
            backendToken: data.token || data.accessToken, // Backend JWT token
          }
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

  secret: process.env.AUTH_SECRET,
  
  pages: {
    signIn: "/login",
  },
  
  callbacks: {
    
    // SIGN IN CALLBACK: Runs when user signs in
    async signIn({ user, account, profile }) {
  
  // Only process OAuth sign-ins (not credentials)
  if (account?.provider === "google" || account?.provider === "github") {
    try {
      // Call your backend API to create/update user and GET THE TOKEN
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/oauth-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          image: user.image,
          provider: account.provider,
          providerId: account.providerAccountId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ FIXED: Update user object with backend data
        user.backendToken = data.token || data.accessToken;
        user.id = data.user?.id || data.id;
        
        // ✅ CRITICAL FIX: Use the name and image from your database, not from Google
        user.name = data.user?.name || user.name;
        user.image = data.user?.image || user.image;
        
        console.log("=== OAuth Sign In ===");
        console.log("Backend returned name:", data.user?.name);
        console.log("Backend returned image:", data.user?.image);
        console.log("Using name:", user.name);
        console.log("Using image:", user.image);
        console.log("====================");
        
        return true;
      } else {
        console.error("Failed to create/update OAuth user:", data.error);
        return false;
      }
      
    } catch (error) {
      console.error("Error in signIn callback:", error);
      return false;
    }
  }
  
  return true;
},
    
    // JWT CALLBACK: Store backend token in JWT
    async jwt({ token, user, account, trigger, session }) {
      // On initial sign in, add backend token to NextAuth's token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image; // ✅ FIXED: Changed from token.picture to token.image
        
        // CRITICAL: Store the backend JWT token
        token.backendToken = user.backendToken;

        console.log("=== JWT Callback - New Sign In ===");
        console.log("User ID:", token.id);
        console.log("User Email:", token.email);
        console.log("User Image:", token.image); // ✅ Added for debugging
        console.log("Backend Token:", token.backendToken);
        console.log("================================");
      }

        if (trigger === "update") {
    if (session?.name) token.name = session.name;
    if (session?.image) token.image = session.image;
    
    // Also check session.user object
    if (session?.user?.name) token.name = session.user.name;
    if (session?.user?.image) token.image = session.user.image;
    
    console.log("=== JWT Token Updated ===");
    console.log("New Name:", token.name);
    console.log("New Image:", token.image);
    console.log("========================");
  }
      
      if (account) {
        token.provider = account.provider;
      }

      console.log("=== JWT Callback - Token Refresh ===");
      console.log("Current Token ID:", token.id);
      console.log("Current Token Email:", token.email);
      console.log("Current Token Image:", token.image); // ✅ Added for debugging
      console.log("Trigger:", trigger);
      console.log("===================================");
      
      return token;
    },
    
    // SESSION CALLBACK: Add backend token to session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string; // ✅ FIXED: Changed from token.imagePath to token.image
        
        if (token.provider) {
          session.user.provider = token.provider as string;
        }
        
        // CRITICAL: Add the backend token to session
        // This is the token you'll use in API requests
        session.accessToken = token.backendToken as string;
      }
      
      console.log("=== Session Callback ===");
      console.log("Session User Image:", session.user.image); // ✅ Added for debugging
      console.log("======================");
      
      return session;
    }
  },
  
  session: {
    strategy: "jwt",
  },
  
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`);
    },
  },
})