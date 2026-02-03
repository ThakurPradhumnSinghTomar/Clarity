const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 1;

const skip = (page - 1) * limit;

const data = await prisma.weeklyStudyHours.findMany({
  where: {
    userId: userId,
  },
  orderBy: {
    weekStart: "desc",
  },
  skip,
  take: limit,
});



✅ What is Cursor-Based Pagination?

Cursor-based pagination means:

Instead of asking:

“Give me page 5”

You ask:

“Give me the next set of results after this item.”

So pagination is based on a cursor, not a page number.

A cursor is usually:

an ID

a timestamp

or any unique sortable field

🧠 Example (Real Life)

Suppose you fetch messages:

GET /messages?limit=3


Response:

{
  "data": [
    { "id": 101, "text": "Hi" },
    { "id": 102, "text": "Hello" },
    { "id": 103, "text": "Yo" }
  ],
  "next_cursor": 103
}


Now to get the next batch:

GET /messages?limit=3&cursor=103


This means:

“Start after message 103”

🔥 Why Cursor Pagination is Better
✅ Faster for large datasets

Page-based pagination:

OFFSET 100000 LIMIT 20


This becomes painfully slow.

Cursor-based:

WHERE id > 103 LIMIT 20


Much faster.

✅ No duplicate/missing results when data changes

If new rows get inserted while you're paging:

Page-based → results shift → duplicates/missing items

Cursor-based → stable and consistent

✅ Used by big platforms

Cursor pagination is what you see in:

Instagram feed

Twitter/X scrolling

YouTube recommendations

APIs like GitHub GraphQL

🚫 Page-Based vs Cursor-Based (Quick Comparison)
Feature	Page-Based	Cursor-Based
Uses	page=2	cursor=last_id
Performance	Slow at high pages	Always fast
Stable with inserts/deletes	❌ No	✅ Yes
Best for infinite scroll	Meh	Perfect
🎯 When to Use Cursor Pagination

Use it when:

✅ Data is huge
✅ Infinite scrolling
✅ Real-time updates
✅ Performance matters

Avoid it when:

❌ Users need direct jump like “Go to page 50”

💡 Simple SQL Example
Cursor style:
SELECT * FROM posts
WHERE id > 500
ORDER BY id
LIMIT 10;


Cursor = 500

Final One-Liner

Cursor-based pagination is:

Pagination using the last seen item as the starting point instead of page numbers — faster, cleaner, and more reliable.