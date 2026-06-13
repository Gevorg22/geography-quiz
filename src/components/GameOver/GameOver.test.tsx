import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import GameOver from "./GameOver";
import { POINTS } from "../../constants/game";

vi.mock("framer-motion", () => {
  const create = (tag: string) =>
    React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref: React.Ref<HTMLElement>) =>
      React.createElement(tag, { ref, ...props }, children),
    );
  return {
    motion: new Proxy({}, { get: (_t, tag: string) => create(tag) }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

const baseStats = { firstCount: 0, secondCount: 0, thirdCount: 0, failedCount: 0 };

describe("GameOver", () => {
  it("отображает заголовок «Игра завершена!»", () => {
    render(<GameOver stats={baseStats} totalPoints={0} maxPoints={30} elapsed={0} onRestart={vi.fn()} />);
    expect(screen.getByText("Игра завершена!")).toBeInTheDocument();
  });

  it("отображает отформатированное время", () => {
    render(<GameOver stats={baseStats} totalPoints={0} maxPoints={30} elapsed={125} onRestart={vi.fn()} />);
    expect(screen.getByText(/02:05/)).toBeInTheDocument();
  });

  it("отображает количество стран угаданных с первой попытки", () => {
    const stats = { ...baseStats, firstCount: 5 };
    render(<GameOver stats={stats} totalPoints={15} maxPoints={30} elapsed={0} onRestart={vi.fn()} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText(/с первой попытки/i)).toBeInTheDocument();
  });

  it("отображает количество не угаданных стран", () => {
    const stats = { ...baseStats, failedCount: 3 };
    render(<GameOver stats={stats} totalPoints={0} maxPoints={30} elapsed={0} onRestart={vi.fn()} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/не угадано/i)).toBeInTheDocument();
  });

  it("скрывает строку «С третьей попытки» когда thirdCount = 0", () => {
    render(<GameOver stats={baseStats} totalPoints={0} maxPoints={30} elapsed={0} onRestart={vi.fn()} />);
    expect(screen.queryByText(/с третьей попытки/i)).not.toBeInTheDocument();
  });

  it("показывает строку «С третьей попытки» когда thirdCount > 0", () => {
    const stats = { ...baseStats, thirdCount: 2 };
    render(<GameOver stats={stats} totalPoints={0} maxPoints={30} elapsed={0} onRestart={vi.fn()} />);
    expect(screen.getByText(/с третьей попытки/i)).toBeInTheDocument();
  });

  it("отображает итоговый счёт и максимум", () => {
    render(<GameOver stats={baseStats} totalPoints={12} maxPoints={30} elapsed={0} onRestart={vi.fn()} />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText(/\/\s*30 очков/i)).toBeInTheDocument();
  });

  it("показывает рейтинг 🏆 при доле ≥ 90%", () => {
    render(<GameOver stats={baseStats} totalPoints={27} maxPoints={30} elapsed={0} onRestart={vi.fn()} />);
    expect(screen.getByText(/идеально/i)).toBeInTheDocument();
  });

  it("показывает рейтинг 🥇 при доле от 70% до 89%", () => {
    render(<GameOver stats={baseStats} totalPoints={21} maxPoints={30} elapsed={0} onRestart={vi.fn()} />);
    expect(screen.getByText(/отлично/i)).toBeInTheDocument();
  });

  it("показывает рейтинг 📚 при доле < 50%", () => {
    render(<GameOver stats={baseStats} totalPoints={0} maxPoints={30} elapsed={0} onRestart={vi.fn()} />);
    expect(screen.getByText(/потренироваться/i)).toBeInTheDocument();
  });

  it("отображает очки за первую попытку корректно", () => {
    const stats = { ...baseStats, firstCount: 3 };
    const expected = `+${3 * POINTS.first} очк.`;
    render(<GameOver stats={stats} totalPoints={9} maxPoints={30} elapsed={0} onRestart={vi.fn()} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("вызывает onRestart при нажатии кнопки", async () => {
    const onRestart = vi.fn();
    render(<GameOver stats={baseStats} totalPoints={0} maxPoints={30} elapsed={0} onRestart={onRestart} />);
    await userEvent.click(screen.getByRole("button", { name: /ещё раз/i }));
    expect(onRestart).toHaveBeenCalledOnce();
  });
});
