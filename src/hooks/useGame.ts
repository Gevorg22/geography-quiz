import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Country } from "../data/countries";
import { COUNTRIES } from "../data/countries";
import { shuffle } from "../utils/array";
import { MAX_ATTEMPTS, POINTS, RESULT } from "../constants/game";
import type { ResultValue } from "../constants/game";
import type { GameConfig } from "../types/game";

export interface GameStats {
  firstCount: number;
  secondCount: number;
  thirdCount: number;
  failedCount: number;
}

export type FeedbackType = "correct" | "wrong" | "fail" | "skip";

export interface FeedbackState {
  type: FeedbackType;
  pts?: number;
  attemptsLeft?: number;
  country?: string;
  streak?: number;
}

export interface UseGameReturn {
  currentCountry: Country | undefined;
  currentIdx: number;
  totalRounds: number;
  wrongAttempts: number;
  points: number;
  streak: number;
  hintUsed: boolean;
  results: Map<string, ResultValue>;
  feedback: FeedbackState | null;
  isOver: boolean;
  stats: GameStats;
  handleGuess: (clickedId: string | null) => void;
  handleSkip: () => void;
  handleFinish: () => void;
  handleHint: () => void;
  restart: () => void;
}

function filterCountries(config: GameConfig): Country[] {
  return COUNTRIES.filter((c) => {
    if (config.region !== "all" && c.region !== config.region) return false;
    if (config.difficulty !== "all" && c.difficulty !== config.difficulty) return false;
    return true;
  });
}

function makeQueue(config: GameConfig): Country[] {
  const pool = filterCountries(config);
  return shuffle(pool.length > 0 ? pool : COUNTRIES);
}

function getResultKey(wrongAttempts: number): ResultValue {
  if (wrongAttempts === 0) return RESULT.FIRST;
  if (wrongAttempts === 1) return RESULT.SECOND;
  return RESULT.THIRD;
}

export function useGame(onGameEnd?: () => void, config?: GameConfig): UseGameReturn {
  const effectiveConfig: GameConfig = useMemo(
    () =>
      config ?? {
        mode: "classic",
        region: "all",
        difficulty: "all",
      },
    [config],
  );

  const [queue, setQueue] = useState<Country[]>(() => makeQueue(effectiveConfig));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [results, setResults] = useState<Map<string, ResultValue>>(() => new Map());
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isOver, setIsOver] = useState(false);

  const currentIdxRef = useRef(0);
  const queueRef = useRef<Country[]>(queue);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streakRef = useRef(0);
  const hintUsedRef = useRef(false);

  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { hintUsedRef.current = hintUsed; }, [hintUsed]);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  const endGame = useCallback(() => {
    setIsOver(true);
    onGameEnd?.();
  }, [onGameEnd]);

  const advance = useCallback(() => {
    setWrongAttempts(0);
    setHintUsed(false);
    hintUsedRef.current = false;
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

  const handleGuess = useCallback(
    (clickedId: string | null) => {
      if (feedback || isOver) return;
      const target = queueRef.current[currentIdxRef.current];
      if (!target) return;

      clearFeedbackTimer();

      if (clickedId === target.id) {
        const resultKey = getResultKey(wrongAttempts);
        const baseEarned = POINTS[resultKey];
        const earned = hintUsedRef.current ? Math.max(0, baseEarned - 1) : baseEarned;
        const newStreak = wrongAttempts === 0 ? streakRef.current + 1 : 0;

        setPoints((p) => p + earned);
        setStreak(newStreak);
        streakRef.current = newStreak;
        setResults((r) => new Map([...r, [target.id, resultKey]]));
        setFeedback({ type: "correct", pts: earned, streak: newStreak });
        feedbackTimer.current = setTimeout(advance, 700);
      } else {
        const newWrong = wrongAttempts + 1;
        if (newWrong >= MAX_ATTEMPTS) {
          setStreak(0);
          streakRef.current = 0;
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

  const handleSkip = useCallback(() => {
    if (feedback || isOver) return;
    clearFeedbackTimer();
    const target = queueRef.current[currentIdxRef.current];
    setStreak(0);
    streakRef.current = 0;
    setResults((r) => new Map([...r, [target.id, RESULT.SKIPPED]]));
    setFeedback({ type: "skip", country: target.name });
    feedbackTimer.current = setTimeout(advance, 1000);
  }, [feedback, isOver, advance, clearFeedbackTimer]);

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

  const handleHint = useCallback(() => {
    if (feedback || isOver || hintUsedRef.current) return;
    setHintUsed(true);
    hintUsedRef.current = true;
  }, [feedback, isOver]);

  const restart = useCallback(() => {
    clearFeedbackTimer();
    const newQueue = makeQueue(effectiveConfig);
    currentIdxRef.current = 0;
    queueRef.current = newQueue;
    streakRef.current = 0;
    hintUsedRef.current = false;
    setQueue(newQueue);
    setCurrentIdx(0);
    setWrongAttempts(0);
    setPoints(0);
    setStreak(0);
    setHintUsed(false);
    setResults(new Map());
    setFeedback(null);
    setIsOver(false);
  }, [clearFeedbackTimer, effectiveConfig]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    restart();
  }, [restart]);

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
    streak,
    hintUsed,
    results,
    feedback,
    isOver,
    stats,
    handleGuess,
    handleSkip,
    handleFinish,
    handleHint,
    restart,
  };
}
