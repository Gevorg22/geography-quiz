/**
 * Возвращает новый массив с теми же элементами в случайном порядке
 * (алгоритм Фишера-Йетса). Исходный массив **не мутируется**.
 *
 * @param arr - Исходный массив для перемешивания.
 * @returns Новый массив со случайной перестановкой элементов.
 *
 * @example
 * shuffle([1, 2, 3, 4]) // например [3, 1, 4, 2]
 */
export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
