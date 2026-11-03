"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type PointerEvent,
  type KeyboardEvent,
} from "react";
import type { ActiveSection } from "./types";

type DesktopIconsProps = {
  onOpen: (section: ActiveSection) => void;
};

type IconPosition = { x: number; y: number };

type SelectionRect = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

// ── desktop constants ─────────────────────────────────────────────────────────
const ICON_W = 130;
const ICON_H = 130;
const SNAP   = 8;

const COL0 = 4;
const COL1 = 138;
const ROW0 = 4;
const ROW1 = 158;
const ROW2 = 312;
const ROW3 = 466;
const ROW4 = 620;

const initialPositions: Record<ActiveSection, IconPosition> = {
  terminal:     { x: COL0, y: ROW0 },
  about:        { x: COL1, y: ROW0 },
  projects:     { x: COL0, y: ROW1 },
  achievements: { x: COL1, y: ROW1 },
  music:        { x: COL0, y: ROW2 },
  contact:      { x: COL0, y: ROW3 },
  rating:       { x: COL0, y: ROW4 },
  flappy:       { x: COL1, y: ROW2 },
};

function getResponsivePositions(isCompact: boolean): Record<ActiveSection, IconPosition> {
  if (!isCompact) return initialPositions;
  return {
    terminal:     { x: COL0, y: ROW0 },
    about:        { x: COL1, y: ROW0 },
    projects:     { x: COL0, y: ROW1 },
    achievements: { x: COL1, y: ROW1 },
    music:        { x: COL0, y: ROW2 },
    contact:      { x: COL0, y: ROW3 },
    rating:       { x: COL1, y: ROW3 },
    flappy:       { x: COL1, y: ROW2 },
  };
}

function fitPositionsToDesktop(
  positions: Record<ActiveSection, IconPosition>,
  desktopHeight: number,
): Record<ActiveSection, IconPosition> {
  const maxTop = Math.max(0, desktopHeight - ICON_H - 8);
  const next = { ...positions };
  if (next.flappy.y > maxTop) {
    next.flappy = { x: COL1, y: Math.min(ROW2, maxTop) };
  }
  return next;
}

const ICON_DEFS: {
  section: ActiveSection;
  className: string;
  label: string;
  iconClass: string;
}[] = [
  { section: "terminal",     className: "terminal-icon",     label: "Terminal",     iconClass: "terminal-icon-image"    },
  { section: "about",        className: "",                  label: "About",        iconClass: "about-icon"             },
  { section: "projects",     className: "project-icon",      label: "Projects",     iconClass: "project-icon-image"     },
  { section: "achievements", className: "achievements-icon", label: "Achievements", iconClass: "achievement-icon-image" },
  { section: "flappy",       className: "flappy-icon",       label: "Flappy Bird",  iconClass: "flappy-icon-image"      },
  { section: "music",        className: "music-icon",        label: "Music",        iconClass: "music-icon-image"       },
  { section: "contact",      className: "contact-icon",      label: "Contact Me",   iconClass: "contact-icon-image"     },
  { section: "rating",       className: "rating-icon",       label: "Rating",       iconClass: "rating-icon-image"     },
];

// ── geometry helpers ──────────────────────────────────────────────────────────

function iconRect(pos: IconPosition) {
  return { left: pos.x, top: pos.y, right: pos.x + ICON_W, bottom: pos.y + ICON_H };
}

