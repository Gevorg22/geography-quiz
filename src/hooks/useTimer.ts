import { useState, useEffect, useRef, useCallback } from "react";

/** Публичный интерфейс хука useTimer. */
export interface UseTimerReturn {
  /** Прошедшее время в секундах с момента старта или последнего сброса. */
  elapsed: number;
  /** Останавливает таймер, не сбрасывая elapsed. */
  stop: () => void;
  /** Сбрасывает elapsed в 0 и немедленно перезапускает отсчёт. */
  reset: () => void;
}

/**
 * Секундомер, который запускается автоматически при монтировании компонента.
 * Обновляет `elapsed` раз в секунду через `setInterval`.
 *
 * @returns Объект с текущим временем и методами stop/reset.
 */
export function useTimer(): UseTimerReturn {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTick = useCallback(() => {
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000));
    }, 1000);
  }, []);

  useEffect(() => {
    startTick();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTick]);

  /** Останавливает интервал, не изменяя elapsed. */
  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  /** Очищает интервал, сбрасывает elapsed в 0 и перезапускает счёт. */
  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsed(0);
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000));
    }, 1000);
  }, []);

  return { elapsed, stop, reset };
}
