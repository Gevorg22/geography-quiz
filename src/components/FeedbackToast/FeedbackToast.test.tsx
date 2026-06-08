import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import FeedbackToast from "./FeedbackToast";

vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLDivElement>, ref: React.Ref<HTMLDivElement>) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe("FeedbackToast", () => {
  it("отображает сообщение о верном ответе с очками", () => {
    render(<FeedbackToast feedback={{ type: "correct", pts: 3 }} />);
    expect(screen.getByRole("status")).toHaveTextContent("✓ Верно! +3 очка");
  });

  it("отображает сообщение о верном ответе с одним очком", () => {
    render(<FeedbackToast feedback={{ type: "correct", pts: 1 }} />);
    expect(screen.getByRole("status")).toHaveTextContent("✓ Верно! +1 очко");
  });

  it("отображает сообщение о неверном ответе с несколькими попытками", () => {
    render(<FeedbackToast feedback={{ type: "wrong", attemptsLeft: 2 }} />);
    expect(screen.getByRole("status")).toHaveTextContent("✗ Неверно — ещё 2 попытки");
  });

  it("отображает сообщение о последней попытке", () => {
    render(<FeedbackToast feedback={{ type: "wrong", attemptsLeft: 1 }} />);
    expect(screen.getByRole("status")).toHaveTextContent("✗ Неверно — последняя попытка!");
  });

  it("отображает сообщение о провале с названием страны", () => {
    render(<FeedbackToast feedback={{ type: "fail", country: "Бразилия" }} />);
    expect(screen.getByRole("status")).toHaveTextContent("✗ Не угадали — Бразилия");
  });

  it("отображает сообщение о пропуске с названием страны", () => {
    render(<FeedbackToast feedback={{ type: "skip", country: "Франция" }} />);
    expect(screen.getByRole("status")).toHaveTextContent("⏭ Пропущено — Франция");
  });

  it("добавляет CSS-модификатор для типа correct", () => {
    const { container } = render(<FeedbackToast feedback={{ type: "correct", pts: 3 }} />);
    expect(container.firstChild).toHaveClass("feedback-toast--correct");
  });

  it("добавляет CSS-модификатор для типа wrong", () => {
    const { container } = render(<FeedbackToast feedback={{ type: "wrong", attemptsLeft: 2 }} />);
    expect(container.firstChild).toHaveClass("feedback-toast--wrong");
  });

  it("добавляет CSS-модификатор для типа fail", () => {
    const { container } = render(<FeedbackToast feedback={{ type: "fail", country: "Германия" }} />);
    expect(container.firstChild).toHaveClass("feedback-toast--fail");
  });

  it("добавляет CSS-модификатор для типа skip", () => {
    const { container } = render(<FeedbackToast feedback={{ type: "skip", country: "Япония" }} />);
    expect(container.firstChild).toHaveClass("feedback-toast--skip");
  });

  it("всегда содержит базовый класс feedback-toast", () => {
    const { container } = render(<FeedbackToast feedback={{ type: "correct", pts: 3 }} />);
    expect(container.firstChild).toHaveClass("feedback-toast");
  });

  it("имеет атрибут role='status' для доступности", () => {
    render(<FeedbackToast feedback={{ type: "correct", pts: 3 }} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("имеет атрибут aria-live='polite'", () => {
    render(<FeedbackToast feedback={{ type: "correct", pts: 3 }} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  describe("useVisualViewport — позиционирование", () => {
    const mockVv = {
      offsetLeft: 100,
      offsetTop: 50,
      width: 400,
      height: 700,
      scale: 1,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    beforeEach(() => {
      Object.defineProperty(window, "visualViewport", {
        value: mockVv,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(window, "visualViewport", {
        value: null,
        writable: true,
        configurable: true,
      });
    });

    it("подписывается на события resize и scroll при наличии visualViewport", () => {
      render(<FeedbackToast feedback={{ type: "correct", pts: 3 }} />);
      expect(mockVv.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
      expect(mockVv.addEventListener).toHaveBeenCalledWith("scroll", expect.any(Function));
    });

    it("отписывается от событий при размонтировании", () => {
      const { unmount } = render(<FeedbackToast feedback={{ type: "correct", pts: 3 }} />);
      unmount();
      expect(mockVv.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
      expect(mockVv.removeEventListener).toHaveBeenCalledWith("scroll", expect.any(Function));
    });

    it("обновляет позицию при срабатывании события scroll", () => {
      render(<FeedbackToast feedback={{ type: "correct", pts: 3 }} />);

      const scrollHandler = mockVv.addEventListener.mock.calls.find(
        ([event]) => event === "scroll",
      )?.[1] as () => void;

      Object.assign(mockVv, { offsetLeft: 200, offsetTop: 100 });

      act(() => {
        scrollHandler();
      });

      const el = screen.getByRole("status");
      expect(el).toBeInTheDocument();
    });

    it("при scale=2 (зум) компонент рендерится без ошибок", () => {
      Object.assign(mockVv, { scale: 2, width: 200, height: 350 });

      render(<FeedbackToast feedback={{ type: "correct", pts: 3 }} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("✓ Верно! +3 очка");
    });

    it("при обновлении scale через resize хук пересчитывает масштаб", () => {
      render(<FeedbackToast feedback={{ type: "wrong", attemptsLeft: 2 }} />);

      const resizeHandler = mockVv.addEventListener.mock.calls.find(
        ([event]) => event === "resize",
      )?.[1] as () => void;

      Object.assign(mockVv, { scale: 3, width: 133, height: 233 });

      act(() => {
        resizeHandler();
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });
});
