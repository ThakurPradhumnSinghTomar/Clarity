🧠 Case Study Notes: “The WeeklyStudyHours Ghost Bug”
1️⃣ Dates are NOT values, they’re timestamps

Learning

A Date is not “Monday”

It is milliseconds since epoch

Two Dates that look same ≠ equal in DB

Rule

Never use raw Date equality for logic unless you fully control normalization.

Action

Always normalize Dates (UTC, midnight) in one canonical function

Use that function everywhere

2️⃣ MongoDB + Prisma + Date + @@unique = ⚠️ danger zone

Learning

findUnique requires bit-for-bit equality

Mongo does not do semantic date matching

Prisma won’t warn you — it just returns null

Rule

Avoid findUnique on compound keys that include DateTime in MongoDB.

Action

Prefer findFirst + explicit filters

Or redesign keys (e.g., store weekKey: "2026-W03")

3️⃣ “It worked before” means NOTHING in distributed systems

Learning

Timezone

Serialization

Server restart

Refactor

Restore logic

Any one of these can break date logic silently.

Rule

If logic depends on time, assume it will break someday.

Action

Add logging for:

normalized dates

weekStart

DB queries

Make bugs observable, not mysterious

4️⃣ Never compute the same concept in multiple ways

You computed:

weekStart in runtime

based on startTime

across different executions

Learning

Same idea + different code paths = future bug

Action

One helper: getWeekStartUTC(date)

No exceptions

No inline logic

5️⃣ Equality bugs don’t throw errors — they lie quietly

Learning

Your DB logic didn’t crash

It returned valid-looking data

Just the wrong record

Rule

Silent bugs are worse than crashing bugs.

Action

Log when findUnique returns null

Assert assumptions during dev

if (!weeklyRecord) {
  console.warn("Weekly record not found for", weekStart);
}

6️⃣ Prefer idempotent DB operations

Your flow:

find → create OR update

Learning

Race conditions

Duplicate records

Partial updates

Rule

If something should “exist once”, use upsert.

Action

Replace multi-step logic with:

prisma.weeklyStudyHours.upsert(...)

7️⃣ Frontend Dates are strings, backend Dates are truth

Learning

Frontend sends ISO strings

Backend must normalize

Never trust client time

Rule

Backend owns time logic.

Action

Convert

Normalize

Validate

Then store

8️⃣ Zero is a valid value (JS trap)
if (!currentTime) return;


Learning

0 is falsy

Logic silently skips

Rule

Never use truthy checks for numeric logic.

Action

if (currentTime <= 0) return;

9️⃣ Metrics & aggregates need stronger guarantees than raw events

Learning

FocusSession = event (easy)

WeeklyStudyHours = aggregate (hard)

Rule

Aggregates need stricter design than events.

Action

Consider:

weekKey: "2026-01-13"

or cron-based aggregation

or database pipelines

🔟 Mental model upgrade (the big one)

If data didn’t update, assume identity mismatch before logic error

This mindset alone saves hours.

Final one-liner to remember

“Dates, equality, and databases will betray you unless you normalize aggressively.”

You didn’t just fix a bug.
You leveled up as a backend engineer.