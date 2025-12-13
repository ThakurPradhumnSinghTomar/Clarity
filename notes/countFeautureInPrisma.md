# Prisma `_count` Feature: Complete Guide

A comprehensive guide to using Prisma's `_count` feature for efficient relation counting.

---

## What is `_count`?

`_count` is a **Prisma feature** that counts related records at the **database level** (SQL COUNT query) instead of fetching all data and counting in JavaScript. This makes it much faster and more efficient.

---

## Why Use `_count`?

### ❌ Without `_count` (Inefficient):
```typescript
const rooms = await prisma.room.findMany({
  include: {
    participants: true // Fetches ALL participant records
  }
});

// Count in JavaScript
rooms.forEach(room => {
  const count = room.participants.length; // Slow if thousands of participants
});
```

**Problems:**
- Fetches all participant data (names, emails, etc.)
- High network bandwidth usage
- Slow with large datasets
- Uses more memory

### ✅ With `_count` (Efficient):
```typescript
const rooms = await prisma.room.findMany({
  include: {
    _count: {
      select: {
        participants: true // Just returns a number
      }
    }
  }
});

// Result:
// {
//   id: 1,
//   name: "My Room",
//   _count: { participants: 15 } // Just the count
// }
```

**Benefits:**
- Only returns the count (a single number)
- Fast database-level counting
- Minimal network bandwidth
- Efficient memory usage

---

## Basic Usage

### Count Single Relation

```typescript
const room = await prisma.room.findUnique({
  where: { id: 1 },
  include: {
    _count: {
      select: {
        participants: true
      }
    }
  }
});

console.log(room._count.participants); // Output: 15
```

### Count Multiple Relations

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    _count: {
      select: {
        posts: true,
        comments: true,
        followers: true
      }
    }
  }
});

// Result:
// {
//   id: 1,
//   name: "John Doe",
//   email: "john@example.com",
//   _count: {
//     posts: 25,
//     comments: 103,
//     followers: 450
//   }
// }
```

---

## Real-World Examples

### Example 1: Room List with Participant Count

```typescript
const rooms = await prisma.room.findMany({
  select: {
    id: true,
    name: true,
    roomCode: true,
    isPublic: true,
    _count: {
      select: {
        participants: true
      }
    }
  }
});

// Result:
// [
//   {
//     id: 1,
//     name: "Study Room",
//     roomCode: "ABC123",
//     isPublic: true,
//     _count: { participants: 5 }
//   },
//   {
//     id: 2,
//     name: "Gaming Room",
//     roomCode: "XYZ789",
//     isPublic: false,
//     _count: { participants: 12 }
//   }
// ]

// Frontend can display: "Study Room - 5 participants"
```

### Example 2: Blog Posts with Comment and Like Counts

```typescript
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    content: true,
    createdAt: true,
    _count: {
      select: {
        comments: true,
        likes: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});

// Result:
// [
//   {
//     id: 1,
//     title: "Introduction to Prisma",
//     content: "Prisma is amazing...",
//     createdAt: "2024-01-15",
//     _count: {
//       comments: 23,
//       likes: 156
//     }
//   }
// ]

// Frontend displays: "23 comments • 156 likes"
```

### Example 3: User Profile Stats

```typescript
const userProfile = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    email: true,
    avatar: true,
    _count: {
      select: {
        posts: true,
        comments: true,
        followers: true,
        following: true,
        createdRooms: true,
        joinedRooms: true
      }
    }
  }
});

// Result:
// {
//   id: 1,
//   name: "Alice Johnson",
//   email: "alice@example.com",
//   avatar: "https://...",
//   _count: {
//     posts: 45,
//     comments: 234,
//     followers: 1200,
//     following: 450,
//     createdRooms: 8,
//     joinedRooms: 23
//   }
// }
```

### Example 4: E-commerce Product with Reviews

```typescript
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    image: true,
    _count: {
      select: {
        reviews: true,
        orders: true
      }
    }
  }
});

// Result:
// [
//   {
//     id: 1,
//     name: "Laptop",
//     price: 999.99,
//     image: "laptop.jpg",
//     _count: {
//       reviews: 87,
//       orders: 234
//     }
//   }
// ]

// Frontend displays: "87 reviews • 234 sold"
```

---

## Advanced Usage

### Count with Filtering

You can count only records that match certain conditions:

```typescript
const rooms = await prisma.room.findMany({
  include: {
    _count: {
      select: {
        participants: {
          where: {
            isActive: true // Only count active participants
          }
        }
      }
    }
  }
});

// Result:
// {
//   id: 1,
//   name: "Study Room",
//   _count: {
//     participants: 8 // Only active participants counted
//   }
// }
```

### Multiple Filtered Counts

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    _count: {
      select: {
        posts: {
          where: {
            published: true // Count only published posts
          }
        },
        comments: {
          where: {
            createdAt: {
              gte: new Date('2024-01-01') // Count comments from 2024
            }
          }
        }
      }
    }
  }
});
```

### Combining with Regular Includes

You can fetch both the count AND actual related data:

```typescript
const room = await prisma.room.findUnique({
  where: { id: 1 },
  include: {
    host: true, // Fetch host details
    participants: {
      take: 5, // Fetch only first 5 participants
      select: {
        id: true,
        name: true,
        avatar: true
      }
    },
    _count: {
      select: {
        participants: true // But count ALL participants
      }
    }
  }
});

// Result:
// {
//   id: 1,
//   name: "Study Room",
//   host: { id: 10, name: "John", email: "john@example.com" },
//   participants: [ /* 5 participant objects */ ],
//   _count: {
//     participants: 50 // Total count
//   }
// }

// Frontend can show: "5 of 50 participants"
```

