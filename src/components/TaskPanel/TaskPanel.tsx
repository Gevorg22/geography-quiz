import { AnimatePresence, motion } from "framer-motion";
import type { Country } from "../../data/countries";
import { MAX_ATTEMPTS } from "../../constants/game";
import { useVisualViewport } from "../../hooks/useVisualViewport";
import type { GameMode } from "../../types/game";
import "./TaskPanel.css";

interface TaskPanelProps {
  country: Country | undefined;
  wrongAttempts: number;
  onSkip: () => void;
  mode?: GameMode;
  hintUsed?: boolean;
  onHint?: () => void;
}

const HEADER_HEIGHT = 60;

export default function TaskPanel({
  country,
  wrongAttempts,
  onSkip,
  mode = "classic",
  hintUsed = false,
  onHint,
}: TaskPanelProps) {
  const { offsetLeft, offsetTop, width, scale } = useVisualViewport();
  const inv = 1 / scale;

  const isCapitals = mode === "capitals";

  return (
    <motion.div
      className="task-panel"
      style={{
        left: offsetLeft + width / 2,
        top: offsetTop + HEADER_HEIGHT * inv,
        x: "-50%",
        scale: inv,
        transformOrigin: "top center",
      }}
    >
      <p className="task-panel__label">
        {isCapitals ? "Найдите страну со столицей" : "Найдите на карте"}
      </p>

      <AnimatePresence mode="wait">
        <motion.h1
          key={country?.id}
          className="task-panel__country"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 18 }}
          transition={{ duration: 0.18 }}
        >
          {isCapitals ? country?.capital : country?.name}
        </motion.h1>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.p
          key={country?.id}
          className="task-panel__sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {country?.en}
        </motion.p>
      </AnimatePresence>

      <div className="task-panel__row">
        <div
          className="attempt-dots"
          aria-label={`Попытка ${wrongAttempts + 1} из ${MAX_ATTEMPTS}`}
        >
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
            <motion.span
              key={i}
              className={`attempt-dot ${i < wrongAttempts ? "attempt-dot--used" : "attempt-dot--available"}`}
              animate={i === wrongAttempts - 1 ? { scale: [1, 1.5, 1] } : { scale: 1 }}
              transition={{ duration: 0.25 }}
            />
          ))}
        </div>

        {onHint && (
          <button
            className={`hint-btn${hintUsed ? " hint-btn--used" : ""}`}
            onClick={onHint}
            disabled={hintUsed}
            title="Повернуть глобус к стране (−1 очко)"
          >
            {hintUsed ? "💡 Подсказка использована" : "💡 Подсказка"}
          </button>
        )}

        <button className="skip-btn" onClick={onSkip}>
          Не знаю / Пропустить
        </button>
      </div>
    </motion.div>
  );
}
