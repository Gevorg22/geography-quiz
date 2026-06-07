import { motion } from "framer-motion";
import { formatTime } from "../../utils/time";
import { POINTS } from "../../constants/game";
import type { GameStats } from "../../hooks/useGame";
import "./GameOver.css";

/**
 * Пороги рейтинга от лучшего к худшему.
 * Первый элемент, чей `min` ≤ доле очков игрока, определяет надпись.
 */
const RATING_THRESHOLDS = [
  { min: 0.9, label: "🏆 Идеально!" },
  { min: 0.7, label: "🥇 Отлично!" },
  { min: 0.5, label: "🥈 Хорошо!" },
  { min: 0, label: "📚 Нужно потренироваться!" },
];

/**
 * Выбирает текстовую оценку по соотношению заработанных к максимальным очкам.
 */
function getRating(pts: number, maxPoints: number): string {
  const ratio = pts / maxPoints;
  return RATING_THRESHOLDS.find((t) => ratio >= t.min)?.label ?? "";
}

/**
 * Конфигурация строк в таблице статистики.
 * Каждая строка связана с ключом GameStats, цветовым модификатором, подписью и ценой.
 */
const STAT_ROWS: Array<{
  key: keyof GameStats;
  modifier: string;
  label: string;
  pts: number;
}> = [
  { key: "firstCount", modifier: "green", label: "С первой попытки", pts: POINTS.first },
  { key: "secondCount", modifier: "yellow", label: "Со второй попытки", pts: POINTS.second },
  { key: "thirdCount", modifier: "orange", label: "С третьей попытки", pts: POINTS.third },
  { key: "failedCount", modifier: "red", label: "Не угадано / пропущено", pts: 0 },
];

interface GameOverProps {
  /** Разбивка результатов по попыткам. */
  stats: GameStats;
  /** Суммарные очки за сессию. */
  totalPoints: number;
  /** Максимально возможные очки (totalRounds × POINTS.first). */
  maxPoints: number;
  /** Общее время сессии в секундах. */
  elapsed: number;
  /** Колбэк при нажатии «Играть ещё раз». */
  onRestart: () => void;
}

/**
 * Экран результатов, появляющийся после завершения игры.
 * Показывает время, разбивку по попыткам, итоговый счёт и рейтинг.
 * Карточка анимируется spring-анимацией при появлении.
 */
export default function GameOver({
  stats,
  totalPoints,
  maxPoints,
  elapsed,
  onRestart,
}: GameOverProps) {
  return (
    <div className="game-over">
      <motion.div
        className="game-over__card"
        initial={{ opacity: 0, scale: 0.92, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
      >
        <div className="game-over__icon">🌍</div>
        <h2 className="game-over__title">Игра завершена!</h2>
        <p className="game-over__time">⏱ {formatTime(elapsed)}</p>

        <ul className="game-over__stats">
          {STAT_ROWS.map(({ key, modifier, label, pts }) => {
            const count = stats[key];
            if (count === 0 && modifier === "orange") return null;
            return (
              <motion.li
                key={key}
                className={`stat-row stat-row--${modifier}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <span className="stat-row__dot" />
                <span className="stat-row__count">{count}</span>
                <span className="stat-row__label">{label}</span>
                <span className="stat-row__pts">{pts > 0 ? `+${count * pts} очк.` : "0 очк."}</span>
              </motion.li>
            );
          })}
        </ul>

        <div className="game-over__score">
          <span className="game-over__score-value">{totalPoints}</span>
          <span className="game-over__score-max"> / {maxPoints} очков</span>
        </div>

        <p className="game-over__rating">{getRating(totalPoints, maxPoints)}</p>

        <button className="game-over__restart-btn" onClick={onRestart}>
          Играть ещё раз
        </button>
      </motion.div>
    </div>
  );
}
