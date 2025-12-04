// types/next-auth.d.ts
// TypeScript declaration file for extending NextAuth types
// This allows TypeScript to understand our custom user/session properties

import { DefaultSession } from "next-auth"

// MODULE AUGMENTATION: Extend the existing next-auth module
declare module "next-auth" {
  
  // Extend the Session interface
  // This defines what data is available in session.user
  interface Session {
    user: {
      id: string  // Add custom 'id' field to user object
      provider?: string
    } & DefaultSession["user"]  // Keep all default fields (name, email, image)
  }

  // Extend the User interface
  // This defines what data comes back from the authorize() function
  interface User {
    id: string       // User's unique ID
    email: string    // User's email address
    name?: string    // User's name (optional - indicated by ?)
    provider?: string
    // Add more custom fields as needed (role, avatar, etc.)
  }
}

// Extend the JWT module
declare module "next-auth/jwt" {
  // Extend the JWT interface
  // This defines what data is stored in the JWT token
  interface JWT {
    id: string  // Add custom 'id' field to JWT
    // Add more custom fields that should be in the token
  }
}