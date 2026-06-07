/**
 * @file Корневой компонент приложения.
 *
 * Компонует все хуки и компоненты в единый игровой процесс:
 *
 * ```
 * App
 * ├── GameHeader    — прогресс-бар, таймер, очки, кнопка завершения
 * ├── TaskPanel     — название страны, точки попыток, пропуск
 * ├── Globe         — интерактивный D3-глобус
 * ├── ZoomControls  — кнопки +/− привязанные к ref-API глобуса
 * ├── FeedbackToast — анимированные уведомления об исходе хода
 * └── GameOver      — экран итоговой статистики
 * ```
 *
 * Владение состоянием:
 * - Игровая логика — в useGame
 * - Таймер — в useTimer (отдельно, чтобы сбрасываться независимо при рестарте)
 * - Производные значения totalPoints/maxPoints вычисляются здесь, а не в хуках
 */
import { useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useGame } from "./hooks/useGame";
import { useTimer } from "./hooks/useTimer";
import { POINTS } from "./constants/game";
import Globe from "./components/Globe/Globe";
import type { GlobeHandle } from "./components/Globe/Globe";
import GameHeader from "./components/GameHeader/GameHeader";
import TaskPanel from "./components/TaskPanel/TaskPanel";
import ZoomControls from "./components/ZoomControls/ZoomControls";
import FeedbackToast from "./components/FeedbackToast/FeedbackToast";
import GameOver from "./components/GameOver/GameOver";
import "./App.css";

export default function App() {
  const globeRef = useRef<GlobeHandle>(null);
  const { elapsed, stop: stopTimer, reset: resetTimer } = useTimer();

  const handleGameEnd = useCallback(() => stopTimer(), [stopTimer]);

  const {
    currentCountry,
    currentIdx,
    totalRounds,
    wrongAttempts,
    points,
    results,
    feedback,
    isOver,
    stats,
    handleGuess,
    handleSkip,
    handleFinish,
    restart,
  } = useGame(handleGameEnd);

  const handleRestart = useCallback(() => {
    restart();
    resetTimer();
  }, [restart, resetTimer]);

  const totalPoints =
    stats.firstCount * POINTS.first +
    stats.secondCount * POINTS.second +
    stats.thirdCount * POINTS.third;

  const maxPoints = totalRounds * POINTS.first;

  return (
    <div className="app">
      <GameHeader
        currentIdx={currentIdx}
        totalRounds={totalRounds}
        points={points}
        elapsed={elapsed}
        isOver={isOver}
        onFinish={handleFinish}
      />

      <main className="app__main">
        {!isOver ? (
          <>
            <TaskPanel country={currentCountry} wrongAttempts={wrongAttempts} onSkip={handleSkip} />

            <div className="app__globe-area">
              <Globe ref={globeRef} onGuess={handleGuess} results={results} />
              <ZoomControls
                onZoomIn={() => globeRef.current?.zoomIn()}
                onZoomOut={() => globeRef.current?.zoomOut()}
              />
            </div>

            <AnimatePresence mode="wait">
              {feedback && (
                <FeedbackToast
                  key={`${feedback.type}-${feedback.pts}-${feedback.attemptsLeft}-${feedback.country}`}
                  feedback={feedback}
                />
              )}
            </AnimatePresence>
          </>
        ) : (
          <GameOver
            stats={stats}
            totalPoints={totalPoints}
            maxPoints={maxPoints}
            elapsed={elapsed}
            onRestart={handleRestart}
          />
        )}
      </main>

      {!isOver && <p className="app__hint">Тащи глобус · Колесо мыши или ± — масштаб</p>}
    </div>
  );
}
