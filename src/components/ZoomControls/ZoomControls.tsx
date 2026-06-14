import { motion } from "framer-motion";
import { useVisualViewport } from "../../hooks/useVisualViewport";
import "./ZoomControls.css";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  const { offsetLeft, offsetTop, width, height, scale } = useVisualViewport();
  const inv = 1 / scale;

  const isMobile = width < 600;
  const marginRight = isMobile ? 8 : 14;
  const marginBottom = isMobile ? 12 : 14;

  const layoutW = window.innerWidth;
  const layoutH = window.innerHeight;
  const vRight = offsetLeft + width;
  const vBottom = offsetTop + height;

  return (
    <motion.div
      className="zoom-controls"
      aria-label="Управление масштабом"
      style={{
        right: layoutW - vRight + marginRight,
        bottom: layoutH - vBottom + marginBottom,
        scale: inv,
        transformOrigin: "bottom right",
      }}
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
    </motion.div>
  );
}
