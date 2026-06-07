import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGame } from "./useGame";
import { RESULT, POINTS } from "../constants/game";

describe("useGame", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("инициализируется с нулевым счётом и первым вопросом", () => {
    const { result } = renderHook(() => useGame());

    expect(result.current.currentIdx).toBe(0);
    expect(result.current.points).toBe(0);
    expect(result.current.wrongAttempts).toBe(0);
    expect(result.current.isOver).toBe(false);
    expect(result.current.feedback).toBeNull();
    expect(result.current.currentCountry).toBeDefined();
  });

  it("засчитывает POINTS.first очков при угадывании с первой попытки", () => {
    const { result } = renderHook(() => useGame());
    const target = result.current.currentCountry!;

    act(() => {
      result.current.handleGuess(target.id);
      vi.advanceTimersByTime(700);
    });

    expect(result.current.points).toBe(POINTS.first);
    expect(result.current.results.get(target.id)).toBe(RESULT.FIRST);
  });

  it("засчитывает POINTS.second очков при угадывании со второй попытки", () => {
    const { result } = renderHook(() => useGame());
    const target = result.current.currentCountry!;

    act(() => {
      result.current.handleGuess("__wrong__");
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      result.current.handleGuess(target.id);
      vi.advanceTimersByTime(700);
    });

    expect(result.current.points).toBe(POINTS.second);
    expect(result.current.results.get(target.id)).toBe(RESULT.SECOND);
  });

  it("помечает страну как FAILED после трёх неверных попыток", () => {
    const { result } = renderHook(() => useGame());
    const target = result.current.currentCountry!;

    act(() => {
      result.current.handleGuess("__wrong1__");
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      result.current.handleGuess("__wrong2__");
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      result.current.handleGuess("__wrong3__");
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.results.get(target.id)).toBe(RESULT.FAILED);
    expect(result.current.points).toBe(0);
  });

  it("handleSkip помечает страну как SKIPPED и переходит к следующему вопросу", () => {
    const { result } = renderHook(() => useGame());
    const target = result.current.currentCountry!;

    act(() => {
      result.current.handleSkip();
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.results.get(target.id)).toBe(RESULT.SKIPPED);
    expect(result.current.currentIdx).toBe(1);
  });

  it("handleFinish немедленно завершает игру", () => {
    const onGameEnd = vi.fn();
    const { result } = renderHook(() => useGame(onGameEnd));

    act(() => {
      result.current.handleFinish();
    });

    expect(result.current.isOver).toBe(true);
    expect(onGameEnd).toHaveBeenCalledOnce();
  });

  it("restart полностью сбрасывает состояние игры", () => {
    const { result } = renderHook(() => useGame());
    const target = result.current.currentCountry!;

    act(() => {
      result.current.handleGuess(target.id);
      vi.advanceTimersByTime(700);
    });
    expect(result.current.points).toBe(POINTS.first);

    act(() => {
      result.current.restart();
    });

    expect(result.current.points).toBe(0);
    expect(result.current.currentIdx).toBe(0);
    expect(result.current.results.size).toBe(0);
    expect(result.current.isOver).toBe(false);
    expect(result.current.feedback).toBeNull();
  });

  it("игнорирует клики во время отображения тоста", () => {
    const { result } = renderHook(() => useGame());
    const target = result.current.currentCountry!;

    act(() => {
      result.current.handleGuess(target.id);
    });
    const pointsAfterFirst = result.current.points;

    act(() => {
      result.current.handleGuess(target.id);
    });

    expect(result.current.points).toBe(pointsAfterFirst);
  });

  it("статистика корректно подсчитывается после нескольких вопросов", () => {
    const { result } = renderHook(() => useGame());

    const first = result.current.currentCountry!;
    act(() => {
      result.current.handleGuess(first.id);
      vi.advanceTimersByTime(700);
    });

    const second = result.current.currentCountry!;
    act(() => {
      result.current.handleSkip();
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.stats.firstCount).toBe(1);
    expect(result.current.stats.failedCount).toBe(1);
    expect(result.current.results.get(second.id)).toBe(RESULT.SKIPPED);
  });
});
