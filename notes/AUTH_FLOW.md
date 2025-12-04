# 🔐 Authentication Flow Documentation

## Overview

Your application uses **NextAuth.js (Auth.js v5)** for authentication with three sign-in methods:
1. **Credentials** (Email/Password)
2. **Google OAuth**
3. **GitHub OAuth**

All user data is stored in **MongoDB** using **Prisma ORM**.

---

## 📊 Authentication Architecture

```
┌─────────────────┐
│   Next.js App   │
│   (Frontend)    │
└────────┬────────┘
         │
         │ NextAuth.js
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌─────────┐  ┌──────────────┐
│  OAuth  │  │ Credentials  │
│ (Google │  │ (Email/Pass) │
│ GitHub) │  │              │
└────┬────┘  └──────┬───────┘
     │              │
     │              │
     ▼              ▼
┌──────────────────────────┐
│   Backend API (Node.js)  │
│   Express + Prisma       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────┐
│     MongoDB      │
│  (User Storage)  │
└──────────────────┘
```

---

## 🔄 Flow 1: Credentials Sign-Up (Email/Password)

### Step-by-Step Process:

1. **User fills signup form** (custom signup page)
   - Inputs: Email, Name, Password
   
2. **Frontend → Backend**
   ```javascript
   POST /api/auth/signup
   Body: { email, name, password }
   ```

3. **Backend Processing**
   - Hash password (bcrypt)
   - Check if email already exists
   - Create user in MongoDB via Prisma
   ```javascript
   prisma.user.create({
     email, name, 
     password: hashedPassword,
     provider: "credentials"
   })
   ```

4. **Response**
   - Success: User created → Redirect to login
   - Error: Email exists or validation failed

5. **User signs in** (goes to Flow 2)

---

## 🔄 Flow 2: Credentials Sign-In (Email/Password)

### Step-by-Step Process:

1. **User fills login form**
   - Inputs: Email, Password

2. **NextAuth `Credentials` Provider**
   - Triggers `authorize()` function

3. **Frontend → Backend**
   ```javascript
   POST /api/auth/login
   Body: { email, password }
   ```

4. **Backend Verification**
   - Find user by email in MongoDB
   - Compare password with hash
   ```javascript
   const user = await prisma.user.findUnique({ where: { email } })
   const valid = await bcrypt.compare(password, user.password)
   ```

5. **Backend Response**
   - Valid: Return user object `{ id, email, name }`
   - Invalid: Return error

6. **NextAuth Processing**
   - `authorize()` returns user → Success
   - NextAuth creates **JWT token**
   - Stores token in **HTTP-only cookie**

7. **Callbacks Execute**
   - `jwt()` callback: Add user data to token
   - `session()` callback: Make token data available to frontend

8. **User is authenticated** ✅

---

## 🔄 Flow 3: OAuth Sign-In (Google/GitHub)

### Step-by-Step Process:

1. **User clicks "Sign in with Google/GitHub"**

2. **NextAuth redirects to OAuth provider**
   - User authenticates on Google/GitHub
   - User grants permissions

3. **OAuth provider redirects back with user data**
   - Data includes: email, name, profile picture, provider ID

4. **NextAuth `signIn()` Callback Triggers**
   - Detects OAuth provider (Google/GitHub)

5. **Frontend → Backend**
   ```javascript
   POST /api/auth/oauth-user
   Body: {
     email,
     name,
     image,
     provider: "google" | "github",
     providerId: "unique_oauth_id"
   }
   ```

6. **Backend Processing**
   - Check if user exists by email
   - **If exists**: Update user info (name, image, lastLogin)
   - **If new**: Create user in MongoDB
   ```javascript
   prisma.user.upsert({
     where: { email },
     update: { name, image, lastLogin: new Date() },
     create: { email, name, image, provider, providerId }
   })
   ```

7. **Backend Response**
   - Success: Return user `{ id, email, name, image }`
   - `signIn()` callback returns `true` → Allow sign-in

8. **NextAuth Processing**
   - Creates **JWT token** with user data
   - Stores token in **HTTP-only cookie**

