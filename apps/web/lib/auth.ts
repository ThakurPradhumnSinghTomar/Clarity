// auth.ts - FIXED VERSION WITH DETAILED LOGGING
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
            image: data.image || data.user?.image,
            backendToken: data.token || data.accessToken,
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
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
          
          console.log("=== OAuth Sign In Attempt ===");
          console.log("Backend URL:", backendUrl);
          console.log("Provider:", account.provider);
          console.log("Email:", user.email);
          console.log("Name:", user.name);
          console.log("Image:", user.image);
          console.log("Provider Account ID:", account.providerAccountId);
          
          // Prepare the payload
          const payload = {
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account.provider,
            providerId: account.providerAccountId,
          };
          
          console.log("Payload being sent:", JSON.stringify(payload, null, 2));
          
          // Call your backend API to create/update user and GET THE TOKEN
          const response = await fetch(`${backendUrl}/api/auth/oauth-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          console.log("Backend Response Status:", response.status);
          console.log("Backend Response Status Text:", response.statusText);
          console.log("Backend Response OK:", response.ok);
          
          // Try to parse JSON response
          let data;
          try {
            const responseText = await response.text();
            console.log("Raw Backend Response:", responseText);
            
            data = JSON.parse(responseText);
            console.log("Parsed Backend Response Data:", JSON.stringify(data, null, 2));
          } catch (parseError) {
            console.error("❌ Failed to parse backend response as JSON");
            console.error("Parse Error:", parseError);
            console.error("This might mean your backend isn't running or returned HTML instead of JSON");
            return false;
          }

          if (response.ok && data.success) {
            // ✅ Update user object with backend data
            user.backendToken = data.token || data.accessToken;
            user.id = data.user?.id || data.id;
            user.name = data.user?.name || user.name;
            user.image = data.user?.image || user.image;
            
            console.log("✅ OAuth Sign In Success");
            console.log("User ID:", user.id);
            console.log("User Name:", user.name);
            console.log("User Image:", user.image);
            console.log("Backend Token:", user.backendToken);
            console.log("=============================");
            
            return true;
          } else {
            console.error("❌ Backend returned error or success=false");
            console.error("Response Status:", response.status);
            console.error("Success Flag:", data.success);
            console.error("Error Message:", data.error);
            console.error("Full Response:", JSON.stringify(data, null, 2));
            return false;
          }
          
        } catch (error) {
          console.error("❌ Exception in signIn callback");
          console.error("Error Type:", error?.constructor?.name);
          console.error("Error Message:", error instanceof Error ? error.message : String(error));
          console.error("Error Stack:", error instanceof Error ? error.stack : 'No stack trace');
          
          // Check if it's a network error
          if (error instanceof TypeError && error.message.includes('fetch')) {
            console.error("🔥 NETWORK ERROR: Cannot reach backend at", process.env.NEXT_PUBLIC_BACKEND_URL);
            console.error("Make sure your backend is running!");
          }
          
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
        token.image = user.image;
        
        // CRITICAL: Store the backend JWT token
        token.backendToken = user.backendToken;

        console.log("=== JWT Callback - New Sign In ===");
        console.log("User ID:", token.id);
        console.log("User Email:", token.email);
        console.log("User Image:", token.image);
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
      console.log("Current Token Image:", token.image);
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
        session.user.image = token.image as string;
        
        if (token.provider) {
          session.user.provider = token.provider as string;
        }
        
        // CRITICAL: Add the backend token to session
        session.accessToken = token.backendToken as string;
      }
      
      console.log("=== Session Callback ===");
      console.log("Session User Image:", session.user.image);
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