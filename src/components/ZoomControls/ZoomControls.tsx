import "./ZoomControls.css";

interface ZoomControlsProps {
  /** Приблизить глобус на один шаг (делегируется в ref-API Globe). */
  onZoomIn: () => void;
  /** Отдалить глобус на один шаг (делегируется в ref-API Globe). */
  onZoomOut: () => void;
}

/**
 * Пара кнопок +/− для управления масштабом глобуса.
 * Не содержит внутреннего состояния — делегирует в ref-API Globe.
 */
export default function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="zoom-controls" aria-label="Управление масштабом">
      <button className="zoom-btn" onClick={onZoomIn} aria-label="Приблизить" title="Приблизить">
        +
      </button>
      <button className="zoom-btn" onClick={onZoomOut} aria-label="Отдалить" title="Отдалить">
        −
      </button>
    </div>
  );
}
