import { useVisualViewport } from "../../hooks/useVisualViewport";
import "./ZoomControls.css";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  const { offsetLeft, offsetTop, width, height } = useVisualViewport();

  const isMobile = width < 600;
  const marginRight = isMobile ? 8 : 14;
  const marginBottom = isMobile ? 12 : 0;

  const left = offsetLeft + width - marginRight;
  const top = isMobile
    ? offsetTop + height - marginBottom
    : offsetTop + height / 2;

  const transform = isMobile
    ? "translate(-100%, -100%)"
    : "translate(-100%, -50%)";

  return (
    <div
      className="zoom-controls"
      aria-label="Управление масштабом"
      style={{ left, top, transform }}
    >
      <button
        className="zoom-btn"
        onClick={onZoomIn}
        aria-label="Приблизить"
        title="Приблизить"
      >
        +
      </button>
      <button
        className="zoom-btn"
        onClick={onZoomOut}
        aria-label="Отдалить"
        title="Отдалить"
      >
        −
      </button>
    </div>
  );
}
