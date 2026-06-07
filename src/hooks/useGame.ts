import { useState, useEffect, useRef, useCallback } from "react";
import type { Country } from "../data/countries";
import { COUNTRIES } from "../data/countries";
import { shuffle } from "../utils/array";
import { MAX_ATTEMPTS, POINTS, RESULT } from "../constants/game";
import type { ResultValue } from "../constants/game";

/** Статистика по попыткам за одну сессию. */
export interface GameStats {
  /** Страны, угаданные с первой попытки. */
  firstCount: number;
  /** Страны, угаданные со второй попытки. */
  secondCount: number;
  /** Страны, угаданные с третьей попытки. */
  thirdCount: number;
  /** Провалы и пропуски. */
  failedCount: number;
}

/** Тип уведомления-тоста после каждого действия игрока. */
export type FeedbackType = "correct" | "wrong" | "fail" | "skip";

/** Данные активного тоста, отображаемого над глобусом. */
export interface FeedbackState {
  /** Категория исхода, управляет цветом и текстом тоста. */
  type: FeedbackType;
  /** Заработанные очки — передаётся только при type === "correct". */
  pts?: number;
  /** Оставшихся попыток — передаётся только при type === "wrong". */
  attemptsLeft?: number;
  /** Название страны — передаётся при type === "fail" и "skip". */
  country?: string;
}

/** Публичный интерфейс хука useGame. */
export interface UseGameReturn {
  /** Страна, которую нужно найти на карте в текущем вопросе. */
  currentCountry: Country | undefined;
  /** Индекс текущего вопроса (с нуля). */
  currentIdx: number;
  /** Общее количество вопросов в сессии (= длина перемешанного списка). */
  totalRounds: number;
  /** Количество неверных кликов по текущему вопросу. */
  wrongAttempts: number;
  /** Накопленные очки за сессию. */
  points: number;
  /** Карта: идентификатор страны → значение ResultValue. */
  results: Map<string, ResultValue>;
  /** Активный тост или null, если тост скрыт. */
  feedback: FeedbackState | null;
  /** true после окончания игры (все вопросы пройдены или нажата кнопка Завершить). */
  isOver: boolean;
  /** Разбивка результатов по попыткам для экрана статистики. */
  stats: GameStats;
  /** Обработчик клика по глобусу — принимает нормализованный id из TopoJSON. */
  handleGuess: (clickedId: string | null) => void;
  /** Пропустить текущий вопрос и пометить страну как пропущенную. */
  handleSkip: () => void;
  /** Завершить игру досрочно, пометив оставшиеся вопросы как пропущенные. */
  handleFinish: () => void;
  /** Полный сброс — новая случайная очерёдность стран, все счётчики в ноль. */
  restart: () => void;
}

/** Создаёт новую перемешанную очередь из полного списка стран. */
function makeQueue(): Country[] {
  return shuffle(COUNTRIES);
}

/**
 * Возвращает ключ результата в зависимости от числа ошибочных попыток.
 * 0 ошибок → FIRST, 1 → SECOND, 2+ → THIRD.
 */
function getResultKey(wrongAttempts: number): ResultValue {
  if (wrongAttempts === 0) return RESULT.FIRST;
  if (wrongAttempts === 1) return RESULT.SECOND;
  return RESULT.THIRD;
}

/**
 * Основной хук игровой логики.
 * Управляет очередью вопросов, попытками, очками, тостами и финальным состоянием.
 * Таймер намеренно вынесен в отдельный хук, чтобы сбрасываться независимо при рестарте.
 *
 * @param onGameEnd - Опциональный колбэк, вызывается однократно при завершении игры.
 */
