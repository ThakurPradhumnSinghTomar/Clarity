# FCM Tokens in Prisma Schema

## What is an FCM Token?

**FCM (Firebase Cloud Messaging)** tokens are unique device identifiers issued by Firebase that allow your backend to send push notifications to a specific device or browser.

---

## Why Store FCM Tokens in Prisma?

Your backend needs to persist these tokens so it can look them up when sending notifications. Prisma (as your ORM) manages this in the database.

---

## Typical Prisma Schema Example

```prisma
model User {
  id        Int        @id @default(autoincrement())
  email     String     @unique
  fcmTokens FcmToken[]
}

model FcmToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Key Points

- **One user → many tokens** — a user can be logged in on multiple devices, each with its own FCM token.
- **`@unique` on token** — ensures no duplicate tokens are stored.
- **Relation to User** — tokens are always linked to a specific user for targeted notifications.
- **`updatedAt`** — useful to detect stale/expired tokens and clean them up.

---

## Common Operations

| Operation | When |
|---|---|
| **Upsert token** | User logs in / app opens |
| **Delete token** | User logs out |
| **Fetch tokens by userId** | Before sending a push notification |
| **Purge old tokens** | After FCM returns `UNREGISTERED` error |

---

## Notes

- FCM tokens **expire or rotate** — always handle `UNREGISTERED` / `INVALID_ARGUMENT` errors from Firebase and delete stale tokens from your DB.
- On **web**, tokens change when the user clears browser data.
- Use `upsert` in Prisma to safely add tokens without duplicates:

```ts
await prisma.fcmToken.upsert({
  where: { token: deviceToken },
  update: { userId },
  create: { token: deviceToken, userId },
});
```