9. **Callbacks Execute**
   - `jwt()` callback: Add user data + provider info to token
   - `session()` callback: Make data available to frontend

10. **User is authenticated** ✅

---

## 🎫 Session Management

### JWT Strategy

Your app uses **JWT (JSON Web Token)** strategy:

```javascript
session: { strategy: "jwt" }
```

**How it works:**
- Token is encrypted and stored in HTTP-only cookie
- No database queries for session checks (stateless)
- Fast and scalable

**Token Contents:**
```javascript
{
  id: "user_id",
  email: "user@example.com",
  name: "User Name",
  picture: "profile_image_url",
  provider: "google" | "github" | "credentials"
}
```

---

## 🔐 Security Features

### 1. **Password Security (Credentials)**
- Passwords hashed with bcrypt before storage
- Never stored in plain text
- Never sent in responses

### 2. **JWT Security**
- Tokens stored in **HTTP-only cookies** (not accessible via JavaScript)
- Protected against XSS attacks
- Auto-encrypted by NextAuth

### 3. **OAuth Security**
- Users authenticated by trusted providers (Google/GitHub)
- Email already verified by OAuth provider
- No password needed in your database

### 4. **Database Security**
```javascript
// OAuth users have NO password
{
  email: "user@gmail.com",
  password: null,  // ← No password stored
  provider: "google"
}
```

---

## 📝 Database Schema

```javascript
model User {
  id            String    // MongoDB ObjectId
  email         String    @unique
  name          String?
  password      String?   // NULL for OAuth users
  image         String?   // Profile picture (OAuth)
  
  // OAuth tracking
  provider      String?   // "google", "github", "credentials"
  providerId    String?   // OAuth provider's user ID
  emailVerified DateTime? // Auto-set for OAuth
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLogin     DateTime?
}
```

---

## 🔍 Key Concepts

### 1. **Providers**
Different ways users can sign in:
- `credentials`: Email/Password
- `google`: Google OAuth
- `github`: GitHub OAuth

### 2. **Callbacks**
Functions that run at specific points:
- `signIn()`: When user signs in (create/update OAuth users)
- `jwt()`: When token is created (add custom data)
- `session()`: When session is accessed (make data available)

### 3. **Separation of Concerns**
- **NextAuth**: Handles authentication flow
- **Backend API**: Handles database operations
- **Frontend**: Handles UI and user input

### 4. **OAuth vs Credentials**
| Feature | OAuth | Credentials |
|---------|-------|-------------|
| Password | ❌ No | ✅ Yes |
| Email Verified | ✅ Auto | ❌ Manual |
| User Creation | On first login | On signup |
| Backend API Call | `oauth-user` | `signup` then `login` |

---

## 🚀 Authentication Flow Summary

```
Signup (Credentials)
└─→ Backend creates user with hashed password

Login (Credentials)
└─→ Backend verifies password
    └─→ NextAuth creates JWT session

Login (OAuth)
└─→ User authenticates with Google/GitHub
    └─→ NextAuth receives user data
        └─→ Backend creates/updates user
            └─→ NextAuth creates JWT session

All flows end with:
└─→ JWT token stored in HTTP-only cookie
    └─→ User is authenticated ✅
```

---

## 💡 Quick Reference

**Check if user is logged in (Frontend):**
```javascript
import { useSession } from "next-auth/react"
const { data: session } = useSession()
// session.user.id, session.user.email, etc.
```

**Check auth on server (Server Component/API):**
```javascript
import { auth } from "@/auth"
const session = await auth()
// session.user.id, session.user.email, etc.
```

**Sign out:**
```javascript
import { signOut } from "next-auth/react"
await signOut()
```

---

## 📌 Important Notes

1. **OAuth users don't have passwords** in your database
2. **JWT tokens are stateless** - no database queries for auth checks
3. **HTTP-only cookies** prevent XSS attacks
4. **Backend validates all auth requests** before database operations
5. **Provider info is tracked** for analytics and user management

---

*Last Updated: Dec2025*