# Creating a Context Providers Package in Turborepo Monorepo

## Step 1: Create the Package Structure

```bash
# Navigate to packages directory
cd packages

# Create new package
mkdir context-providers
cd context-providers

# Initialize package
pnpm init
```

# When you run: pnpm init

package name: (@repo/context-providers)  # Press Enter (default is fine)
version: (1.0.0)                          # Press Enter (or type 0.0.0)
description:                              # Press Enter (leave empty or type: "Shared context providers for monorepo")
entry point: (index.js)                   # Type: src/index.ts
test command:                             # Press Enter (leave empty)
git repository:                           # Press Enter (leave empty)
keywords:                                 # Press Enter (leave empty)
author:                                   # Press Enter (or add your name)
license: (ISC)                            # Press Enter (default is fine)

Your structure should look like:
```
packages/
├── context-providers/
│   ├── src/
│   │   ├── theme/
│   │   │   └── theme-provider.tsx
│   │   ├── auth/
│   │   │   └── auth-provider.tsx
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── ui/
└── ...
```

---

## Step 2: Configure package.json

```json
{
  "name": "@repo/context-providers",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./theme": "./src/theme/theme-provider.tsx",
    "./auth": "./src/auth/auth-provider.tsx"
  },
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "eslint": "^8.57.0",
    "typescript": "^5.3.3"
  }
}
```

**Key Points:**
- `name`: Use `@repo/` prefix (matches your other packages)
- `main` and `types`: Point to TypeScript source (no build step needed in Turborepo)
- `exports`: Define what can be imported from your package
- `private: true`: Package won't be published to npm

---

## Step 3: Configure tsconfig.json

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Note:** This extends your shared TypeScript config. If you don't have `react-library.json`, use `base.json` instead.

---

## Step 4: Create Theme Provider

**File:** `packages/context-providers/src/theme/theme-provider.tsx`

```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ThemeMode = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");

  // Resolve theme based on mode
  useEffect(() => {
    if (mode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setResolvedTheme(mediaQuery.matches ? "dark" : "light");

      const handler = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      setResolvedTheme(mode);
    }
  }, [mode]);

  // Load saved preference
  useEffect(() => {
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setThemeMode }}>
      <div className={resolvedTheme}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
```

---

## Step 5: Create Index Barrel Export

**File:** `packages/context-providers/src/index.ts`

```typescript
// Theme Provider
export { ThemeProvider, useTheme } from "./theme/theme-provider";

// Auth Provider (if you have one)
// export { AuthProvider, useAuth } from "./auth/auth-provider";

// Add more providers as needed
```

This allows users to import like:
```typescript
import { ThemeProvider, useTheme } from "@repo/context-providers";
```

---

## Step 6: Add Dependency to Consumer Packages

### For Web App (`apps/web/package.json`)

