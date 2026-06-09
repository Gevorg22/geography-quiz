import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameHeader from "./GameHeader";

describe("GameHeader", () => {
  const defaults = {
    currentIdx: 0,
    totalRounds: 10,
    points: 0,
    elapsed: 0,
    isOver: false,
    onFinish: vi.fn(),
  };

  it("отображает логотип Geography Quiz", () => {
    render(<GameHeader {...defaults} />);
    expect(screen.getByText(/geography quiz/i)).toBeInTheDocument();
  });

  it("отображает прогресс-бар во время игры", () => {
    render(<GameHeader {...defaults} currentIdx={3} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("скрывает прогресс-бар после окончания игры", () => {
    render(<GameHeader {...defaults} isOver={true} />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("показывает номер текущего вопроса / всего вопросов", () => {
    render(<GameHeader {...defaults} currentIdx={4} totalRounds={20} />);
    expect(screen.getByText("5 / 20")).toBeInTheDocument();
  });

  it("прогресс-бар имеет корректные aria-атрибуты", () => {
    render(<GameHeader {...defaults} currentIdx={3} totalRounds={10} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuemax", "10");
  });

  it("отображает отформатированное время", () => {
    render(<GameHeader {...defaults} elapsed={65} />);
    expect(screen.getByText(/01:05/)).toBeInTheDocument();
  });

  it("отображает накопленные очки", () => {
    render(<GameHeader {...defaults} points={7} />);
    expect(screen.getByText(/7/)).toBeInTheDocument();
  });

  it("показывает кнопку «Завершить» во время игры", () => {
    render(<GameHeader {...defaults} />);
    expect(screen.getByRole("button", { name: /завершить/i })).toBeInTheDocument();
  });

  it("скрывает кнопку «Завершить» после окончания игры", () => {
    render(<GameHeader {...defaults} isOver={true} />);
    expect(screen.queryByRole("button", { name: /завершить/i })).not.toBeInTheDocument();
  });

  it("вызывает onFinish при нажатии кнопки «Завершить»", async () => {
    const onFinish = vi.fn();
    render(<GameHeader {...defaults} onFinish={onFinish} />);
    await userEvent.click(screen.getByRole("button", { name: /завершить/i }));
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("показывает 00:00 при elapsed = 0", () => {
    render(<GameHeader {...defaults} elapsed={0} />);
    expect(screen.getByText(/00:00/)).toBeInTheDocument();
  });
});
