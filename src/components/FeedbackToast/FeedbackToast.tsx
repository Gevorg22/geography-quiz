import { motion } from "framer-motion";
import type { FeedbackState } from "../../hooks/useGame";
import "./FeedbackToast.css";

/**
 * Фабрика текстовых сообщений по типу тоста.
 * Каждый элемент — функция, принимающая payload и возвращающая строку.
 */
const MESSAGES: Record<FeedbackState["type"], (f: FeedbackState) => string> = {
  correct: ({ pts }) => `✓ Верно! ${pts && pts > 0 ? `+${pts} ${pts === 1 ? "очко" : "очка"}` : ""}`,
  wrong: ({ attemptsLeft }) =>
    `✗ Неверно — ${attemptsLeft === 1 ? "последняя попытка!" : `ещё ${attemptsLeft} попытки`}`,
  fail: ({ country }) => `✗ Не угадали — ${country}`,
  skip: ({ country }) => `⏭ Пропущено — ${country}`,
};

interface FeedbackToastProps {
  /** Данные активного тоста из useGame. */
  feedback: FeedbackState;
}

/**
 * Всплывающее уведомление, отображаемое после каждого действия игрока.
 * Анимирует появление и исчезновение через Framer Motion.
 * AnimatePresence с ключом по содержимому тоста находится в App.tsx.
 */
export default function FeedbackToast({ feedback }: FeedbackToastProps) {
  const getMessage = MESSAGES[feedback.type];
  const text = getMessage ? getMessage(feedback) : "";

  return (
    <motion.div
      className={`feedback-toast feedback-toast--${feedback.type}`}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ duration: 0.18 }}
    >
      {text}
    </motion.div>
  );
}
