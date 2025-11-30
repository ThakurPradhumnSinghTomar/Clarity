#  what folder used for what inside src inside a express app? 
   - config : 
   - controllers : 
   - services : 
   - routes : 
   - middlewares : 






# Tailwind CSS v4 Monorepo Setup

This guide covers setting up Tailwind CSS v4 in a monorepo with a shared UI package.

## Overview

- **UI Package**: `packages/ui` - Contains reusable React components with Tailwind
- **Web App**: `apps/web` - Imports and uses components from UI package
- **Tailwind Version**: v4 (CSS-first configuration, no config files needed)

---

## Setup Steps

### 1. Install Tailwind in UI Package

```bash
cd packages/ui
npm install tailwindcss
```

### 2. Create Styles in UI Package

Create `packages/ui/src/styles.css`:

```css
@import "tailwindcss";

@source "../src/**/*.{js,ts,jsx,tsx}";
```

### 3. Configure UI Package Exports

In `packages/ui/package.json`, ensure you're exporting both components and styles:

```json
{
  "name": "@repo/ui",
  "exports": {
    "./styles.css": "./src/styles.css",
    ".": "./src/index.ts"
  }
}
```

### 4. Export Components from UI Package

In `packages/ui/src/index.ts`:

```typescript
export { Button } from './components/Button';
export { Card } from './components/Card';
// Export all your components here
```

### 5. Install Tailwind in Web App

```bash
cd apps/web
npm install tailwindcss
```

### 6. Create Styles in Web App

Create your main CSS file:

**For Next.js**: `apps/web/src/app/globals.css`  
**For Vite/React**: `apps/web/src/index.css`

```css
@import "tailwindcss";
@import "@repo/ui/styles.css";

@source "../../packages/ui/src/**/*.{js,ts,jsx,tsx}";
@source "./src/**/*.{js,ts,jsx,tsx}";
```

### 7. Import CSS in Entry Point

**For Next.js** (`apps/web/src/app/layout.tsx`):

```tsx
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

**For Vite/React** (`apps/web/src/main.tsx`):

```tsx
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 8. Use Components in Web App

```tsx
import { Button, Card } from '@repo/ui';

function Page() {
  return (
    <div className="p-4">
      <Card className="mb-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
      </Card>
      <Button>Click me</Button>
    </div>
  );
}
```

---

## Key Differences in Tailwind v4

- ✅ No `tailwind.config.js` or `tailwind.config.ts` files
- ✅ CSS-first configuration using `@import` and `@source`
- ✅ Simpler setup, everything in CSS
- ✅ Use `@theme` directive for custom theme configuration

### Custom Theme Example

If you need custom colors, fonts, or breakpoints:

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --font-family-display: "Inter", sans-serif;
  --breakpoint-3xl: 1920px;
}

@source "../src/**/*.{js,ts,jsx,tsx}";
```

---

## Troubleshooting

### Styles not applying?
- Ensure `@source` paths are correct and point to all files using Tailwind classes
- Check that you've imported the CSS in your app's entry point
- Verify package exports in `package.json`

### Import errors?
- Make sure your UI package is properly linked in the monorepo
- Run `npm install` or your package manager's install command from the root
- Check that component exports match in `packages/ui/src/index.ts`

---

## Notes

- Tailwind will scan all files specified in `@source` directives
- The UI package's CSS is imported into the web app, ensuring consistent styling
- No build step needed for Tailwind - it processes CSS at runtime during development