```json
{
  "name": "web",
  "dependencies": {
    "@repo/context-providers": "workspace:*",
    "@repo/ui": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

### For UI Package (`packages/ui/package.json`)

```json
{
  "name": "@repo/ui",
  "dependencies": {
    "@repo/context-providers": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

**After updating package.json, run:**
```bash
pnpm install
```

---

## Step 7: Use in Your Web App

### Update Root Layout

**File:** `apps/web/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/components/providers/session-provider";
import { ThemeProvider } from "@repo/context-providers"; // Import from package

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <div className="bg-[#F1F5F9] dark:bg-[#0F172A] min-h-screen">
            <SessionProvider>
              {children}
            </SessionProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Use in Header Component

**File:** `apps/web/components/Header.tsx`

```typescript
"use client";

import { useTheme } from "@repo/context-providers"; // Import from package

export default function Header() {
  const { mode, setThemeMode } = useTheme();
  
  return (
    <div>
      {/* Your existing header code */}
      <div onClick={() => setThemeMode('dark')}>Dark</div>
      <div onClick={() => setThemeMode('light')}>Light</div>
      <div onClick={() => setThemeMode('system')}>System</div>
    </div>
  );
}
```

---

## Step 8: Use in UI Package Components

**File:** `packages/ui/src/components/theme-toggle.tsx`

```typescript
"use client";

import { useTheme } from "@repo/context-providers";

export function ThemeToggle() {
  const { mode, setThemeMode } = useTheme();
  
  return (
    <select 
      value={mode} 
      onChange={(e) => setThemeMode(e.target.value as any)}
    >
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

**Export from UI package:**

**File:** `packages/ui/src/index.ts`

```typescript
// Existing exports
export { Button } from "./components/button";
export { SignOutBtn } from "./components/sign-out-btn";

// New export
export { ThemeToggle } from "./components/theme-toggle";
```

**Use in your app:**

```typescript
import { ThemeToggle } from "@repo/ui";

export default function Page() {
  return <ThemeToggle />;
}
```

---

## Step 9: TypeScript Configuration

If you get type errors, update your app's `tsconfig.json`:

**File:** `apps/web/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@repo/context-providers": ["../../packages/context-providers/src"],
      "@repo/ui": ["../../packages/ui/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

## Step 10: Verify Installation

```bash
# From root of monorepo
pnpm install

# Type check
cd packages/context-providers
pnpm type-check

# Run your web app
cd ../../apps/web
pnpm dev
```

---

## Common Issues & Solutions

### Issue 1: "Cannot find module '@repo/context-providers'"

**Solution:**
```bash
# Clean and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Issue 2: "useTheme must be used within ThemeProvider"

**Solution:** Make sure `ThemeProvider` wraps your app in `layout.tsx` and that the component using `useTheme` has `"use client"` directive.

### Issue 3: Hot reload not working

**Solution:** Restart dev server after adding new package dependencies.

### Issue 4: TypeScript can't find types

**Solution:** Add to root `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@repo/context-providers": ["./packages/context-providers/src"]
    }
  }
}
```

---

## File Structure Checklist

```
student-life-manager/
├── apps/
│   └── web/
│       ├── app/
│       │   └── layout.tsx          ← Wrap with ThemeProvider
│       ├── components/
│       │   └── Header.tsx          ← Use useTheme()
│       ├── package.json            ← Add dependency
│       └── tsconfig.json
├── packages/
│   ├── context-providers/          ← NEW PACKAGE
│   │   ├── src/
│   │   │   ├── theme/
│   │   │   │   └── theme-provider.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/
│   │   ├── src/
│   │   │   └── components/
│   │   │       └── theme-toggle.tsx  ← Can use useTheme()
│   │   └── package.json            ← Add dependency
│   └── typescript-config/
└── package.json
```

---

## Benefits of This Approach

✅ **Centralized:** All context providers in one place  
✅ **Reusable:** Share across all apps (web, mobile, etc.)  
✅ **Type-safe:** Full TypeScript support  
✅ **No build step:** Direct source imports (faster in dev)  
✅ **Tree-shakeable:** Only import what you need  
✅ **Maintainable:** Single source of truth for global state  

---

## Adding More Providers

To add a new provider (e.g., Auth):

1. **Create file:** `packages/context-providers/src/auth/auth-provider.tsx`
2. **Export in index:** Update `src/index.ts`
3. **Update package.json exports:**
   ```json
   "exports": {
     ".": "./src/index.ts",
     "./theme": "./src/theme/theme-provider.tsx",
     "./auth": "./src/auth/auth-provider.tsx"
   }
   ```
4. **Use in app:**
   ```typescript
   import { AuthProvider } from "@repo/context-providers";
   ```

---

## Quick Command Reference

```bash
# Create package
cd packages && mkdir context-providers && cd context-providers && pnpm init

# Install dependencies in consuming packages
cd apps/web && pnpm add @repo/context-providers@workspace:*
cd packages/ui && pnpm add @repo/context-providers@workspace:*

# From monorepo root
pnpm install

# Type check all packages
pnpm -r type-check

# Run web app
pnpm --filter web dev
```

---

## Summary

1. ✅ Create `packages/context-providers`
2. ✅ Configure `package.json` with exports
3. ✅ Create providers (ThemeProvider, etc.)
4. ✅ Export from `index.ts`
5. ✅ Add `workspace:*` dependency to consumers
6. ✅ Run `pnpm install`
7. ✅ Import and use in your app

Your context providers are now shared across your entire monorepo! 🎉