function rectsOverlap(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function rectFromSel(s: SelectionRect) {
  return {
    left:   Math.min(s.startX, s.currentX),
    top:    Math.min(s.startY, s.currentY),
    right:  Math.max(s.startX, s.currentX),
    bottom: Math.max(s.startY, s.currentY),
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function resolveOverlap(
  desired: IconPosition,
  section: ActiveSection,
  allPositions: Record<ActiveSection, IconPosition>,
  desktopW: number,
  desktopH: number,
): IconPosition {
  const others = (Object.keys(allPositions) as ActiveSection[]).filter(s => s !== section);
  const overlapsAny = (pos: IconPosition) =>
    others.some(s => rectsOverlap(iconRect(pos), iconRect(allPositions[s])));
  if (!overlapsAny(desired)) return desired;
  for (let radius = SNAP; radius < Math.max(desktopW, desktopH); radius += SNAP) {
    for (let dx = -radius; dx <= radius; dx += SNAP) {
      for (let dy = -radius; dy <= radius; dy += SNAP) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        const candidate: IconPosition = {
          x: clamp(desired.x + dx, 0, desktopW - ICON_W),
          y: clamp(desired.y + dy, 0, desktopH - ICON_H),
        };
        if (!overlapsAny(candidate)) return candidate;
      }
    }
  }
  return desired;
}

export function DesktopIcons({ onOpen }: DesktopIconsProps) {
  return <DesktopIconGrid onOpen={onOpen} />;
}

function DesktopIconGrid({ onOpen }: { onOpen: (s: ActiveSection) => void }) {
  const [positions, setPositions] = useState<Record<ActiveSection, IconPosition>>(initialPositions);
  const [selected,  setSelected]  = useState<Set<ActiveSection>>(new Set());
  const [selRect,   setSelRect]   = useState<SelectionRect | null>(null);

  const desktopRef  = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<Set<ActiveSection>>(selected);
  const positionsRef = useRef<Record<ActiveSection, IconPosition>>(positions);
  const hasCustomLayoutRef = useRef(false);

  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { positionsRef.current = positions; }, [positions]);

  useEffect(() => {
    const updateResponsivePositions = () => {
      if (hasCustomLayoutRef.current) return;
      const isCompact = window.innerWidth <= 900 || window.innerHeight <= 700;
      const desktop = desktopRef.current;
      const desktopHeight = desktop?.clientHeight || window.innerHeight - 38;
      const next = fitPositionsToDesktop(getResponsivePositions(isCompact), desktopHeight);
      positionsRef.current = next;
      setPositions(next);
    };
    updateResponsivePositions();
    window.addEventListener("resize", updateResponsivePositions);
    return () => window.removeEventListener("resize", updateResponsivePositions);
  }, []);

  const dragState = useRef<{
    startX: number;
    startY: number;
    isRotated: boolean;
    scale: number;
    deskW: number;
    deskH: number;
    items: { section: ActiveSection; originX: number; originY: number }[];
    moved: boolean;
  } | null>(null);

  const selState = useRef<{ startX: number; startY: number } | null>(null);

  const handleIconPointerDown = useCallback(
    (e: PointerEvent<HTMLButtonElement>, section: ActiveSection) => {
      e.stopPropagation();
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const desktop = desktopRef.current;
      if (!desktop) return;

      let nextSelected: Set<ActiveSection>;
      if (e.ctrlKey || e.metaKey) {
        nextSelected = new Set(selectedRef.current);
        nextSelected.has(section) ? nextSelected.delete(section) : nextSelected.add(section);
      } else if (selectedRef.current.has(section)) {
        nextSelected = selectedRef.current;
      } else {
        nextSelected = new Set([section]);
      }
      selectedRef.current = nextSelected;
      setSelected(new Set(nextSelected));

      const isRotated = typeof window !== "undefined" && window.matchMedia("(max-width: 700px) and (orientation: portrait)").matches;
      const isLandscapePhone = typeof window !== "undefined" && window.matchMedia("(max-width: 900px) and (max-height: 500px) and (orientation: landscape)").matches;
      const scale = isRotated ? 0.45 : (isLandscapePhone ? 0.55 : (window.innerWidth <= 700 ? 0.65 : 1));

      const deskW = isRotated ? window.innerHeight : (desktop.clientWidth || window.innerWidth) / scale;
      const deskH = isRotated ? (window.innerWidth - 32) : (desktop.clientHeight || (window.innerHeight - 38)) / scale;

      const snap = positionsRef.current;
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        isRotated,
        scale,
        deskW,
        deskH,
        items: [...nextSelected].map(sec => ({
          section: sec,
          originX: snap[sec].x,
          originY: snap[sec].y,
        })),
        moved: false,
      };
      (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
    }, [],
  );

  const handleIconPointerMove = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      const ds = dragState.current;
      if (!ds) return;

      const rawDx = e.clientX - ds.startX;
      const rawDy = e.clientY - ds.startY;

      // Tap vs Drag threshold
      if (!ds.moved && Math.hypot(rawDx, rawDy) < 6) return;
      ds.moved = true;
      hasCustomLayoutRef.current = true;

      // Coordinate transform for rotated portrait mobile mode
      let deltaX = rawDx;
      let deltaY = rawDy;
      if (ds.isRotated) {
        deltaX = rawDy;
        deltaY = -rawDx;
      }

      deltaX = deltaX / ds.scale;
      deltaY = deltaY / ds.scale;

      setPositions(prev => {
        const next = { ...prev };
        for (const { section, originX, originY } of ds.items) {
          next[section] = {
            x: clamp(Math.round(originX + deltaX), 0, ds.deskW - ICON_W),
            y: clamp(Math.round(originY + deltaY), 0, ds.deskH - ICON_H),
          };
        }
        return next;
      });
    }, [],
  );

  const handleIconPointerUp = useCallback(
    (e: PointerEvent<HTMLButtonElement>, section: ActiveSection) => {
      const ds = dragState.current;
      if (!ds) return;
      const wasMoved = ds.moved;
      dragState.current = null;

      if (!wasMoved) {
        // Tapped without dragging: On mobile / touch, open the window directly!
        const isMobileOrTouch = e.pointerType === "touch" || (typeof window !== "undefined" && (window.innerWidth <= 900 || window.innerHeight <= 500));
        if (isMobileOrTouch) {
          selectedRef.current = new Set([section]);
          setSelected(new Set([section]));
          onOpen(section);
          return;
        }

        if (!e.ctrlKey && !e.metaKey) {
          selectedRef.current = new Set([section]);
          setSelected(new Set([section]));
        }
        return;
      }

      // If dragged, resolve overlaps cleanly
      const desktop = desktopRef.current;
      if (!desktop) return;
      const { width: dw, height: dh } = desktop.getBoundingClientRect();
      const secs = ds.items.map(i => i.section);
      setPositions(prev => {
        let next = { ...prev };
        for (const sec of secs) {
          next = { ...next, [sec]: resolveOverlap(next[sec], sec, next, dw, dh) };
        }
        return next;
      });
    }, [onOpen],
  );

  const handleDesktopPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget || e.button !== 0) return;
      const desktop = desktopRef.current;
      if (!desktop) return;
      const bounds = desktop.getBoundingClientRect();
      const sx = e.clientX - bounds.left;
      const sy = e.clientY - bounds.top;
      if (!e.ctrlKey && !e.metaKey) { selectedRef.current = new Set(); setSelected(new Set()); }
      selState.current = { startX: sx, startY: sy };
      setSelRect({ startX: sx, startY: sy, currentX: sx, currentY: sy });
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    }, [],
  );

  const handleDesktopPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const ss = selState.current;
      if (!ss) return;
      const desktop = desktopRef.current;
      if (!desktop) return;
      const bounds = desktop.getBoundingClientRect();
      const cx = e.clientX - bounds.left;
      const cy = e.clientY - bounds.top;
      setSelRect({ startX: ss.startX, startY: ss.startY, currentX: cx, currentY: cy });
      const band = rectFromSel({ startX: ss.startX, startY: ss.startY, currentX: cx, currentY: cy });
      const snap = positionsRef.current;
      const hit = new Set(
        ICON_DEFS
          .filter(({ section }) => rectsOverlap(band, iconRect(snap[section])))
          .map(({ section }) => section),
      );
      selectedRef.current = hit;
      setSelected(new Set(hit));
    }, [],
  );

  const handleDesktopPointerUp = useCallback(() => {
    selState.current = null;
    setSelRect(null);
  }, []);

  const handleIconKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, section: ActiveSection) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(section); }
      if (e.key === "Escape") { selectedRef.current = new Set(); setSelected(new Set()); }
    }, [onOpen],
  );

  const selRectStyle = selRect
    ? (() => {
        const r = rectFromSel(selRect);
        return { left: r.left, top: r.top, width: r.right - r.left, height: r.bottom - r.top };
      })()
    : null;

  return (
    <div
      ref={desktopRef}
      className="desktop-icons"
      aria-label="Desktop shortcuts"
      onPointerDown={handleDesktopPointerDown}
      onPointerMove={handleDesktopPointerMove}
      onPointerUp={handleDesktopPointerUp}
      onPointerCancel={handleDesktopPointerUp}
    >
      {selRectStyle && <div className="selection-rect" style={selRectStyle} aria-hidden="true" />}
      {ICON_DEFS.map(({ section, className, label, iconClass }) => {
        const isSelected = selected.has(section);
        return (
          <button
            key={section}
            className={`desktop-icon ${className} ${isSelected ? "selected" : ""}`.trim()}
            type="button"
            data-section={section}
            aria-label={label}
            aria-pressed={isSelected}
            style={{ left: positions[section].x, top: positions[section].y }}
            onPointerDown={e => handleIconPointerDown(e, section)}
            onPointerMove={handleIconPointerMove}
            onPointerUp={e => handleIconPointerUp(e, section)}
            onPointerCancel={e => handleIconPointerUp(e, section)}
            onDoubleClick={() => onOpen(section)}
            onClick={() => {
              // Click fallback for touch devices
              if (typeof window !== "undefined" && (window.innerWidth <= 900 || window.innerHeight <= 500)) {
                onOpen(section);
              }
            }}
            onKeyDown={e => handleIconKeyDown(e, section)}
          >
            <span className={iconClass} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
