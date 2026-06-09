import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import TaskPanel from "./TaskPanel";
import { MAX_ATTEMPTS } from "../../constants/game";

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

const country = { id: "250", name: "Франция", en: "France" };

describe("TaskPanel", () => {
  it("отображает название страны на русском", () => {
    render(<TaskPanel country={country} wrongAttempts={0} onSkip={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Франция" })).toBeInTheDocument();
  });

  it("отображает английское название страны", () => {
    render(<TaskPanel country={country} wrongAttempts={0} onSkip={vi.fn()} />);
    expect(screen.getByText("France")).toBeInTheDocument();
  });

  it("отображает подпись «Найдите на карте»", () => {
    render(<TaskPanel country={country} wrongAttempts={0} onSkip={vi.fn()} />);
    expect(screen.getByText(/найдите на карте/i)).toBeInTheDocument();
  });

  it(`отображает ровно ${MAX_ATTEMPTS} точки попыток`, () => {
    render(<TaskPanel country={country} wrongAttempts={0} onSkip={vi.fn()} />);
    const dots = document.querySelectorAll(".attempt-dot");
    expect(dots).toHaveLength(MAX_ATTEMPTS);
  });

  it("помечает использованные точки классом attempt-dot--used", () => {
    render(<TaskPanel country={country} wrongAttempts={2} onSkip={vi.fn()} />);
    const used = document.querySelectorAll(".attempt-dot--used");
    const available = document.querySelectorAll(".attempt-dot--available");
    expect(used).toHaveLength(2);
    expect(available).toHaveLength(MAX_ATTEMPTS - 2);
  });

  it("aria-label точек отражает текущую попытку", () => {
    render(<TaskPanel country={country} wrongAttempts={1} onSkip={vi.fn()} />);
    expect(screen.getByLabelText(`Попытка 2 из ${MAX_ATTEMPTS}`)).toBeInTheDocument();
  });

  it("вызывает onSkip при нажатии кнопки пропуска", async () => {
    const onSkip = vi.fn();
    render(<TaskPanel country={country} wrongAttempts={0} onSkip={onSkip} />);
    await userEvent.click(screen.getByRole("button", { name: /пропустить/i }));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it("не падает когда country = undefined", () => {
    render(<TaskPanel country={undefined} wrongAttempts={0} onSkip={vi.fn()} />);
    expect(screen.getByText(/найдите на карте/i)).toBeInTheDocument();
  });
});