export function useGame(onGameEnd?: () => void): UseGameReturn {
  const [queue, setQueue] = useState<Country[]>(makeQueue);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [points, setPoints] = useState(0);
  const [results, setResults] = useState<Map<string, ResultValue>>(() => new Map());
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isOver, setIsOver] = useState(false);

  const currentIdxRef = useRef(0);
  const queueRef = useRef<Country[]>(queue);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    currentIdxRef.current = currentIdx;
  }, [currentIdx]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  /** Отменяет любой ожидающий таймаут автоперехода или скрытия тоста. */
  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  /** Помечает игру завершённой и вызывает onGameEnd. */
  const endGame = useCallback(() => {
    setIsOver(true);
    onGameEnd?.();
  }, [onGameEnd]);

  /**
   * Сбрасывает состояние текущего вопроса и переходит к следующему.
   * Если очередь исчерпана — завершает игру.
   */
  const advance = useCallback(() => {
    setWrongAttempts(0);
    setFeedback(null);
    setCurrentIdx((prev) => {
      const next = prev + 1;
      currentIdxRef.current = next;
      if (next >= queueRef.current.length) {
        endGame();
        return prev;
      }
      return next;
    });
  }, [endGame]);

  /**
   * Обрабатывает клик по стране на глобусе.
   * Сравнивает clickedId с текущей целевой страной и обновляет попытки/очки/тост.
   *
   * @param clickedId - Нормализованный id из TopoJSON (десятичная строка без ведущих нулей).
   */
  const handleGuess = useCallback(
    (clickedId: string | null) => {
      if (feedback || isOver) return;
      const target = queueRef.current[currentIdxRef.current];
      if (!target) return;

      clearFeedbackTimer();

      if (clickedId === target.id) {
        const resultKey = getResultKey(wrongAttempts);
        const earned = POINTS[resultKey];

        setPoints((p) => p + earned);
        setResults((r) => new Map([...r, [target.id, resultKey]]));
        setFeedback({ type: "correct", pts: earned });
        feedbackTimer.current = setTimeout(advance, 700);
      } else {
        const newWrong = wrongAttempts + 1;

        if (newWrong >= MAX_ATTEMPTS) {
          setResults((r) => new Map([...r, [target.id, RESULT.FAILED]]));
          setFeedback({ type: "fail", country: target.name });
          feedbackTimer.current = setTimeout(advance, 1500);
        } else {
          setWrongAttempts(newWrong);
          setFeedback({ type: "wrong", attemptsLeft: MAX_ATTEMPTS - newWrong });
          feedbackTimer.current = setTimeout(() => setFeedback(null), 1000);
        }
      }
    },
    [feedback, isOver, wrongAttempts, advance, clearFeedbackTimer],
  );

  /**
   * Пропускает текущий вопрос: помечает страну как SKIPPED,
   * показывает тост с названием и переходит к следующему.
   */
  const handleSkip = useCallback(() => {
    if (feedback || isOver) return;
    clearFeedbackTimer();
    const target = queueRef.current[currentIdxRef.current];
    setResults((r) => new Map([...r, [target.id, RESULT.SKIPPED]]));
    setFeedback({ type: "skip", country: target.name });
    feedbackTimer.current = setTimeout(advance, 1000);
  }, [feedback, isOver, advance, clearFeedbackTimer]);

  /**
   * Досрочно завершает игру.
   * Все вопросы, начиная с текущего, помечаются как SKIPPED.
   */
  const handleFinish = useCallback(() => {
    clearFeedbackTimer();
    const idx = currentIdxRef.current;
    const q = queueRef.current;
    setResults((r) => {
      const next = new Map(r);
      for (let i = idx; i < q.length; i++) {
        if (!next.has(q[i]?.id)) next.set(q[i].id, RESULT.SKIPPED);
      }
      return next;
    });
    endGame();
  }, [endGame, clearFeedbackTimer]);

  /**
   * Полный сброс игры: новая перемешанная очередь, все счётчики в ноль,
   * синхронизация внутренних refs.
   */
  const restart = useCallback(() => {
    clearFeedbackTimer();
    const newQueue = makeQueue();
    currentIdxRef.current = 0;
    queueRef.current = newQueue;
    setQueue(newQueue);
    setCurrentIdx(0);
    setWrongAttempts(0);
    setPoints(0);
    setResults(new Map());
    setFeedback(null);
    setIsOver(false);
  }, [clearFeedbackTimer]);

  const totalRounds = queue.length;
  const currentCountry = queue[currentIdx];

  const resultValues = [...results.values()];
  const stats: GameStats = {
    firstCount: resultValues.filter((v) => v === RESULT.FIRST).length,
    secondCount: resultValues.filter((v) => v === RESULT.SECOND).length,
    thirdCount: resultValues.filter((v) => v === RESULT.THIRD).length,
    failedCount: resultValues.filter((v) => v === RESULT.FAILED || v === RESULT.SKIPPED).length,
  };

  return {
    currentCountry,
    currentIdx,
    totalRounds,
    wrongAttempts,
    points,
    results,
    feedback,
    isOver,
    stats,
    handleGuess,
    handleSkip,
    handleFinish,
    restart,
  };
}
