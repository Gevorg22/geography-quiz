export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}

export const haptic = {
  correct: () => vibrate(40),
  wrong: () => vibrate([30, 20, 30]),
  fail: () => vibrate([50, 30, 50, 30, 80]),
  skip: () => vibrate(20),
  hint: () => vibrate(15),
};
