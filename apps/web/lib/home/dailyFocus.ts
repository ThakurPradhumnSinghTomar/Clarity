export const getTimeBucket = (date: Date) => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 18) return "Day";
  return "Night";
};