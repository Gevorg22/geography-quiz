import { useRef, useCallback, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useGame } from "./hooks/useGame";
import { useHistory } from "./hooks/useHistory";
import { POINTS, RESULT } from "./constants/game";
import type { GameConfig } from "./types/game";
import { DEFAULT_CONFIG } from "./types/game";
import { COUNTRIES } from "./data/countries";
import { sounds } from "./utils/sounds";
import { haptic } from "./utils/haptic";
import Globe from "./components/Globe/Globe";
import type { GlobeHandle } from "./components/Globe/Globe";
import GameHeader from "./components/GameHeader/GameHeader";
import TaskPanel from "./components/TaskPanel/TaskPanel";
import ZoomControls from "./components/ZoomControls/ZoomControls";
import FeedbackToast from "./components/FeedbackToast/FeedbackToast";
import GameOver from "./components/GameOver/GameOver";
import GameSetup from "./components/GameSetup/GameSetup";
import "./App.css";

type Phase = "setup" | "game";

export default function App() {
  const globeRef = useRef<GlobeHandle>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);

  const { topRecords, topWeakSpots, totalGames, saveRecord, clearHistory } = useHistory();

  const {
    currentCountry,
    currentIdx,
    totalRounds,
    wrongAttempts,
    points,
    streak,
    hintUsed,
    results,
    feedback,
    isOver,
    stats,
    handleGuess,
    handleSkip,
    handleFinish,
    handleHint,
    restart,
  } = useGame(undefined, config);

  const saveRecordRef = useRef(saveRecord);
  useEffect(() => { saveRecordRef.current = saveRecord; }, [saveRecord]);

  const gameSnapshotRef = useRef({ results, totalRounds, config, points, stats, streak });
  useEffect(() => {
    gameSnapshotRef.current = { results, totalRounds, config, points, stats, streak };
  });

  useEffect(() => {
    if (!isOver) return;
    const { results: r, totalRounds: tr, config: cfg, points: pts, stats: st, streak: sk } = gameSnapshotRef.current;
    const failedIds = [...r.entries()]
      .filter(([, v]) => v === RESULT.FAILED || v === RESULT.SKIPPED)
      .map(([id]) => {
        const c = COUNTRIES.find((x) => x.id === id);
        return c ? { id: c.id, name: c.name } : null;
      })
      .filter(Boolean) as { id: string; name: string }[];

    const maxPoints = tr * POINTS.first;
    saveRecordRef.current(
      {
        mode: cfg.mode,
        region: cfg.region,
        difficulty: cfg.difficulty,
        totalPoints: pts,
        maxPoints,
        stats: st,
        streak: sk,
      },
      failedIds,
    );
  }, [isOver]);

  const handleHintWithGlobe = useCallback(() => {
    handleHint();
    if (currentCountry) {
      globeRef.current?.rotateToCountry(currentCountry.id);
      sounds.hint();
      haptic.hint();
    }
  }, [handleHint, currentCountry]);

  const wrappedGuess = useCallback(
    (id: string | null) => {
      if (!feedback && !isOver) {
        handleGuess(id);
      }
    },
    [handleGuess, feedback, isOver],
  );

  useEffect(() => {
    if (!feedback) return;
    if (feedback.type === "correct") {
      if (feedback.streak && feedback.streak >= 3) {
        sounds.streak();
        haptic.correct();
      } else {
        sounds.correct();
        haptic.correct();
      }
    } else if (feedback.type === "wrong") {
      sounds.wrong();
      haptic.wrong();
    } else if (feedback.type === "fail") {
      sounds.fail();
      haptic.fail();
    } else if (feedback.type === "skip") {
      sounds.skip();
      haptic.skip();
    }
  }, [feedback]);

  const handleStart = useCallback((cfg: GameConfig) => {
    setConfig(cfg);
    setPhase("game");
  }, []);

  const handleRestart = useCallback(() => {
    restart();
  }, [restart]);

  const handleSetup = useCallback(() => {
    setPhase("setup");
  }, []);

  if (phase === "setup") {
    return (
      <GameSetup
        onStart={handleStart}
        topRecords={topRecords}
        topWeakSpots={topWeakSpots}
        totalGames={totalGames}
        onClearHistory={clearHistory}
      />
    );
  }

  const totalPoints =
    stats.firstCount * POINTS.first +
    stats.secondCount * POINTS.second +
    stats.thirdCount * POINTS.third;

  const maxPoints = totalRounds * POINTS.first;

  const randomFact = currentCountry?.fact ?? undefined;

  return (
    <div className="app">
      <GameHeader
        currentIdx={currentIdx}
        totalRounds={totalRounds}
        points={points}
        isOver={isOver}
        onFinish={handleFinish}
        streak={streak}
        mode={config.mode}
      />

      <main className="app__main">
        {!isOver ? (
          <>
            <TaskPanel
              country={currentCountry}
              wrongAttempts={wrongAttempts}
              onSkip={handleSkip}
              mode={config.mode}
              hintUsed={hintUsed}
              onHint={handleHintWithGlobe}
            />

            <div className="app__globe-area">
              <Globe ref={globeRef} onGuess={wrappedGuess} results={results} />
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
            onRestart={handleRestart}
            onSetup={handleSetup}
            streak={streak}
            fact={randomFact}
            topRecords={topRecords}
            mode={config.mode}
          />
        )}
      </main>

      {!isOver && <p className="app__hint">Тащи глобус · Колесо мыши или ± — масштаб</p>}
    </div>
  );
}
