# Conditional Component Mounting with Animation (React + Framer Motion)

## Idea
Instead of conditionally rendering JSX inline, map a **state value** to a **component reference** and mount it dynamically. This keeps logic clean and scales well.

---

## Core Pattern

```ts
const ContentMap = {
  "Create Rooms": CreateRooms,
  "My Rooms": MyRooms,
  "Join Rooms": JoinRooms,
}

const ActiveComponent = ContentMap[roomSelection]
```

```tsx
<ActiveComponent />
```

- Store **components**, not JSX
- Decide *what to render* using state
- Render it like a normal component

---

## With Animated Transitions

Use `AnimatePresence` when components mount/unmount.

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={roomSelection}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
  >
    <ActiveComponent />
  </motion.div>
</AnimatePresence>
```

- `key` tells Framer Motion a new screen is mounted
- `mode="wait"` ensures exit → enter order
- Smooth screen-like transitions

---

## Passing Props

```tsx
<ActiveComponent userId={userId} rooms={rooms} />
```

Components receive props normally.

---

## Type-Safe Version (Recommended)

```ts
type RoomTab = "Create Rooms" | "My Rooms" | "Join Rooms"

const ContentMap: Record<RoomTab, React.FC<any>> = {
  "Create Rooms": CreateRooms,
  "My Rooms": MyRooms,
  "Join Rooms": JoinRooms,
}
```

Prevents invalid keys at compile time.

---

## Rules to Remember

- ✅ Store **component references**
- ❌ Don’t store JSX in maps
- Use `AnimatePresence` for screen changes
- Use `layoutId` for moving elements (tabs, indicators)

---

## When to Use This Pattern

- Tabs with animated content
- Dashboards
- Conditional screens without routing
- Clean alternative to large conditional JSX blocks
