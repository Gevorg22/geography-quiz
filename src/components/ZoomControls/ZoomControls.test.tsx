import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZoomControls from "./ZoomControls";

describe("ZoomControls", () => {
  it("отображает кнопки приближения и отдаления", () => {
    render(<ZoomControls onZoomIn={vi.fn()} onZoomOut={vi.fn()} />);
    expect(screen.getByRole("button", { name: /приблизить/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /отдалить/i })).toBeInTheDocument();
  });

  it("вызывает onZoomIn при клике на +", async () => {
    const onZoomIn = vi.fn();
    render(<ZoomControls onZoomIn={onZoomIn} onZoomOut={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /приблизить/i }));
    expect(onZoomIn).toHaveBeenCalledOnce();
  });

  it("вызывает onZoomOut при клике на −", async () => {
    const onZoomOut = vi.fn();
    render(<ZoomControls onZoomIn={vi.fn()} onZoomOut={onZoomOut} />);
    await userEvent.click(screen.getByRole("button", { name: /отдалить/i }));
    expect(onZoomOut).toHaveBeenCalledOnce();
  });

  it("контейнер имеет aria-label для управления масштабом", () => {
    render(<ZoomControls onZoomIn={vi.fn()} onZoomOut={vi.fn()} />);
    expect(screen.getByLabelText(/управление масштабом/i)).toBeInTheDocument();
  });
});
