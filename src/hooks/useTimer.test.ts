import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTimer } from "./useTimer";

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("начинает с elapsed = 0", () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.elapsed).toBe(0);
  });

  it("увеличивает elapsed на 1 каждую секунду", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.elapsed).toBe(3);
  });

  it("stop останавливает таймер — elapsed перестаёт расти", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.elapsed).toBe(2);

    act(() => {
      result.current.stop();
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.elapsed).toBe(2);
  });

  it("reset обнуляет elapsed и перезапускает счёт", () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.elapsed).toBe(5);

    act(() => {
      result.current.reset();
    });
    expect(result.current.elapsed).toBe(0);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.elapsed).toBe(2);
  });
});
