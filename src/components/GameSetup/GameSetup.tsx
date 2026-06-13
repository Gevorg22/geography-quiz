import { useState } from "react";
import { motion } from "framer-motion";
import type { GameConfig } from "../../types/game";
import {
  DEFAULT_CONFIG,
  REGION_LABELS,
  DIFFICULTY_LABELS,
  MODE_LABELS,
  MODE_ICONS,
} from "../../types/game";
import type { GameRecord } from "../../hooks/useHistory";
import { formatTime } from "../../utils/time";
import { COUNTRIES } from "../../data/countries";
import "./GameSetup.css";

interface GameSetupProps {
  onStart: (config: GameConfig) => void;
  topRecords: GameRecord[];
  topWeakSpots: { id: string; name: string; misses: number }[];
  totalGames: number;
  onClearHistory: () => void;
}

const MODES = Object.keys(MODE_LABELS) as GameConfig["mode"][];
const REGIONS = Object.keys(REGION_LABELS) as (GameConfig["region"])[];
const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as (GameConfig["difficulty"])[];
const COUNTDOWN_OPTIONS = [60, 90, 120, 180, 300];

function countForConfig(config: GameConfig): number {
  return COUNTRIES.filter((c) => {
    if (config.region !== "all" && c.region !== config.region) return false;
    if (config.difficulty !== "all" && c.difficulty !== config.difficulty) return false;
    return true;
  }).length;
}

export default function GameSetup({
  onStart,
  topRecords,
  topWeakSpots,
  totalGames,
  onClearHistory,
}: GameSetupProps) {
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);

  const countryCount = countForConfig(config);

  return (
    <div className="setup">
      <motion.div
        className="setup__card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <div className="setup__logo">🌍 Geography Quiz</div>

        <section className="setup__section">
          <p className="setup__label">Режим игры</p>
          <div className="setup__chips">
            {MODES.map((m) => (
              <button
                key={m}
                className={`chip ${config.mode === m ? "chip--active" : ""}`}
                onClick={() => setConfig((c) => ({ ...c, mode: m }))}
              >
                {MODE_ICONS[m]} {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        </section>

        {config.mode === "countdown" && (
          <section className="setup__section">
            <p className="setup__label">Время</p>
            <div className="setup__chips">
              {COUNTDOWN_OPTIONS.map((s) => (
                <button
                  key={s}
                  className={`chip ${config.countdownSeconds === s ? "chip--active" : ""}`}
                  onClick={() => setConfig((c) => ({ ...c, countdownSeconds: s }))}
                >
                  {formatTime(s)}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="setup__section">
          <p className="setup__label">Регион</p>
          <div className="setup__chips">
            {REGIONS.map((r) => (
              <button
                key={r}
                className={`chip ${config.region === r ? "chip--active" : ""}`}
                onClick={() => setConfig((c) => ({ ...c, region: r }))}
              >
                {REGION_LABELS[r]}
              </button>
            ))}
          </div>
        </section>

        <section className="setup__section">
          <p className="setup__label">Сложность</p>
          <div className="setup__chips">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                className={`chip ${config.difficulty === d ? "chip--active" : ""}`}
                onClick={() => setConfig((c) => ({ ...c, difficulty: d }))}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        </section>

        <p className="setup__count">
          {countryCount > 0 ? `${countryCount} стран` : "Нет стран для выбранных фильтров"}
        </p>

        {topWeakSpots.length > 0 && (
          <section className="setup__section setup__section--weak">
            <p className="setup__label">⚠️ Слабые места</p>
            <ul className="setup__weak-list">
              {topWeakSpots.map((w) => (
                <li key={w.id} className="setup__weak-item">
                  <span>{w.name}</span>
                  <span className="setup__weak-misses">{w.misses}×</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {topRecords.length > 0 && (
          <section className="setup__section">
            <p className="setup__label">🏆 Лучшие результаты</p>
            <ul className="setup__records">
              {topRecords.map((r, i) => (
                <li key={r.id} className="setup__record-row">
                  <span className="setup__record-rank">#{i + 1}</span>
                  <span className="setup__record-pts">{r.totalPoints} оч.</span>
                  <span className="setup__record-meta">
                    {MODE_LABELS[r.mode]} · {formatTime(r.elapsed)}
                  </span>
                </li>
              ))}
            </ul>
            {totalGames > 0 && (
              <button className="setup__clear-btn" onClick={onClearHistory}>
                Очистить историю
              </button>
            )}
          </section>
        )}

        <button
          className="setup__start-btn"
          disabled={countryCount === 0}
          onClick={() => onStart(config)}
        >
          Начать игру →
        </button>
      </motion.div>
    </div>
  );
}
