# Prisma Setup Guide - MongoDB & TypeScript

## Initial Setup

### 1. Install Dependencies
```bash
npm install @prisma/client
npm install -D prisma
```

### 2. Initialize Prisma
```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Your database schema
- `.env` - Environment variables file

---

## Schema Configuration

### 3. Configure schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
  // Don't add custom output path - use default
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// Example Models
model User {
  id             String         @id @default(auto()) @map("_id") @db.ObjectId
  name           String
  email          String         @unique
  image          String?
  hashedPassword String?
  focusSessions  FocusSession[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

model FocusSession {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation(fields: [userId], references: [id])
  startTime   DateTime
  endTime     DateTime
  durationSec Int
  tag         String?
  note        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, startTime])
}
```

### 4. Setup Environment Variables

Create/update `.env` file:
```env
DATABASE_URL="mongodb://localhost:27017/mydatabase"
# OR for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority"
```

---

## Generate & Push Schema

### 5. Generate Prisma Client
```bash
npx prisma generate
```

Run this **every time** you modify your schema.

### 6. Push Schema to MongoDB
```bash
npx prisma db push
```

This creates collections and indexes in MongoDB.

---

## Using Prisma in Your Application

### 7. Create Prisma Client Instance

Create `src/lib/prisma.ts` or `src/prismaClient.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

**Why this pattern?**
- Prevents multiple Prisma Client instances in development (hot reload)
- Production creates a single instance

### 8. Use in API Routes

```typescript
import prisma from './lib/prisma';

// CREATE
app.post('/api/users', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// READ (All)
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany({
    include: {
      focusSessions: true, // Include relations
    },
  });
  res.json(users);
});

// READ (Single)
app.get('/api/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });
  res.json(user);
});

// UPDATE
app.put('/api/users/:id', async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(user);
});

// DELETE
app.delete('/api/users/:id', async (req, res) => {
  await prisma.user.delete({
    where: { id: req.params.id },
  });
  res.json({ message: 'User deleted' });
});
```

---

## Common Prisma Operations

### Query Examples

```typescript
// Find with filters
const users = await prisma.user.findMany({
  where: {
    email: { contains: '@gmail.com' },
    name: { startsWith: 'A' },
  },
  orderBy: { createdAt: 'desc' },
  take: 10, // limit
  skip: 0,  // offset
});

// Find with relations
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    focusSessions: {
      orderBy: { startTime: 'desc' },
      take: 5,
    },
  },
});

// Count
const count = await prisma.user.count({
  where: { email: { contains: '@gmail.com' } },
});

// Aggregate
const result = await prisma.focusSession.aggregate({
  where: { userId: 'some-id' },
  _sum: { durationSec: true },
  _avg: { durationSec: true },
  _count: true,
});

// Group by
const stats = await prisma.focusSession.groupBy({
  by: ['userId'],
  _sum: { durationSec: true },
  _count: true,
});

// Create with relations
const user = await prisma.user.create({
  data: {
    name: 'John',
    email: 'john@example.com',
    focusSessions: {
      create: [
        {
          startTime: new Date(),
          endTime: new Date(),
          durationSec: 3600,
        },
      ],
    },
  },
});

// Transaction (all or nothing)
await prisma.$transaction([
  prisma.user.create({ data: { name: 'Alice', email: 'alice@example.com' } }),
  prisma.user.create({ data: { name: 'Bob', email: 'bob@example.com' } }),
]);
```

---

## Workflow Summary

1. **Modify schema** → `prisma/schema.prisma`
2. **Generate client** → `npx prisma generate`
3. **Push to DB** → `npx prisma db push`
4. **Restart TypeScript** → `Ctrl+Shift+P` → "Restart TS Server"
5. **Use in code** → `import prisma from './lib/prisma'`

---

## Useful Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (MongoDB)
npx prisma db push

# Open Prisma Studio (GUI for your database)
npx prisma studio

# Validate schema
npx prisma validate

# Format schema file
npx prisma format

# Pull schema from existing database
npx prisma db pull
```

---

## MongoDB-Specific Notes

### ObjectId Fields
```prisma
id String @id @default(auto()) @map("_id") @db.ObjectId
```
- `@map("_id")` - Maps Prisma's `id` to MongoDB's `_id`
- `@db.ObjectId` - Stores as MongoDB ObjectId type

### Relations with ObjectId
```prisma
userId String @db.ObjectId  // Foreign key
user   User   @relation(fields: [userId], references: [id])
```

### Embedded Documents (Types)
```prisma
type Address {
  street  String
  city    String
  zipCode String
}

model User {
  id      String   @id @default(auto()) @map("_id") @db.ObjectId
  address Address? // Embedded document
}
```

### Indexes
```prisma
@@index([userId, createdAt])        // Compound index
@@unique([email])                   // Unique constraint
@@unique([userId, weekStart])       // Composite unique
```

---

## Troubleshooting

### Error: Module has no exported member 'PrismaClient'
**Solution:**
1. Run `npx prisma generate`
2. Restart VS Code TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Error: Could not resolve @prisma/client
**Solution:**
```bash
npm install @prisma/client
npx prisma generate
```

### Error: Could not find Prisma Schema
**Solution:**
- Make sure you're in the correct directory
- Or use: `npx prisma generate --schema=./path/to/schema.prisma`

### Monorepo Setup
If in a monorepo (apps/server):
```bash
cd apps/server
npm install @prisma/client prisma
npx prisma generate
```

---

## Package.json Scripts (Optional)

Add to `package.json`:
```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "prisma:studio": "prisma studio",
    "prisma:format": "prisma format"
  }
}
```

Then use:
```bash
npm run prisma:generate
npm run prisma:push
```

---

## Best Practices

1. **Always use try-catch** for database operations
2. **Close connections** in serverless environments (if needed)
3. **Use transactions** for multiple related operations
4. **Index frequently queried fields**
5. **Validate input** before passing to Prisma
6. **Handle unique constraint errors** gracefully
7. **Use select/include** to optimize queries
8. **Don't expose raw Prisma errors** to clients

---

## Additional Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [MongoDB Connector](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [CRUD Operations](https://www.prisma.io/docs/concepts/components/prisma-client/crud)