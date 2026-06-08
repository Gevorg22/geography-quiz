import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { FeedbackState } from "../../hooks/useGame";
import "./FeedbackToast.css";

const MESSAGES: Record<FeedbackState["type"], (f: FeedbackState) => string> = {
  correct: ({ pts }) => `✓ Верно! ${pts && pts > 0 ? `+${pts} ${pts === 1 ? "очко" : "очка"}` : ""}`,
  wrong: ({ attemptsLeft }) =>
    `✗ Неверно — ${attemptsLeft === 1 ? "последняя попытка!" : `ещё ${attemptsLeft} попытки`}`,
  fail: ({ country }) => `✗ Не угадали — ${country}`,
  skip: ({ country }) => `⏭ Пропущено — ${country}`,
};

interface VisualViewportSnapshot {
  offsetLeft: number;
  offsetTop: number;
  width: number;
  height: number;
}

function getSnapshot(): VisualViewportSnapshot {
  const vv = window.visualViewport;
  return {
    offsetLeft: vv?.offsetLeft ?? 0,
    offsetTop: vv?.offsetTop ?? 0,
    width: vv?.width ?? window.innerWidth,
    height: vv?.height ?? window.innerHeight,
  };
}

function useVisualViewport(): VisualViewportSnapshot {
  const [vp, setVp] = useState<VisualViewportSnapshot>(getSnapshot);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () =>
      setVp({
        offsetLeft: vv.offsetLeft,
        offsetTop: vv.offsetTop,
        width: vv.width,
        height: vv.height,
      });
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return vp;
}

const BOTTOM_OFFSET = 44;

interface FeedbackToastProps {
  feedback: FeedbackState;
}

export default function FeedbackToast({ feedback }: FeedbackToastProps) {
  const getMessage = MESSAGES[feedback.type];
  const text = getMessage ? getMessage(feedback) : "";
  const { offsetLeft, offsetTop, width, height } = useVisualViewport();

  return (
    <motion.div
      className={`feedback-toast feedback-toast--${feedback.type}`}
      style={{
        left: offsetLeft + width / 2,
        top: offsetTop + height - BOTTOM_OFFSET,
        x: "-50%",
        y: "-100%",
      }}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
    >
      {text}
    </motion.div>
  );
}
