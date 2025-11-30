# TypeScript Types & Packages Configuration in Turborepo

## Overview
This document explains how to properly store and share TypeScript types across packages and apps in our Turborepo monorepo.

## Monorepo Structure
```
root/
├── apps/
│   ├── web/                    # Next.js app
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── mobile/                 # React Native app (optional)
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── types/                  # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── models/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── components/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── typescript-config/      # Shared TS configs
│       ├── base.json
│       ├── nextjs.json
│       └── react-library.json
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

## 1. Types Package Configuration

### `packages/types/package.json`
```json
{
  "name": "@repo/types",
  "version": "0.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

### `packages/types/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Example Type Definitions

**`packages/types/src/models/user.ts`:**
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export type UserRole = 'admin' | 'user' | 'guest';

export interface UserWithRole extends User {
  role: UserRole;
}
```

**`packages/types/src/models/product.ts`:**
```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export type ProductStatus = 'active' | 'inactive' | 'archived';
```

**`packages/types/src/index.ts`:**
```typescript
// Export all types from a central location
export * from './models/user';
export * from './models/product';
```

## 2. UI Package Configuration

### `packages/ui/package.json`
```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./button": {
      "types": "./dist/button.d.ts",
      "default": "./dist/button.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint .",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@repo/types": "*",
    "react": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

### `packages/ui/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "composite": true,
    "paths": {
      "@repo/types": ["../types/src"]
    }
  },
  "include": ["src/**/*"],
  "references": [
    {
      "path": "../types"
    }
  ],
  "exclude": ["node_modules", "dist"]
}
```

### Example UI Component Using Types

**`packages/ui/src/components/UserCard.tsx`:**
```typescript
import type { User, UserRole } from '@repo/types';

export interface UserCardProps {
  user: User;
  role: UserRole;
  onEdit?: (userId: string) => void;
}

export function UserCard({ user, role, onEdit }: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <span>Role: {role}</span>
      {onEdit && (
        <button onClick={() => onEdit(user.id)}>Edit</button>
      )}
    </div>
  );
}
```

**`packages/ui/src/index.ts`:**
```typescript
// Export all components
export * from './components/UserCard';
export * from './components/Button';

// Re-export types for convenience (optional)
export type { User, UserRole } from '@repo/types';
```

## 3. Web App Configuration

### `apps/web/package.json`
```json
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@repo/types": "*",
    "@repo/ui": "*",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

### `apps/web/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "@repo/types": ["../../packages/types/src"],
      "@repo/ui": ["../../packages/ui/src"]
    },
    "composite": false
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "references": [
    {
      "path": "../../packages/types"
    },
    {
      "path": "../../packages/ui"
    }
  ],
  "exclude": ["node_modules"]
}
```

### Using Types and Components in Web App

**`apps/web/src/app/page.tsx`:**
```typescript
import { UserCard } from '@repo/ui';
import type { User } from '@repo/types';

export default function Home() {
  const user: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date()
  };

  return (
    <main>
      <h1>User Profile</h1>
      <UserCard 
        user={user} 
        role="admin"
        onEdit={(id) => console.log('Edit user:', id)}
      />
    </main>
  );
}
```

## 4. Turborepo Configuration

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", ".expo/**"]
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

## 5. Build & Development Workflow

### Build Order

The dependency chain:
```
@repo/types → @repo/ui → apps/web
```

### Commands
```bash
# Install all dependencies
pnpm install

# Build everything in correct order
turbo build

# Build specific packages
turbo build --filter=@repo/types
turbo build --filter=@repo/ui
turbo build --filter=web

# Development mode (builds dependencies first)
turbo dev

# Clean all build outputs
turbo clean

# Lint all packages
turbo lint
```

### Development with Watch Mode

For optimal development experience, run these in separate terminals:
```bash
# Terminal 1: Watch types package
cd packages/types
pnpm dev

# Terminal 2: Watch UI package
cd packages/ui
pnpm dev

# Terminal 3: Run web app
cd apps/web
pnpm dev
```

## 6. Best Practices

### Do's ✅

- **Always build packages before running dev** - Run `turbo build` at least once
- **Use composite projects** - Set `"composite": true` in package tsconfigs
- **Use project references** - Add `references` array in consuming packages
- **Namespace packages** - Use `@repo/` prefix for internal packages
- **Export from index** - Centralize exports in `index.ts` files
- **Use path aliases** - Configure `paths` in tsconfig for clean imports
- **Version control** - Add `dist/` folders to `.gitignore`

### Don'ts ❌

- **Don't commit build outputs** - Keep `dist/` folders out of git
- **Don't skip the build step** - Packages need to be built before use
- **Don't use relative imports** - Use package names like `@repo/types`
- **Don't duplicate types** - Keep all shared types in `@repo/types`

### TypeScript Configuration Tips

1. **Shared configs**: Create base configs in `packages/typescript-config`
2. **Composite projects**: Enable better IDE performance with project references
3. **Strict mode**: Always enable `strict: true` for better type safety
4. **Declaration maps**: Enable for better "Go to Definition" in IDEs

## 7. Troubleshooting

### Types not resolving

1. Ensure packages are built:
```bash
   turbo build --filter=@repo/types
```

2. Restart TypeScript server in VS Code:
   - `Cmd/Ctrl + Shift + P`
   - Type: "TypeScript: Restart TS Server"

3. Check `node_modules` links:
```bash
   pnpm install
```

### Build errors

1. Clean and rebuild:
```bash
   turbo clean
   turbo build
```

2. Check for circular dependencies in package.json files

3. Verify `references` paths in tsconfig.json are correct

### IDE not showing types

1. Check `paths` configuration in tsconfig.json
2. Ensure `composite: true` in package tsconfigs
3. Verify package names match in package.json and imports
4. Restart IDE completely

## 8. Alternative Approach: Source-Only (No Build)

If you prefer not to build packages, use source directly:

### `packages/types/package.json`
```json
{
  "name": "@repo/types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

### Pros & Cons

**Pros:**
- Simpler setup, no build step needed
- Faster to get started
- Changes reflect immediately

**Cons:**
- Slower app builds (more code to compile)
- Less clear separation of concerns
- Harder to catch type errors early

**Recommendation:** Use the build approach for production projects, source-only for rapid prototyping.

## 9. Adding New Types

1. Create type file in `packages/types/src/models/`
2. Export from `packages/types/src/index.ts`
3. Build the types package: `pnpm build`
4. Use in any app or package: `import type { YourType } from '@repo/types'`

## 10. Adding New Packages

1. Create package directory structure
2. Add `package.json` with proper `name` and `exports`
3. Add `tsconfig.json` with `composite: true`
4. Add dependencies including `@repo/types: "*"`
5. Update consuming app's `tsconfig.json`:
   - Add to `paths`
   - Add to `references`
6. Update consuming app's `package.json` dependencies
7. Run `pnpm install` from root

---

**Last Updated:** [Current Date]
**Maintainer:** [Your Name/Team]