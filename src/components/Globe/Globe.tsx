import { useEffect, useRef, useState, useCallback, useImperativeHandle } from "react";
import type { Ref } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { motion } from "framer-motion";
import { GLOBE_COLORS, ZOOM } from "../../constants/game";
import type { ResultValue } from "../../constants/game";
import "./Globe.css";

/** Тип TopoJSON-файла с картой мира (подмножество, используемое в приложении). */
type WorldTopology = Topology<{ countries: GeometryCollection }>;

/** Внешний API глобуса, доступный через ref из родительского компонента. */
export interface GlobeHandle {
  /** Приближает глобус на один шаг. */
  zoomIn: () => void;
  /** Отдаляет глобус на один шаг. */
  zoomOut: () => void;
}

interface GlobeProps {
  /** Вызывается с нормализованным ISO-кодом страны при клике на неё. */
  onGuess: (id: string | null) => void;
  /** Карта результатов для окраски уже отвеченных стран. */
  results: Map<string, ResultValue>;
  /** Ref для управления масштабом снаружи. */
  ref?: Ref<GlobeHandle>;
}

interface Size {
  w: number;
  h: number;
}

/**
 * Нормализует feature.id из TopoJSON в десятичную строку без ведущих нулей.
 * TopoJSON хранит коды вида "004" для стран с id < 100, а наша база — "4".
 */
function normalizeId(id: string | number | null | undefined): string | null {
  return id != null ? String(parseInt(String(id), 10)) : null;
}

/**
 * Возвращает CSS-цвет заливки для страны в зависимости от её состояния в results.
 */
function getCountryFill(
  results: Map<string, ResultValue>,
  id: string | number | null | undefined,
): string {
  const result = results.get(normalizeId(id) ?? "");
  return (result ? GLOBE_COLORS[result] : null) ?? GLOBE_COLORS.land;
}

/**
 * Интерактивный 3D-глобус на D3 ортографической проекции.
 *
 * Возможности:
 * - Перетаскивание мышью и пальцем для вращения
 * - Масштабирование колесом мыши
 * - Императивный API zoomIn/zoomOut через ref
 * - Окраска стран по карте результатов
 * - Отличие клика от перетаскивания (пороговое значение 3px)
 * - Плавная анимация появления через Framer Motion
 */
