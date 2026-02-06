const FOCUS_WINDOW_MS = 3 * 60 * 60 * 1000;

export function isUserFocusing(
  isFocusing: boolean,
  lastPing: Date | null,
): boolean {
  if (!isFocusing || !lastPing) return false;
  return Date.now() - lastPing.getTime() <= FOCUS_WINDOW_MS;
}
