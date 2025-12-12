# NextAuth Session Update Problem & Solution

## Problem Statement

When updating user profile data (name, image) in the backend, the NextAuth session would not reflect these changes until the user signed out and signed back in. This caused UI components (navbar, profile page) to display stale user information even after successful backend updates.

### Root Cause

NextAuth's session callback pulls user data from the JWT token, which is only populated during the initial sign-in. Simply updating the backend data doesn't automatically update the JWT token stored in the session.

```typescript
// The issue: token data is set only on sign-in
async jwt({ token, user }) {
  if (user) {
    token.name = user.name;
    token.image = user.image;
    // This only runs once during sign-in!
  }
  return token;
}
```

## Solution Implemented

### Step 1: Modified JWT Callback in `auth.ts`

Added support for manual token updates by handling the `update` trigger:

```typescript
async jwt({ token, user, account, trigger, session }) {
  // On initial sign in
  if (user) {
    token.id = user.id;
    token.email = user.email;
    token.name = user.name;
    token.image = user.image;
    token.backendToken = user.backendToken;
  }
  
  // ✅ Handle manual session updates
  if (trigger === "update" && session) {
    // `session` parameter contains data passed to update()
    if (session.name) token.name = session.name;
    if (session.image) token.image = session.image;
  }
  
  if (account) {
    token.provider = account.provider;
  }
  
  return token;
}
```

### Step 2: Updated Profile Save Handler

Modified `handleSave` to call NextAuth's `update()` function after backend update:

```typescript
const { data: session, update } = useSession(); // Added `update`

const handleSave = async () => {
  try {
    // 1. Save to backend
    const response = await fetch(`${BACKEND_URL}/api/user/update-profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: editData.name,
        image: editData.image
      })
    });

    if (!response.ok) throw new Error("Failed to update profile");

    // 2. Update local state
    setProfileData({ ...editData });
    
    // 3. Update NextAuth session/token
    await update({
      name: editData.name,
      image: editData.image
    });

    setIsEditing(false);
    setImagePreview(null);
    
  } catch (error) {
    console.error("Failed to save profile:", error);
    alert("Failed to save changes.");
  }
};
```

## How It Works

1. **User updates profile** → `handleSave()` is called
2. **Backend is updated** → New data saved to database
3. **Local state is updated** → UI shows new data immediately
4. **`update()` is called** → Triggers JWT callback with `trigger: "update"`
5. **JWT token is updated** → New values merged into token
6. **Session callback runs** → Session receives updated token values
7. **UI components refresh** → Navbar, profile page show new data

## Key Insights

- The `session` parameter in the JWT callback is **NOT** the current session object—it's the data passed to the `update()` function
- This approach avoids an extra backend API call to fetch fresh data
- The solution ensures immediate UI updates across all components that use the session
- No sign-out/sign-in required for changes to take effect

## Alternative Approach Considered

Fetching fresh data from backend in JWT callback when `trigger === "update"`:

```typescript
if (trigger === "update") {
  const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
    headers: { 'Authorization': `Bearer ${token.backendToken}` }
  });
  const data = await response.json();
  token.name = data.name;
  token.image = data.image;
}
```

**Not implemented because:** Adds unnecessary network overhead when we already have the updated values from the profile save operation.