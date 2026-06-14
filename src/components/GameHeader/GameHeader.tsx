import { motion } from "framer-motion";
import { useVisualViewport } from "../../hooks/useVisualViewport";
import type { GameMode } from "../../types/game";
import { MODE_ICONS } from "../../types/game";
import "./GameHeader.css";

interface GameHeaderProps {
  currentIdx: number;
  totalRounds: number;
  points: number;
  isOver: boolean;
  onFinish: () => void;
  streak?: number;
  mode?: GameMode;
}

export default function GameHeader({
  currentIdx,
  totalRounds,
  points,
  isOver,
  onFinish,
  streak = 0,
  mode = "classic",
}: GameHeaderProps) {
  const { offsetLeft, offsetTop, width, scale } = useVisualViewport();
  const inv = 1 / scale;

  return (
    <motion.header
      className="game-header"
      style={{
        left: offsetLeft,
        top: offsetTop,
        width: width * scale,
        scale: inv,
        transformOrigin: "top left",
      }}
    >
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
    </motion.header>
  );
}
