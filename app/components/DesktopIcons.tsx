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
  flappy:       { x: COL0, y: ROW4 },
};

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

// ── mobile dock ───────────────────────────────────────────────────────────────

function MobileDock({ onOpen }: { onOpen: (s: ActiveSection) => void }) {
  return (
    <nav className="mobile-dock" aria-label="App icons">
      {ICON_DEFS.map(({ section, className, label, iconClass }) => (
        <button
          key={section}
          className={`mobile-dock-icon ${className}`}
          type="button"
          aria-label={label}
          onDoubleClick={() => onOpen(section)}
          onClick={() => onOpen(section)}
        >
          <span className={iconClass} aria-hidden="true" />
          <span className="mobile-dock-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

export function DesktopIcons({ onOpen }: DesktopIconsProps) {
  // Always use the desktop-style icon grid — mobile scaling is handled via CSS
  return <DesktopIconGrid onOpen={onOpen} />;
}

// ── desktop icon grid (extracted so mobile path is clean) ─────────────────────

function DesktopIconGrid({ onOpen }: { onOpen: (s: ActiveSection) => void }) {
  const [positions, setPositions] = useState<Record<ActiveSection, IconPosition>>(initialPositions);
  const [selected,  setSelected]  = useState<Set<ActiveSection>>(new Set());
  const [selRect,   setSelRect]   = useState<SelectionRect | null>(null);

  const desktopRef  = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<Set<ActiveSection>>(selected);
  const positionsRef = useRef<Record<ActiveSection, IconPosition>>(positions);

  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { positionsRef.current = positions; }, [positions]);

  const dragState = useRef<{
    items: { section: ActiveSection; offsetX: number; offsetY: number }[];
    moved: boolean;
  } | null>(null);

  const selState = useRef<{ startX: number; startY: number } | null>(null);

  const handleIconPointerDown = useCallback(
    (e: PointerEvent<HTMLButtonElement>, section: ActiveSection) => {
      e.stopPropagation();
      if (e.button !== 0) return;
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

      const bounds = desktop.getBoundingClientRect();
      const snap = positionsRef.current;
      dragState.current = {
        items: [...nextSelected].map(sec => ({
          section: sec,
          offsetX: e.clientX - bounds.left - snap[sec].x,
          offsetY: e.clientY - bounds.top  - snap[sec].y,
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
      const desktop = desktopRef.current;
      if (!desktop) return;
      ds.moved = true;
      const bounds = desktop.getBoundingClientRect();
      setPositions(prev => {
        const next = { ...prev };
        for (const { section, offsetX, offsetY } of ds.items) {
          next[section] = {
            x: clamp(Math.round(e.clientX - bounds.left - offsetX), 0, bounds.width  - ICON_W),
            y: clamp(Math.round(e.clientY - bounds.top  - offsetY), 0, bounds.height - ICON_H),
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
      if (!wasMoved && !e.ctrlKey && !e.metaKey) {
        selectedRef.current = new Set([section]);
        setSelected(new Set([section]));
        return;
      }
      if (!wasMoved) return;
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
    }, [],
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