---

## Performance Comparison

### Scenario: Room with 1000 participants

#### ❌ Without `_count`:
```typescript
const room = await prisma.room.findUnique({
  where: { id: 1 },
  include: {
    participants: true
  }
});

const count = room.participants.length;
```

**Result:**
- Database fetches 1000 full participant records
- Network transfers ~500KB of data
- Takes ~200ms
- Uses significant memory

#### ✅ With `_count`:
```typescript
const room = await prisma.room.findUnique({
  where: { id: 1 },
  include: {
    _count: {
      select: {
        participants: true
      }
    }
  }
});

const count = room._count.participants;
```

**Result:**
- Database executes: `SELECT COUNT(*) FROM participants WHERE roomId = 1`
- Network transfers just the number `1000` (~4 bytes)
- Takes ~5ms
- Minimal memory usage

**Performance Gain: 40x faster!**

---

## Common Patterns

### Pattern 1: List Pages with Counts

```typescript
// Articles with comment counts
const articles = await prisma.article.findMany({
  select: {
    id: true,
    title: true,
    excerpt: true,
    author: {
      select: {
        name: true,
        avatar: true
      }
    },
    _count: {
      select: {
        comments: true
      }
    }
  },
  take: 20
});
```

### Pattern 2: Dashboard Stats

```typescript
const dashboardStats = await prisma.user.findUnique({
  where: { id: currentUserId },
  select: {
    _count: {
      select: {
        posts: true,
        drafts: { where: { published: false } },
        publishedPosts: { where: { published: true } },
        comments: true,
        likes: true
      }
    }
  }
});
```

### Pattern 3: Social Media Profile

```typescript
const profile = await prisma.user.findUnique({
  where: { username: "john_doe" },
  select: {
    id: true,
    name: true,
    bio: true,
    avatar: true,
    _count: {
      select: {
        followers: true,
        following: true,
        posts: true
      }
    }
  }
});

// Display: "1.2K followers • 450 following • 89 posts"
```

### Pattern 4: Pagination with Total Count

```typescript
const [rooms, totalCount] = await Promise.all([
  prisma.room.findMany({
    skip: (page - 1) * limit,
    take: limit,
    include: {
      _count: {
        select: {
          participants: true
        }
      }
    }
  }),
  prisma.room.count() // Total number of rooms
]);

// Response:
// {
//   rooms: [...],
//   pagination: {
//     currentPage: 1,
//     totalPages: Math.ceil(totalCount / limit),
//     totalRooms: totalCount
//   }
// }
```

---

## Schema Requirements

For `_count` to work, you need proper relations defined in your Prisma schema:

```prisma
model Room {
  id           Int            @id @default(autoincrement())
  name         String
  roomCode     String         @unique
  participants Participant[]  // One-to-many relation
  messages     Message[]      // One-to-many relation
}

model Participant {
  id     Int  @id @default(autoincrement())
  roomId Int
  userId Int
  room   Room @relation(fields: [roomId], references: [id])
  user   User @relation(fields: [userId], references: [id])
}

model Message {
  id      Int    @id @default(autoincrement())
  content String
  roomId  Int
  room    Room   @relation(fields: [roomId], references: [id])
}
```

Now you can count:
```typescript
const room = await prisma.room.findUnique({
  where: { id: 1 },
  include: {
    _count: {
      select: {
        participants: true, // Counts Participant records
        messages: true      // Counts Message records
      }
    }
  }
});
```

---

## Common Mistakes

### ❌ Mistake 1: Trying to count scalar fields
```typescript
// WRONG - Can't count regular fields
const user = await prisma.user.findUnique({
  include: {
    _count: {
      select: {
        email: true // ERROR: email is not a relation
      }
    }
  }
});
```

### ❌ Mistake 2: Forgetting the relation
```typescript
// WRONG - participants must be defined in schema
const room = await prisma.room.findUnique({
  include: {
    _count: {
      select: {
        participants: true // ERROR if no participants relation exists
      }
    }
  }
});
```

### ✅ Correct Usage
```typescript
// RIGHT - Count only relations defined in schema
const room = await prisma.room.findUnique({
  include: {
    _count: {
      select: {
        participants: true, // Must be a relation in schema
        messages: true      // Must be a relation in schema
      }
    }
  }
});
```

---

## Key Takeaways

| Feature | Benefit |
|---------|---------|
| **Database-level counting** | Executes SQL COUNT query directly |
| **Performance** | 10-100x faster than fetching all records |
| **Bandwidth** | Returns just numbers, not full records |
| **Memory** | Minimal memory footprint |
| **Filtering** | Can count with WHERE conditions |
| **Multiple counts** | Count many relations in one query |

---

## Quick Reference

```typescript
// Basic count
_count: { select: { relation: true } }

// Multiple counts
_count: { select: { posts: true, comments: true } }

// Filtered count
_count: { select: { posts: { where: { published: true } } } }

// Combine with includes
include: {
  relation: true,
  _count: { select: { otherRelation: true } }
}
```

---

**Use `_count` whenever you need to display counts of related records - it's always faster than fetching and counting manually! 🚀**