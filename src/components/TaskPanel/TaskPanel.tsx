import { AnimatePresence, motion } from "framer-motion";
import type { Country } from "../../data/countries";
import { MAX_ATTEMPTS } from "../../constants/game";
import "./TaskPanel.css";

interface TaskPanelProps {
  /** Страна, которую нужно найти на карте. */
  country: Country | undefined;
  /** Количество неверных кликов по текущему вопросу (0–MAX_ATTEMPTS-1). */
  wrongAttempts: number;
  /** Колбэк при нажатии «Не знаю / Пропустить». */
  onSkip: () => void;
}

/**
 * Панель с текущим вопросом.
 * Отображает название страны, точки попыток и кнопку пропуска.
 * Название страны анимируется при переходе к следующему вопросу.
 */
export default function TaskPanel({ country, wrongAttempts, onSkip }: TaskPanelProps) {
  return (
    <div className="task-panel">
      <p className="task-panel__label">Найдите на карте</p>

      <AnimatePresence mode="wait">
        <motion.h1
          key={country?.id}
          className="task-panel__country"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 18 }}
          transition={{ duration: 0.18 }}
        >
          {country?.name}
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

        <button className="skip-btn" onClick={onSkip}>
          Не знаю / Пропустить
        </button>
      </div>
    </div>
  );
}
