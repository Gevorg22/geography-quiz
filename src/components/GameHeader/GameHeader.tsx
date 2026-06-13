import { formatTime } from "../../utils/time";
import type { GameMode } from "../../types/game";
import { MODE_ICONS } from "../../types/game";
import "./GameHeader.css";

interface GameHeaderProps {
  currentIdx: number;
  totalRounds: number;
  points: number;
  elapsed: number;
  isOver: boolean;
  onFinish: () => void;
  streak?: number;
  mode?: GameMode;
  isCountdown?: boolean;
  isTimerExpired?: boolean;
}

export default function GameHeader({
  currentIdx,
  totalRounds,
  points,
  elapsed,
  isOver,
  onFinish,
  streak = 0,
  mode = "classic",
  isCountdown = false,
  isTimerExpired = false,
}: GameHeaderProps) {
  const timerLabel = isCountdown
    ? `⏳ ${formatTime(elapsed)}`
    : `⏱ ${formatTime(elapsed)}`;

  const timerDanger = isCountdown && elapsed <= 15 && !isTimerExpired;

  return (
    <header className="game-header">
      <div className="game-header__logo">
        {MODE_ICONS[mode]} Geography Quiz
      </div>

      <div className="game-header__center">
        {!isOver && (
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={currentIdx}
            aria-valuemax={totalRounds}
          >
            <div
              className="progress-bar__fill"
              style={{ width: `${(currentIdx / totalRounds) * 100}%` }}
            />
            <span className="progress-bar__label">
              {currentIdx + 1} / {totalRounds}
            </span>
          </div>
        )}
      </div>

      <div className="game-header__right">
        <span className={`game-header__badge${timerDanger ? " game-header__badge--danger" : ""}`}>
          {timerLabel}
        </span>
        <span className="game-header__badge">⭐ {points}</span>
        {streak >= 3 && (
          <span className="game-header__badge game-header__badge--streak">
            🔥 {streak}
          </span>
        )}
        {!isOver && (
          <button className="game-header__finish-btn" onClick={onFinish}>
            Завершить
          </button>
        )}
      </div>
    </header>
  );
}
