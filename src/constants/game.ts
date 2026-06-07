/** Максимальное количество попыток угадать страну. */
export const MAX_ATTEMPTS = 3 as const;

/**
 * Очки за правильный ответ в зависимости от номера попытки.
 * `first` — с первой, `second` — со второй, остальные — 0.
 */
export const POINTS = Object.freeze({
  first: 3,
  second: 1,
  third: 0,
  failed: 0,
  skipped: 0,
} as const);

/** Ключ в объекте POINTS (совпадает с ResultValue). */
export type PointsKey = keyof typeof POINTS;

/**
 * Параметры масштабирования глобуса.
 * - `factor` — шаг умножения/деления при нажатии ±
 * - `min` / `max` — ограничения масштаба как доля/кратное базового радиуса
 * - `wheelSpeed` — чувствительность колеса мыши
 */
export const ZOOM = Object.freeze({
  factor: 1.35,
  min: 0.35,
  max: 7,
  wheelSpeed: 0.0015,
} as const);

/**
 * Строковые ключи, описывающие исход каждого вопроса.
 * Используются как значения в Map результатов и как ключи в POINTS / GLOBE_COLORS.
 */
export const RESULT = Object.freeze({
  FIRST: "first",
  SECOND: "second",
  THIRD: "third",
  FAILED: "failed",
  SKIPPED: "skipped",
} as const);

/** Возможное значение результата для одной страны. */
export type ResultValue = (typeof RESULT)[keyof typeof RESULT];

/**
 * Цвета заливки для каждого состояния страны на глобусе.
 * Ключи совпадают со значениями RESULT, а также включают служебные: land, hover, ocean1/2, border.
 */
export const GLOBE_COLORS = Object.freeze({
  land: "#2d6a4f",
  hover: "#52b788",
  ocean1: "#1e6091",
  ocean2: "#0a1628",
  border: "#1b4332",
  [RESULT.FIRST]: "#95d5b2",
  [RESULT.SECOND]: "#ffd166",
  [RESULT.THIRD]: "#f4a261",
  [RESULT.FAILED]: "#e63946",
  [RESULT.SKIPPED]: "#6c757d",
} as const);
