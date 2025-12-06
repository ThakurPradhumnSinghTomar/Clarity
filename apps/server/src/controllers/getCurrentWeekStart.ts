export function getCurrentWeekStart() {
  const now = new Date();          // current date & time
  const weekStart = new Date(now); // clone so we don't mutate `now`

  // In JS: getDay() → 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const day = weekStart.getDay();

  // We want Monday as start of week.
  // For Monday-based week: how many days we need to go BACK from today?
  // If today is Monday (1) → diff = 0
  // If today is Sunday (0) → diff = 6 (go back 6 days)
  const diffToMonday = (day + 6) % 7;

  // Move date back to Monday
  weekStart.setDate(weekStart.getDate() - diffToMonday);

  // Set time to 00:00:00.000 so it matches what you store in DB
  weekStart.setHours(0, 0, 0, 0);

  return weekStart;
}