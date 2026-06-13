import { useState, useEffect } from "react";

export interface VisualViewportSnapshot {
  offsetLeft: number;
  offsetTop: number;
  width: number;
  height: number;
  scale: number;
}

function getSnapshot(): VisualViewportSnapshot {
  const vv = window.visualViewport;
  return {
    offsetLeft: vv?.offsetLeft ?? 0,
    offsetTop: vv?.offsetTop ?? 0,
    width: vv?.width ?? window.innerWidth,
    height: vv?.height ?? window.innerHeight,
    scale: vv?.scale ?? 1,
  };
}

export function useVisualViewport(): VisualViewportSnapshot {
  const [vp, setVp] = useState<VisualViewportSnapshot>(getSnapshot);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () =>
      setVp({
        offsetLeft: vv.offsetLeft,
        offsetTop: vv.offsetTop,
        width: vv.width,
        height: vv.height,
        scale: vv.scale,
      });
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return vp;
}
