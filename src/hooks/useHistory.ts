import { useState, useCallback } from "react";
import type { GameConfig } from "../types/game";
import type { GameStats } from "./useGame";

const STORAGE_KEY = "geoQuiz_history_v1";
const WEAK_SPOTS_KEY = "geoQuiz_weakSpots_v1";
const MAX_RECORDS = 50;

export interface GameRecord {
  id: string;
  date: number;
  mode: GameConfig["mode"];
  region: GameConfig["region"];
  difficulty: GameConfig["difficulty"];
  totalPoints: number;
  maxPoints: number;
  elapsed: number;
  stats: GameStats;
  streak: number;
}

export interface WeakSpots {
  [countryId: string]: { name: string; misses: number };
}

function loadRecords(): GameRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GameRecord[]) : [];
  } catch {
    return [];
  }
}

function loadWeakSpots(): WeakSpots {
  try {
    const raw = localStorage.getItem(WEAK_SPOTS_KEY);
    return raw ? (JSON.parse(raw) as WeakSpots) : {};
  } catch {
    return {};
  }
}

export function useHistory() {
  const [records, setRecords] = useState<GameRecord[]>(loadRecords);
  const [weakSpots, setWeakSpots] = useState<WeakSpots>(loadWeakSpots);

  const saveRecord = useCallback(
    (
      record: Omit<GameRecord, "id" | "date">,
      failedCountries: { id: string; name: string }[],
    ) => {
      const newRecord: GameRecord = {
        ...record,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        date: Date.now(),
      };

      setRecords((prev) => {
        const next = [newRecord, ...prev].slice(0, MAX_RECORDS);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore storage errors */
        }
        return next;
      });

      if (failedCountries.length > 0) {
        setWeakSpots((prev) => {
          const next = { ...prev };
          for (const { id, name } of failedCountries) {
            next[id] = { name, misses: (next[id]?.misses ?? 0) + 1 };
          }
          try {
            localStorage.setItem(WEAK_SPOTS_KEY, JSON.stringify(next));
          } catch {
            /* ignore */
          }
          return next;
        });
      }
    },
    [],
  );

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WEAK_SPOTS_KEY);
    setRecords([]);
    setWeakSpots({});
  }, []);

  const topRecords = [...records]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  const topWeakSpots = Object.entries(weakSpots)
    .sort((a, b) => b[1].misses - a[1].misses)
    .slice(0, 5)
    .map(([id, { name, misses }]) => ({ id, name, misses }));

  const totalGames = records.length;
  const bestScore = topRecords[0]?.totalPoints ?? 0;

  return { records, topRecords, topWeakSpots, weakSpots, totalGames, bestScore, saveRecord, clearHistory };
}
