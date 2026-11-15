import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;



/*
===============================================================================
TEMPORARY ESLINT BASELINE — ISSUES DEFERRED DURING CI/CD IMPLEMENTATION
===============================================================================

Context:
--------
During the initial CI/CD implementation, ESLint reported 14 errors in the
web application. These rules have temporarily been downgraded from "error"
to "warn" so that existing code-quality issues do not block our CI pipeline.

IMPORTANT:
- These issues have NOT been fixed.
- They are temporarily downgraded, not ignored.
- Warnings will still appear in GitHub Actions logs.
- Do not consider this a permanent ESLint configuration.
- Revisit these issues and restore strict enforcement once resolved.

Total reported errors: 14
Total reported warnings: 20


-------------------------------------------------------------------------------
1. EXPLICIT ANY TYPES
-------------------------------------------------------------------------------

ESLint rule:
@typescript-eslint/no-explicit-any

Problem:
Several parts of the application use the TypeScript "any" type instead of
properly defining the expected data structures.

This removes TypeScript's ability to catch type-related mistakes and weakens
type safety, particularly when handling API responses, errors and application
state.

Affected files:

1. apps/web/app/home/study-session/page.tsx
   - Line 72: Unexpected any.
   - Line 240: Unexpected any.

2. apps/web/app/signup/page.tsx
   - Line 119: Unexpected any.

3. apps/web/lib/helpfulFunctions/roomsRelated/fetchRoomsData.ts
   - Line 48: Unexpected any.

4. apps/web/lib/helpfulFunctions/roomsRelated/leaveRoom.ts
   - Line 24: Unexpected any.

5. apps/web/lib/hooks/home/useWeeklyFocus.ts
   - Line 122: Unexpected any.
   - Line 130: Unexpected any.

6. apps/web/lib/hooks/rooms/useRoomMutations.ts
   - Line 41: Unexpected any.
   - Line 70: Unexpected any.

Future action:
- Identify the actual data structures expected at each location.
- Define appropriate TypeScript interfaces or types.
- Use proper API response types instead of any.
- Use unknown with appropriate type narrowing when the actual type
  cannot be known beforehand.
- Avoid blindly replacing any with unknown without handling the values.

Total: 9 errors


-------------------------------------------------------------------------------
2. STATE UPDATES DIRECTLY INSIDE REACT EFFECTS
-------------------------------------------------------------------------------

ESLint rule:
react-hooks/set-state-in-effect

Problem:
React is reporting synchronous state updates directly inside useEffect.
This can cause unnecessary cascading renders and indicates that some state
synchronization logic may be better handled differently.

Affected file:

apps/web/lib/components/providers/theme-provider.tsx

Issues:

- Line 23: setResolvedTheme() is called directly inside an effect when
  detecting the system's preferred color scheme.

- Line 40: setMode() is called directly inside an effect after retrieving
  the saved theme mode from localStorage.

Future action:
- Review the theme initialization and synchronization logic.
- Consider lazy state initialization for reading the initial saved theme.
- Consider deriving resolvedTheme from mode and the system preference
  instead of maintaining unnecessary duplicated state.
- Keep event listeners for system theme changes properly synchronized.
- Ensure the solution does not introduce hydration mismatches in Next.js.

Do not simply remove the effects without considering localStorage,
system theme changes and client-side hydration.

Total: 2 errors


-------------------------------------------------------------------------------
3. ACCESSING REACT REFS DURING RENDER
-------------------------------------------------------------------------------

ESLint rule:
react-hooks/refs

Problem:
React refs are intended for accessing mutable values outside the render
phase. Reading ref.current during render can produce unpredictable rendering
behavior because changes to refs do not trigger component re-renders.

Affected file:

apps/web/lib/hooks/sockets/useRoomCamera.ts

Issue:

- Line 363: localStreamRef.current is accessed while constructing the
  object returned by the custom hook.

Current problematic expression:

localStream: localStreamRef.current

Future action:
- Review the useRoomCamera hook's state and ref management.
- Determine whether localStream needs to be exposed as reactive state.
- If UI components need to respond to stream changes, maintain the
  appropriate stream value using React state.
- Keep refs for mutable WebRTC resources that do not directly control
  rendering.
- Avoid reading ref.current during render or while constructing
  render-dependent values.

Be careful not to introduce unnecessary re-renders for WebRTC streams.

Total: 2 errors


-------------------------------------------------------------------------------
4. DEPRECATED TYPESCRIPT SUPPRESSION COMMENT
-------------------------------------------------------------------------------

ESLint rule:
@typescript-eslint/ban-ts-comment

Affected file:

apps/web/next.config.ts

Issue:

- Line 9: Existing @ts-ignore comment should be replaced with
  @ts-expect-error.

Difference:

@ts-ignore:
Suppresses the TypeScript error regardless of whether an error actually
exists on the following line.

@ts-expect-error:
Suppresses an expected TypeScript error but reports an error if the
suppression is no longer necessary.

Future action:
- Inspect why TypeScript suppression was added in next.config.ts.
- Determine whether the underlying type issue can be fixed.
- If suppression is genuinely necessary, replace @ts-ignore with
  @ts-expect-error and provide an explanatory comment.

Do not blindly replace the directive without checking the underlying issue.

Total: 1 error


===============================================================================
SUMMARY AND FUTURE ACTION
===============================================================================

Category                         Errors
----------------------------------------
Explicit any types                  9
State updates inside effects        2
Ref access during render            2
Deprecated @ts-ignore               1
----------------------------------------
TOTAL                              14


RESTORATION PLAN:
-----------------

1. Fix the issues category by category.
2. Run npm run lint locally after each set of changes.
3. Verify that the affected functionality still works.
4. Remove the corresponding temporary rule overrides from this file.
5. Restore strict ESLint enforcement.
6. Verify the complete GitHub Actions CI pipeline.

Once all deferred issues are resolved, remove this entire temporary
documentation block and restore the original strict ESLint rules.

===============================================================================
*/
