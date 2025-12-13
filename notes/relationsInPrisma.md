# Prisma Relations: Complete Guide with Examples

A comprehensive guide to defining relationships between models in Prisma Schema.

---

## Table of Contents
1. [One-to-One Relations](#one-to-one-relations)
2. [One-to-Many Relations](#one-to-many-relations)
3. [Many-to-Many Relations](#many-to-many-relations)
4. [Self-Relations](#self-relations)
5. [Composite Relations](#composite-relations)
6. [Relation Fields Explained](#relation-fields-explained)

---

## One-to-One Relations

A one-to-one relationship where one record in a model relates to exactly one record in another model.

### Example: User and Profile

```prisma
model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  name    String?
  profile Profile? // Optional relation field
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String
  userId Int    @unique // Foreign key (must be unique for 1-to-1)
  user   User   @relation(fields: [userId], references: [id])
}
```

**Key Points:**
- `Profile` has the foreign key `userId`
- `@unique` on `userId` enforces the one-to-one relationship
- `@relation(fields: [userId], references: [id])` defines the connection
- `User.profile` is optional (nullable) while `Profile.user` is required

### Alternative: Optional on Both Sides

```prisma
model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  profile Profile?
}

model Profile {
  id     Int   @id @default(autoincrement())
  bio    String
  userId Int?  @unique // Now optional
  user   User? @relation(fields: [userId], references: [id])
}
```

---

## One-to-Many Relations

A one-to-many relationship where one record relates to multiple records in another model.

### Example: User and Posts

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
  posts Post[] // Array indicates "many"
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int      // Foreign key
  author    User     @relation(fields: [authorId], references: [id])
}
```

**Key Points:**
- `User.posts` is an array `Post[]` (the "many" side)
- `Post.author` is singular (the "one" side)
- Foreign key `authorId` lives on the "many" side (`Post`)
- One user can have multiple posts, but each post has one author

### With Cascading Deletes

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[]
}

model Post {
  id       Int     @id @default(autoincrement())
  title    String
  authorId Int
  author   User    @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

**Cascade Options:**
- `onDelete: Cascade` - Delete posts when user is deleted
- `onDelete: SetNull` - Set authorId to null (requires optional field)
- `onDelete: Restrict` - Prevent deletion if posts exist (default)
- `onDelete: NoAction` - No automatic action

---

## Many-to-Many Relations

A many-to-many relationship where records in both models can relate to multiple records in the other.

### Implicit Many-to-Many (Prisma handles the join table)

```prisma
model Post {
  id         Int        @id @default(autoincrement())
  title      String
  categories Category[] // Many categories per post
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[] // Many posts per category
}
```

**Key Points:**
- Prisma automatically creates a join table `_CategoryToPost`
- No explicit join model needed
- Simplest approach for basic many-to-many relations

### Explicit Many-to-Many (Custom join table)

```prisma
model Post {
  id               Int                @id @default(autoincrement())
  title            String
  categoriesOnPost CategoriesOnPost[]
}

model Category {
  id               Int                @id @default(autoincrement())
  name             String
  categoriesOnPost CategoriesOnPost[]
}

model CategoriesOnPost {
  postId     Int
  categoryId Int
  assignedAt DateTime @default(now())
  assignedBy String

  post     Post     @relation(fields: [postId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])

  @@id([postId, categoryId]) // Composite primary key
}
```

**Key Points:**
- Full control over the join table
- Can add extra fields (`assignedAt`, `assignedBy`)
- Uses composite primary key `@@id([postId, categoryId])`
- Required when you need metadata about the relationship

### Real-World Example: Students and Courses

```prisma
model Student {
  id          Int          @id @default(autoincrement())
  name        String
  enrollments Enrollment[]
}

model Course {
  id          Int          @id @default(autoincrement())
  name        String
  enrollments Enrollment[]
}

model Enrollment {
  studentId  Int
  courseId   Int
  enrolledAt DateTime @default(now())
  grade      String?

  student Student @relation(fields: [studentId], references: [id])
  course  Course  @relation(fields: [courseId], references: [id])

  @@id([studentId, courseId])
  @@index([studentId])
  @@index([courseId])
}
```

---

## Self-Relations

When a model relates to itself.

### One-to-Many Self-Relation: Employee Hierarchy

```prisma
model Employee {
  id         Int        @id @default(autoincrement())
  name       String
  managerId  Int?       // Foreign key to another Employee
  manager    Employee?  @relation("EmployeeHierarchy", fields: [managerId], references: [id])
  subordinates Employee[] @relation("EmployeeHierarchy")
}
```

**Key Points:**
- Named relation `"EmployeeHierarchy"` is required
- `manager` is optional (CEO has no manager)
- `subordinates` is an array of employees

### Many-to-Many Self-Relation: User Friendships

```prisma
model User {
  id            Int    @id @default(autoincrement())
  name          String
  friendships   Friendship[] @relation("UserFriendships")
  friendOf      Friendship[] @relation("FriendOfUser")
}

model Friendship {
  userId   Int
  friendId Int
  createdAt DateTime @default(now())

  user   User @relation("UserFriendships", fields: [userId], references: [id])
  friend User @relation("FriendOfUser", fields: [friendId], references: [id])

  @@id([userId, friendId])
}
```

---

## Composite Relations

Relations using composite keys (multiple fields as primary key).

### Example: Multi-Tenant Application

```prisma
model Organization {
  id    Int    @id @default(autoincrement())
  name  String
  users User[]
}

model User {
  organizationId Int
  userId         Int
  email          String
  posts          Post[]

  organization Organization @relation(fields: [organizationId], references: [id])

  @@id([organizationId, userId]) // Composite primary key
}

model Post {
  id             Int    @id @default(autoincrement())
  title          String
  organizationId Int
  authorId       Int

  author User @relation(fields: [organizationId, authorId], references: [organizationId, userId])
}
```

---

## Relation Fields Explained

### Anatomy of a Relation

```prisma
model Post {
  id       Int  @id @default(autoincrement())
  authorId Int  // Scalar field (stores the actual FK value)
  author   User @relation(fields: [authorId], references: [id])
  //       ^^^^                    ^^^^^^^^              ^^
  //       Type                    FK field              Referenced field
}
```

### Key Components:

1. **Relation field** (`author User`): Virtual field, not stored in database
2. **Foreign key field** (`authorId Int`): Actual column in database
3. **@relation** directive: Connects the two
   - `fields`: Foreign key field(s) in this model
   - `references`: Primary key field(s) in related model

### Multiple Relations Between Same Models

When you have multiple relations between the same two models, you must name them:

```prisma
model User {
  id             Int    @id @default(autoincrement())
  writtenPosts   Post[] @relation("PostAuthor")
  favoritePosts  Post[] @relation("PostFavorites")
}

model Post {
  id          Int   @id @default(autoincrement())
  authorId    Int
  author      User  @relation("PostAuthor", fields: [authorId], references: [id])
  favoritedBy User[] @relation("PostFavorites")
}
```

---

## Complete Real-World Example: Blog Platform

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String?
  role      Role      @default(USER)
  posts     Post[]
  comments  Comment[]
  profile   Profile?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String?
  avatar String?
  userId Int     @unique
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Post {
  id         Int        @id @default(autoincrement())
  title      String
  content    String?
  published  Boolean    @default(false)
  authorId   Int
  author     User       @relation(fields: [authorId], references: [id])
  categories Category[]
  comments   Comment[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  @@index([authorId])
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  postId    Int
  authorId  Int
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())

  @@index([postId])
  @@index([authorId])
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

---

## Quick Reference Table

| Relation Type | Where FK Lives | Unique Constraint | Example |
|---------------|----------------|-------------------|---------|
| One-to-One | Either side | Required on FK | User ↔ Profile |
| One-to-Many | "Many" side | Not required | User → Posts |
| Many-to-Many (Implicit) | Join table (auto) | Not applicable | Post ↔ Category |
| Many-to-Many (Explicit) | Join model | Composite key | Student ↔ Course |
| Self-Relation | Same model | Depends on type | Employee hierarchy |

---

## Common Patterns

### Optional vs Required Relations

```prisma
// Required: Post must have an author
model Post {
  authorId Int
  author   User @relation(fields: [authorId], references: [id])
}

// Optional: Post might not have an author
model Post {
  authorId Int?
  author   User? @relation(fields: [authorId], references: [id])
}
```

### Adding Indexes for Performance

```prisma
model Post {
  authorId Int
  author   User @relation(fields: [authorId], references: [id])

  @@index([authorId]) // Speeds up queries filtering by author
}
```

### Compound Indexes

```prisma
model Post {
  authorId  Int
  published Boolean
  createdAt DateTime

  @@index([authorId, published]) // For queries filtering by both
  @@index([createdAt(sort: Desc)]) // For sorting by date
}
```

---

## Tips and Best Practices

1. **Always define relations on both sides** for type safety in your Prisma Client
2. **Use `onDelete: Cascade`** carefully - it will delete related records
3. **Name relations** when you have multiple relations between same models
4. **Add indexes** on foreign keys for better query performance
5. **Use explicit many-to-many** when you need extra fields on the relationship
6. **Consider nullable foreign keys** when the relationship is truly optional

---

## Running Migrations

After defining your schema:

```bash
# Create migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# View your database in Prisma Studio
npx prisma studio
```

---

## Querying Relations

```typescript
// Include related data
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true }
})

// Nested create
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    posts: {
      create: [
        { title: "First Post" },
        { title: "Second Post" }
      ]
    }
  }
})

// Connect existing relations
await prisma.post.create({
  data: {
    title: "New Post",
    author: {
      connect: { id: 1 }
    }
  }
})
```

---

**Happy coding with Prisma! 🚀**