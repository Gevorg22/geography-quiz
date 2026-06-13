import { motion } from "framer-motion";
import type { FeedbackState } from "../../hooks/useGame";
import { useVisualViewport } from "../../hooks/useVisualViewport";
import "./FeedbackToast.css";

const MESSAGES: Record<FeedbackState["type"], (f: FeedbackState) => string> = {
  correct: ({ pts }) => `✓ Верно! ${pts && pts > 0 ? `+${pts} ${pts === 1 ? "очко" : "очка"}` : ""}`,
  wrong: ({ attemptsLeft }) =>
    `✗ Неверно — ${attemptsLeft === 1 ? "последняя попытка!" : `ещё ${attemptsLeft} попытки`}`,
  fail: ({ country }) => `✗ Не угадали — ${country}`,
  skip: ({ country }) => `⏭ Пропущено — ${country}`,
};

const BOTTOM_OFFSET = 44;

interface FeedbackToastProps {
  feedback: FeedbackState;
}

export default function FeedbackToast({ feedback }: FeedbackToastProps) {
  const getMessage = MESSAGES[feedback.type];
  const text = getMessage ? getMessage(feedback) : "";
  const { offsetLeft, offsetTop, width, height, scale } = useVisualViewport();

  const inv = 1 / scale;

  return (
    <motion.div
      className={`feedback-toast feedback-toast--${feedback.type}`}
      style={{
        left: offsetLeft + width / 2,
        top: offsetTop + height - BOTTOM_OFFSET,
        x: "-50%",
        y: `${-100 * inv}%`,
      }}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, scale: inv * 0.96 }}
      animate={{ opacity: 1, scale: inv }}
      exit={{ opacity: 0, scale: inv * 0.96 }}
      transition={{ duration: 0.18 }}
    >
      {text}
    </motion.div>
  );
}
