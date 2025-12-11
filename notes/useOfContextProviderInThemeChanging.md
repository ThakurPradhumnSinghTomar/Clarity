# React Context API - Complete Guide

## What is Context?

Context provides a way to pass data through the component tree **without having to pass props down manually at every level** (prop drilling).

### Problem it Solves: Prop Drilling

```jsx
// WITHOUT Context - Prop Drilling Hell 😢
<App theme="dark">
  <Header theme="dark">
    <Navbar theme="dark">
      <UserMenu theme="dark">
        <ThemeToggle theme="dark" /> // Finally used here!
      </UserMenu>
    </Navbar>
  </Header>
</App>

// WITH Context - Clean! 🎉
<ThemeProvider theme="dark">
  <App>
    <Header>
      <Navbar>
        <UserMenu>
          <ThemeToggle /> // Directly accesses theme from context
        </UserMenu>
      </Navbar>
    </Header>
  </App>
</ThemeProvider>
```

---

## Core Concepts

### 1. **Context Object**
Created using `createContext()` - holds the shared data structure.

```typescript
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
```

### 2. **Provider Component**
Wraps part of your app and **provides** the context value to all children.

```jsx
<ThemeContext.Provider value={{ theme, setTheme }}>
  {children}
</ThemeContext.Provider>
```

### 3. **Consumer/Hook**
Components access context via `useContext()` hook (or Context.Consumer).

```jsx
const { theme, setTheme } = useContext(ThemeContext);
```

---

## Implementation Pattern

### Step 1: Create Context + Provider

```typescript
// theme-context.tsx
"use client";

import { createContext, useContext, useState } from "react";

// 1. Define TypeScript types
interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

// 2. Create Context with default value (usually undefined)
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 3. Create Provider Component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("light");

  // Value object contains all data/functions you want to share
  const value = { theme, setTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 4. Create Custom Hook (best practice)
export function useTheme() {
  const context = useContext(ThemeContext);
  
  // Error handling - ensures hook is used inside Provider
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  
  return context;
}
```

### Step 2: Wrap Your App

```jsx
// app/layout.tsx or _app.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>  {/* Wrap at the top level */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 3: Consume Anywhere

```jsx
// Any child component, any level deep
"use client";

import { useTheme } from "@/contexts/theme-context";

export function ThemeButton() {
  const { theme, setTheme } = useTheme();  // Direct access!
  
  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current: {theme}
    </button>
  );
}
```

---

## Key Rules & Best Practices

### ✅ DO's

1. **Create custom hooks** for context consumption (cleaner API)
   ```typescript
   export function useTheme() {
     const context = useContext(ThemeContext);
     if (!context) throw new Error("...");
     return context;
   }
   ```

2. **Separate concerns** - One context per logical domain
   - `ThemeProvider` for theme
   - `AuthProvider` for authentication
   - `CartProvider` for shopping cart

3. **Memoize expensive values** with `useMemo`
   ```typescript
   const value = useMemo(() => ({ theme, setTheme }), [theme]);
   ```

4. **Split contexts** if parts update at different frequencies
   ```typescript
   // Instead of one large context:
   <UserContext>  // Name changes rarely
   <SettingsContext>  // Settings change often
   ```

### ❌ DON'Ts

1. **Don't use for frequently changing values** (every keystroke, mouse move)
   - Context triggers re-render of ALL consumers
   - Use local state or state management libraries instead

2. **Don't skip the custom hook error check**
   ```typescript
   // BAD - Silent failures
   const context = useContext(ThemeContext);
   
   // GOOD - Clear error messages
   if (!context) throw new Error("Must be used within Provider");
   ```

3. **Don't create unnecessary contexts**
   - If only 2-3 levels deep, props are fine
   - If only 1-2 components need it, lift state instead

---

## Advanced Patterns

### Multiple Contexts

```jsx
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <YourApp />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### Context with Reducer

```typescript
const [state, dispatch] = useReducer(reducer, initialState);

return (
  <StateContext.Provider value={state}>
    <DispatchContext.Provider value={dispatch}>
      {children}
    </DispatchContext.Provider>
  </StateContext.Provider>
);
```

### Preventing Unnecessary Re-renders

```typescript
// Split into two contexts
const ThemeValueContext = createContext();
const ThemeUpdaterContext = createContext();

// Components that only READ theme use ThemeValueContext
// Components that only UPDATE theme use ThemeUpdaterContext
// This prevents re-renders when theme changes!
```

---

## Real-World Use Cases

| Use Case | Why Context? |
|----------|-------------|
| **Theme switching** | Needs to affect entire app, updated infrequently |
| **User authentication** | User data needed in many components (navbar, profile, routes) |
| **Language/i18n** | Translation strings accessed everywhere |
| **Shopping cart** | Cart state needed in multiple unrelated components |
| **Feature flags** | Configuration accessed throughout app |

---

## Interview Questions & Answers

### Q: When should you use Context vs Props?

**Use Props when:**
- Passing data 1-2 levels down
- Component is reusable and needs explicit data
- Data is component-specific

**Use Context when:**
- Data needed by many components at different nesting levels
- Avoiding prop drilling through 3+ levels
- Data is "global" in nature (theme, auth, locale)

### Q: What are the performance concerns with Context?

**Answer:**
- Every context consumer re-renders when context value changes
- This is fine for infrequent updates (theme, auth)
- For frequent updates, split contexts or use state management libraries
- Always memoize context value to prevent reference changes:
  ```typescript
  const value = useMemo(() => ({ state, dispatch }), [state]);
  ```

### Q: Context vs Redux/Zustand?

**Context:**
- Built into React
- Great for simple global state
- No extra dependencies
- Can cause re-render issues at scale

**State Management Libraries:**
- Better performance (selective subscriptions)
- DevTools, middleware, time-travel debugging
- Better for complex state logic
- More boilerplate

**Rule of thumb:** Start with Context, migrate to Redux/Zustand when you hit performance issues or need advanced features.

---

## Common Gotcha: "use client" in Next.js

```typescript
// ⚠️ Context Providers MUST be Client Components
"use client";  // Required!

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  // ...
}
```

**Why?** Context uses React hooks (`useState`, `useEffect`) which only work in Client Components.

**Solution:** Keep providers as Client Components, but they can wrap Server Components:

```jsx
// layout.tsx (Server Component)
export default function Layout({ children }) {
  return (
    <ThemeProvider>  {/* Client Component */}
      {children}  {/* Can be Server Components! */}
    </ThemeProvider>
  );
}
```

---

## Quick Reference Template

```typescript
// 1. Create context file: contexts/my-context.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface MyContextType {
  value: string;
  setValue: (value: string) => void;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

export function MyProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState("");
  
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) throw new Error("useMyContext must be used within MyProvider");
  return context;
}

// 2. Wrap app: layout.tsx
<MyProvider>
  <App />
</MyProvider>

// 3. Use anywhere:
const { value, setValue } = useMyContext();
```

---

## Summary Cheat Sheet

| Concept | Purpose |
|---------|---------|
| `createContext()` | Creates context object |
| `<Context.Provider>` | Wraps tree and provides value |
| `useContext(Context)` | Accesses context in child |
| Custom hook | Cleaner API + error handling |
| "use client" | Required for Next.js App Router |
| `useMemo` | Prevents unnecessary re-renders |

**Remember:** Context is about **dependency injection** for React - making data available deep in the tree without manually passing it through every level.