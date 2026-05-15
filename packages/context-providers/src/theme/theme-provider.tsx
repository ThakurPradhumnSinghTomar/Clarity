"use client"; // This file runs on the client side in Next.js because it uses hooks,
// window.matchMedia, and localStorage (all browser-only APIs).

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

/*
|--------------------------------------------------------------------------
| Type Definitions
|--------------------------------------------------------------------------
*/

/*
ThemeMode:
- "light"  -> User explicitly wants light mode
- "dark"   -> User explicitly wants dark mode
- "system" -> Follow the operating system preference
*/
type ThemeMode = "system" | "light" | "dark";

/*
ResolvedTheme:
The actual theme currently applied to the UI.

Even if mode = "system", the resolved theme must be either:
- "light"
- "dark"

Examples:
- mode = "light"  -> resolvedTheme = "light"
- mode = "dark"   -> resolvedTheme = "dark"
- mode = "system" -> resolvedTheme depends on OS settings
*/
type ResolvedTheme = "light" | "dark";

/*
ThemeContextType:
Defines the shape of the object that will be shared through Context.

It contains:
1. mode           -> What the user selected
2. resolvedTheme  -> What is actually being used
3. setThemeMode   -> Function to update the selected mode
*/
interface ThemeContextType {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
}

/*
|--------------------------------------------------------------------------
| Create Context
|--------------------------------------------------------------------------
*/

/*
createContext creates a global context object.

Initial value = undefined.

Why undefined?
Because we want to detect when someone calls useTheme()
outside of ThemeProvider.

If that happens, we throw a clear error.
*/
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/*
|--------------------------------------------------------------------------
| ThemeProvider Component
|--------------------------------------------------------------------------
*/

