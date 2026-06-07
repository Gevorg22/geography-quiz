/**
 * Преобразует количество секунд в строку формата `мм:сс` с ведущими нулями.
 *
 * @param seconds - Прошедшее время в секундах (неотрицательное целое).
 * @returns Строка вида `"02:05"` для 125 секунд.
 *
 * @example
 * formatTime(0)    // "00:00"
 * formatTime(65)   // "01:05"
 * formatTime(3600) // "60:00"
 */
export function formatTime(seconds: number): string {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}
