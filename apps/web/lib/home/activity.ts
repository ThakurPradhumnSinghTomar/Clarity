export const calculateStreaks = (days: { date: string; focusedSec: number }[]) => {
  let currentStreak = 0;
  let longestStreak = 0;
  let temp = 0;

  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].focusedSec > 0) {
      currentStreak++;
      continue;
    }

    break;
  }

  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].focusedSec > 0) {
      temp++;
      longestStreak = Math.max(longestStreak, temp);
    } else {
      temp = 0;
    }
  }

  return { currentStreak, longestStreak };
};