/*
ThemeProvider wraps your application and provides theme data to all child components.

Usage:

<ThemeProvider>
  <App />
</ThemeProvider>

Any component inside can call useTheme().
*/
export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  /*
  ------------------------------------------------------------------------
  State: mode
  ------------------------------------------------------------------------

  Stores the user's selected preference.

  Initial value = "dark"

  Possible values:
  - "light"
  - "dark"
  - "system"
  */
  const [mode, setMode] = useState<ThemeMode>("dark");

  /*
  ------------------------------------------------------------------------
  State: resolvedTheme
  ------------------------------------------------------------------------

  Stores the actual theme being applied.

  If mode = "system", this becomes either "light" or "dark"
  depending on the operating system.

  Initial value = "dark"
  */
  const [resolvedTheme, setResolvedTheme] =
    useState<ResolvedTheme>("dark");

  /*
  |--------------------------------------------------------------------------
  | Effect 1: Resolve the Actual Theme
  |--------------------------------------------------------------------------
  |
  | Runs whenever `mode` changes.
  |
  | Cases:
  |
  | 1. mode = "light"
  |    -> resolvedTheme = "light"
  |
  | 2. mode = "dark"
  |    -> resolvedTheme = "dark"
  |
  | 3. mode = "system"
  |    -> Detect OS theme using matchMedia
  |    -> Listen for future OS theme changes
  */
  useEffect(() => {
    /*
    If the user selected "system",
    follow the operating system preference.
    */
    if (mode === "system") {
      /*
      window.matchMedia("(prefers-color-scheme: dark)")
      checks whether the OS is currently using dark mode.

      mediaQuery.matches:
      - true  -> system is dark
      - false -> system is light
      */
      const mediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      /*
      Set the initial resolved theme based on current OS setting.
      */
      setResolvedTheme(
        mediaQuery.matches ? "dark" : "light"
      );

      /*
      This handler runs whenever the system theme changes
      while the app is open.

      Example:
      - User changes Windows from light to dark
      - This function runs automatically
      - resolvedTheme updates
      */
      const handler = (e: MediaQueryListEvent) => {
        setResolvedTheme(
          e.matches ? "dark" : "light"
        );
      };

      /*
      Start listening for system theme changes.
      */
      mediaQuery.addEventListener("change", handler);

      /*
      Cleanup function.

      React calls this:
      - before the effect runs again
      - when the component unmounts

      This prevents memory leaks and duplicate listeners.
      */
      return () => {
        mediaQuery.removeEventListener(
          "change",
          handler
        );
      };
    } else {
      /*
      If mode is "light" or "dark",
      the resolved theme is exactly the same.
      */
      setResolvedTheme(mode);
    }
  }, [mode]); // Re-run whenever mode changes.

  /*
  |--------------------------------------------------------------------------
  | Effect 2: Load Saved Theme from localStorage
  |--------------------------------------------------------------------------
  |
  | Runs only once when ThemeProvider mounts.
  |
  | Reads the user's previous theme preference from localStorage.
  |
  | Example:
  | localStorage["theme-mode"] = "system"
  |
  | Then:
  | setMode("system")
  */
  useEffect(() => {
    /*
    Read saved value from browser storage.
    */
    const savedMode = localStorage.getItem(
      "theme-mode"
    ) as ThemeMode;

    /*
    If a value exists, restore it.
    */
    if (savedMode) {
      setMode(savedMode);
    }
  }, []); // Empty dependency array => run only once.

  /*
  |--------------------------------------------------------------------------
  | setThemeMode Function
  |--------------------------------------------------------------------------
  |
  | This is the function exposed to components.
  |
  | It does two things:
  | 1. Updates React state
  | 2. Saves preference to localStorage
  |
  | Example:
  | setThemeMode("light")
  */
  const setThemeMode = (newMode: ThemeMode) => {
    /*
    Update state immediately.
    */
    setMode(newMode);

    /*
    Persist the choice in browser storage.
    This allows the theme to remain after page refresh.
    */
    localStorage.setItem("theme-mode", newMode);
  };

  /*
  |--------------------------------------------------------------------------
  | Provider Return
  |--------------------------------------------------------------------------
  |
  | ThemeContext.Provider makes the value available to all descendants.
  |
  | Provided value:
  | {
  |   mode,
  |   resolvedTheme,
  |   setThemeMode
  | }
  |
  | Wrapping children in:
  | <div className={resolvedTheme}>
  |
  | adds either:
  | - class="light"
  | - class="dark"
  |
  | Tailwind can then use these classes with dark mode configuration.
  */
  return (
    <ThemeContext.Provider
      value={{
        mode,           // User preference: light/dark/system
        resolvedTheme,  // Actual applied theme: light/dark
        setThemeMode,   // Function to change theme
      }}
    >
      <div className={resolvedTheme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| Custom Hook: useTheme
|--------------------------------------------------------------------------
*/

/*
This custom hook provides convenient access to the ThemeContext.

Instead of writing:
const context = useContext(ThemeContext);

You can simply write:
const { mode, resolvedTheme, setThemeMode } = useTheme();
*/
export function useTheme() {
  /*
  Read the nearest ThemeContext.Provider value.
  */
  const context = useContext(ThemeContext);

  /*
  If no provider exists above this component,
  context will be undefined.
  */
  if (!context) {
    throw new Error(
      "useTheme must be used within ThemeProvider"
    );
  }

  /*
  Return the context object.
  */
  return context;
}

/*
==============================================================================
How to Use This Provider
==============================================================================

1. Wrap your application:

<ThemeProvider>
  <App />
</ThemeProvider>

2. Access the theme in any child component:

function ThemeSwitcher() {
  const {
    mode,
    resolvedTheme,
    setThemeMode,
  } = useTheme();

  return (
    <>
      <p>Selected Mode: {mode}</p>
      <p>Applied Theme: {resolvedTheme}</p>

      <button onClick={() => setThemeMode("light")}>
        Light
      </button>

      <button onClick={() => setThemeMode("dark")}>
        Dark
      </button>

      <button onClick={() => setThemeMode("system")}>
        System
      </button>
    </>
  );
}

==============================================================================
Flow Example
==============================================================================

1. User clicks "System"
2. setThemeMode("system")
3. mode becomes "system"
4. Saved to localStorage
5. Effect watching [mode] runs
6. window.matchMedia checks OS preference
7. resolvedTheme becomes "light" or "dark"
8. <div className={resolvedTheme}> updates
9. UI theme changes
10. If OS theme changes later, event listener updates resolvedTheme automatically
*/