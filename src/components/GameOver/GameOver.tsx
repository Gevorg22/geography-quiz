import { motion } from "framer-motion";
import { formatTime } from "../../utils/time";
import { POINTS } from "../../constants/game";
import type { GameStats } from "../../hooks/useGame";
import type { GameRecord } from "../../hooks/useHistory";
import type { GameMode } from "../../types/game";
import { MODE_LABELS } from "../../types/game";
import "./GameOver.css";

const RATING_THRESHOLDS = [
  { min: 0.9, label: "🏆 Идеально!" },
  { min: 0.7, label: "🥇 Отлично!" },
  { min: 0.5, label: "🥈 Хорошо!" },
  { min: 0, label: "📚 Нужно потренироваться!" },
];

function getRating(pts: number, maxPoints: number): string {
  const ratio = pts / maxPoints;
  return RATING_THRESHOLDS.find((t) => ratio >= t.min)?.label ?? "";
}

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
  stats: GameStats;
  totalPoints: number;
  maxPoints: number;
  elapsed: number;
  onRestart: () => void;
  onSetup?: () => void;
  streak?: number;
  fact?: string;
  topRecords?: GameRecord[];
  mode?: GameMode;
}

export default function GameOver({
  stats,
  totalPoints,
  maxPoints,
  elapsed,
  onRestart,
  onSetup,
  streak = 0,
  fact,
  topRecords = [],
  mode = "classic",
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
        <p className="game-over__mode">{MODE_LABELS[mode]}</p>
        <p className="game-over__time">⏱ {formatTime(elapsed)}</p>
        {streak >= 3 && (
          <p className="game-over__streak">🔥 Лучшая серия: {streak}</p>
        )}

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

        {topRecords.length > 0 && (
          <div className="game-over__records">
            <p className="game-over__records-title">🏆 Топ результаты</p>
            <ol className="game-over__records-list">
              {topRecords.map((r, i) => (
                <li key={r.id} className="game-over__record-row">
                  <span className="game-over__record-rank">#{i + 1}</span>
                  <span className="game-over__record-pts">{r.totalPoints} оч.</span>
                  <span className="game-over__record-meta">{formatTime(r.elapsed)}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {fact && (
          <div className="game-over__fact">
            <span className="game-over__fact-icon">📖</span>
            <p className="game-over__fact-text">{fact}</p>
          </div>
        )}

        <div className="game-over__actions">
          <button className="game-over__restart-btn" onClick={onRestart}>
            Ещё раз
          </button>
          {onSetup && (
            <button className="game-over__setup-btn" onClick={onSetup}>
              Настройки
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
