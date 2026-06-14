export type Region = "eu" | "as" | "af" | "am" | "oc";
export type Difficulty = "easy" | "normal" | "hard";
export type GameMode = "classic" | "capitals";

export interface GameConfig {
  mode: GameMode;
  region: Region | "all";
  difficulty: Difficulty | "all";
}

export const DEFAULT_CONFIG: GameConfig = {
  mode: "classic",
  region: "all",
  difficulty: "all",
};

export const REGION_LABELS: Record<Region | "all", string> = {
  all: "Весь мир",
  eu: "Европа",
  as: "Азия",
  af: "Африка",
  am: "Америка",
  oc: "Океания",
};

export const DIFFICULTY_LABELS: Record<Difficulty | "all", string> = {
  all: "Любая",
  easy: "Лёгкий",
  normal: "Средний",
  hard: "Сложный",
};

export const MODE_LABELS: Record<GameMode, string> = {
  classic: "Классика",
  capitals: "Столицы",
};

export const MODE_ICONS: Record<GameMode, string> = {
  classic: "🌍",
  capitals: "🏛️",
};