function Globe({ onGuess, results, ref }: GlobeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const projRef = useRef<d3.GeoProjection | null>(null);
  const pathGenRef = useRef<d3.GeoPath | null>(null);
  const worldRef = useRef<WorldTopology | null>(null);
  const rotRef = useRef<[number, number, number]>([0, -20, 0]);
  const scaleRef = useRef<number | null>(null);
  const sizeRef = useRef<Size>({ w: 600, h: 600 });
  const isDragging = useRef(false);
  const resultsRef = useRef(results);
  const onGuessRef = useRef(onGuess);

  const [size, setSize] = useState<Size>({ w: 600, h: 600 });

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    onGuessRef.current = onGuess;
  }, [onGuess]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const s = Math.min(rect.width, rect.height, 700);
      setSize({ w: s, h: s });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    d3.select(svg)
      .selectAll<SVGPathElement, GeoJSON.Feature>(".country")
      .attr("fill", (d) => getCountryFill(resultsRef.current, d.id));
  }, [results]);

  const redraw = useCallback(() => {
    const pathGen = pathGenRef.current;
    const svg = svgRef.current;
    if (!pathGen || !svg) return;
    d3.select(svg)
      .selectAll("path")
      .attr("d", (d) => pathGen(d as GeoJSON.Feature));
  }, []);

  const applyZoom = useCallback((nextScale: number) => {
    const proj = projRef.current;
    const svg = svgRef.current;
    const pathGen = pathGenRef.current;
    if (!proj || !svg || !pathGen) return;

    const { w, h } = sizeRef.current;
    const base = Math.min(w, h) / 2 - 10;
    const clamped = Math.max(base * ZOOM.min, Math.min(base * ZOOM.max, nextScale));
    scaleRef.current = clamped;
    proj.scale(clamped);

    const sel = d3.select(svg);
    sel.select(".ocean-circle").attr("r", clamped + 2);
    sel.select(".atm-circle").attr("r", clamped + 2);
    sel.selectAll("path").attr("d", (d) => pathGen(d as GeoJSON.Feature));
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => applyZoom((projRef.current?.scale() ?? 300) * ZOOM.factor),
      zoomOut: () => applyZoom((projRef.current?.scale() ?? 300) / ZOOM.factor),
    }),
    [applyZoom],
  );

  const initGlobe = useCallback(() => {
    const world = worldRef.current;
    const svgEl = svgRef.current;
    if (!world || !svgEl) return;

    const { w, h } = size;
    const base = Math.min(w, h) / 2 - 10;
    if (!scaleRef.current) scaleRef.current = base;

    const proj = d3
      .geoOrthographic()
      .scale(scaleRef.current)
      .translate([w / 2, h / 2])
      .clipAngle(90)
      .rotate(rotRef.current);
    projRef.current = proj;

    const pathGen = d3.geoPath().projection(proj);
    pathGenRef.current = pathGen;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");

    const oceanGrad = defs
      .append("radialGradient")
      .attr("id", "ocean-grad")
      .attr("cx", "40%")
      .attr("cy", "35%");
    oceanGrad.append("stop").attr("offset", "0%").attr("stop-color", GLOBE_COLORS.ocean1);
    oceanGrad.append("stop").attr("offset", "100%").attr("stop-color", GLOBE_COLORS.ocean2);

    const glowFilter = defs.append("filter").attr("id", "globe-glow");
    glowFilter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    svg
      .append("circle")
      .attr("class", "ocean-circle")
      .attr("cx", w / 2)
      .attr("cy", h / 2)
      .attr("r", scaleRef.current + 2)
      .attr("fill", "url(#ocean-grad)")
      .attr("filter", "url(#globe-glow)");

    const countries = topojson.feature(world, world.objects.countries);

    svg
      .selectAll<SVGPathElement, GeoJSON.Feature>(".country")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", (d) => pathGen(d))
      .attr("fill", (d) => getCountryFill(resultsRef.current, d.id))
      .attr("stroke", GLOBE_COLORS.border)
      .attr("stroke-width", 0.4)
      .attr("cursor", "pointer")
      .on("mouseenter", function (this: SVGPathElement, _event: MouseEvent, d: GeoJSON.Feature) {
        if (!resultsRef.current.get(normalizeId(d.id) ?? "")) {
          d3.select(this).attr("fill", GLOBE_COLORS.hover);
        }
      })
      .on("mouseleave", function (this: SVGPathElement, _event: MouseEvent, d: GeoJSON.Feature) {
        d3.select(this).attr("fill", getCountryFill(resultsRef.current, d.id));
      })
      .on("click", function (this: SVGPathElement, _event: MouseEvent, d: GeoJSON.Feature) {
        if (!isDragging.current) onGuessRef.current(normalizeId(d.id));
      });

    svg
      .append("path")
      .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
      .attr("d", (d) => pathGen(d))
      .attr("fill", "none")
      .attr("stroke", GLOBE_COLORS.border)
      .attr("stroke-width", 0.3);

    const atmGrad = defs
      .append("radialGradient")
      .attr("id", "atm-grad")
      .attr("cx", "50%")
      .attr("cy", "50%");
    atmGrad.append("stop").attr("offset", "85%").attr("stop-color", "transparent");
    atmGrad
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#4fc3f7")
      .attr("stop-opacity", "0.15");

    svg
      .append("circle")
      .attr("class", "atm-circle")
      .attr("cx", w / 2)
      .attr("cy", h / 2)
      .attr("r", scaleRef.current + 2)
      .attr("fill", "url(#atm-grad)")
      .attr("pointer-events", "none");
  }, [size]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/world-110m.json`)
      .then((r) => r.json())
      .then((world: WorldTopology) => {
        worldRef.current = world;
        setSize((s) => ({ ...s }));
      });
  }, []);

  useEffect(() => {
    if (worldRef.current) initGlobe();
  }, [size, initGlobe]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    let startPos: [number, number];
    let startRot: [number, number, number];
    let moved: boolean;

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = false;
      moved = false;
      startPos = [e.clientX, e.clientY];
      startRot = [...rotRef.current];
      el.style.cursor = "grabbing";

      const onMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startPos[0];
        const dy = ev.clientY - startPos[1];
        if (!moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) moved = true;
        if (!moved) return;
        isDragging.current = true;
        rotRef.current = [startRot[0] + dx * 0.3, startRot[1] - dy * 0.3, 0];
        projRef.current?.rotate(rotRef.current);
        redraw();
      };

      const onMouseUp = () => {
        el.style.cursor = "grab";
        setTimeout(() => {
          isDragging.current = false;
        }, 10);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      moved = false;
      isDragging.current = false;
      startPos = [e.touches[0].clientX, e.touches[0].clientY];
      startRot = [...rotRef.current];

      const onTouchMove = (ev: TouchEvent) => {
        if (ev.touches.length !== 1) return;
        const dx = ev.touches[0].clientX - startPos[0];
        const dy = ev.touches[0].clientY - startPos[1];
        if (!moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) moved = true;
        if (!moved) return;
        isDragging.current = true;
        rotRef.current = [startRot[0] + dx * 0.3, startRot[1] - dy * 0.3, 0];
        projRef.current?.rotate(rotRef.current);
        redraw();
        ev.preventDefault();
      };

      const onTouchEnd = () => {
        setTimeout(() => {
          isDragging.current = false;
        }, 10);
        el.removeEventListener("touchmove", onTouchMove);
        el.removeEventListener("touchend", onTouchEnd);
      };

      el.addEventListener("touchmove", onTouchMove, { passive: false });
      el.addEventListener("touchend", onTouchEnd);
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("touchstart", onTouchStart);
    };
  }, [redraw]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const proj = projRef.current;
      if (!proj) return;
      applyZoom(proj.scale() - e.deltaY * proj.scale() * ZOOM.wheelSpeed);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [applyZoom]);

  return (
    <motion.div
      ref={containerRef}
      className="globe-container"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <svg
        ref={svgRef}
        width={size.w}
        height={size.h}
        style={{ cursor: "grab", display: "block" }}
      />
    </motion.div>
  );
}

export default Globe;
