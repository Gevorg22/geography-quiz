import { useState, useEffect, useRef, useCallback } from "react";

interface UseTimerOptions {
  mode?: "up" | "down";
  initialSeconds?: number;
  onExpire?: () => void;
}

interface UseTimerReturn {
  elapsed: number;
  isExpired: boolean;
  stop: () => void;
  reset: () => void;
}

export function useTimer({
  mode = "up",
  initialSeconds = 120,
  onExpire,
}: UseTimerOptions = {}): UseTimerReturn {
  const [elapsed, setElapsed] = useState(mode === "down" ? initialSeconds : 0);
  const [isExpired, setIsExpired] = useState(false);
  const runningRef = useRef(true);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    runningRef.current = true;
    setIsExpired(false);
    setElapsed(mode === "down" ? initialSeconds : 0);

    const id = setInterval(() => {
      if (!runningRef.current) return;
      setElapsed((prev) => {
        if (mode === "down") {
          const next = prev - 1;
          if (next <= 0) {
            runningRef.current = false;
            setIsExpired(true);
            onExpireRef.current?.();
            return 0;
          }
          return next;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [mode, initialSeconds]);

  const stop = useCallback(() => {
    runningRef.current = false;
  }, []);

  const reset = useCallback(() => {
    runningRef.current = true;
    setIsExpired(false);
    setElapsed(mode === "down" ? initialSeconds : 0);
  }, [mode, initialSeconds]);

  return { elapsed, isExpired, stop, reset };
}
