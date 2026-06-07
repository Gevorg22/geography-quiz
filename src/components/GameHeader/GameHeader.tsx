import { formatTime } from "../../utils/time";
import "./GameHeader.css";

interface GameHeaderProps {
  /** Индекс текущего вопроса (с нуля). */
  currentIdx: number;
  /** Общее количество вопросов в очереди. */
  totalRounds: number;
  /** Накопленные очки за сессию. */
  points: number;
  /** Прошедшее время в секундах (из useTimer). */
  elapsed: number;
  /** Скрывает прогресс-бар и кнопку завершения после окончания игры. */
  isOver: boolean;
  /** Колбэк при нажатии кнопки «Завершить». */
  onFinish: () => void;
}

/**
 * Закреплённая шапка, отображаемая во время активной сессии.
 * Содержит логотип, прогресс-бар, таймер, очки и кнопку завершения.
 */
export default function GameHeader({
  currentIdx,
  totalRounds,
  points,
  elapsed,
  isOver,
  onFinish,
}: GameHeaderProps) {
  return (
    <header className="game-header">
      <div className="game-header__logo">🌍 Geography Quiz</div>

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
        <span className="game-header__badge">⏱ {formatTime(elapsed)}</span>
        <span className="game-header__badge">⭐ {points}</span>
        {!isOver && (
          <button className="game-header__finish-btn" onClick={onFinish}>
            Завершить
          </button>
        )}
      </div>
    </header>
  );
}
