import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { MiniGrid } from "../components/MiniGrid";
import { occupancyDeck } from "../core/board";
import { exactId, type Grid } from "../core/grid";
import { connectedIds, mergeOccupancies, snapDelta, splitOccupancy, type Rect } from "./snap";

interface DeckBarProps {
  onPlace: (grid: Grid, at?: { x: number; y: number }) => void;
}

interface Palette {
  id: string;
  occupancies: number[];
  active: number;
  x: number;
  y: number;
}

interface DragState {
  id: string;
  mode: "group" | "detach";
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  origins: Record<string, { x: number; y: number }>;
  moved: boolean;
}

const DECKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const CARD = 104;

function paletteId() {
  return `p-${Math.random().toString(36).slice(2, 9)}`;
}

function starterPalette(id = paletteId()): Palette {
  return {
    id,
    occupancies: [...DECKS],
    active: 0,
    x: 16,
    y: 72,
  };
}

export function DeckBar({ onPlace }: DeckBarProps) {
  const [palettes, setPalettes] = useState<Palette[]>(() => [starterPalette("starter")]);
  const [front, setFront] = useState<string | null>("starter");
  const [mergeHover, setMergeHover] = useState<{ source: string; target: string } | null>(null);
  const palettesRef = useRef(palettes);
  palettesRef.current = palettes;
  const frontRef = useRef(front);
  frontRef.current = front;
  const nodes = useRef(new Map<string, HTMLElement>());
  const headers = useRef(new Map<string, HTMLElement>());
  const drag = useRef<DragState | null>(null);
  const skipPlace = useRef(false);
  const stopWindowDrag = useRef<(() => void) | null>(null);
  const cardDrag = useRef<{ grid: Grid; startX: number; startY: number; moved: boolean } | null>(null);
  const [ghost, setGhost] = useState<{ grid: Grid; x: number; y: number } | null>(null);

  function sizeOf(id: string) {
    const node = nodes.current.get(id);
    return { w: node?.offsetWidth ?? 260, h: node?.offsetHeight ?? 200 };
  }

  function rectOf(item: Palette): Rect {
    return { x: item.x, y: item.y, ...sizeOf(item.id) };
  }

  function headerAt(clientX: number, clientY: number, excludeId: string) {
    const ids = palettesRef.current.map((item) => item.id).filter((id) => id !== excludeId);
    const top = frontRef.current;
    const ordered = top && ids.includes(top) ? [top, ...ids.filter((id) => id !== top)] : ids;
    for (const id of ordered) {
      const node = headers.current.get(id);
      if (!node) {
        continue;
      }
      const rect = node.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        return id;
      }
    }
    return null;
  }

  function setHover(source: string, target: string | null) {
    setMergeHover((current) => {
      if (!target) {
        return current ? null : current;
      }
      if (current?.source === source && current.target === target) {
        return current;
      }
      return { source, target };
    });
  }

  function popTab(sourceId: string, occupancy: number) {
    const source = palettesRef.current.find((item) => item.id === sourceId);
    if (!source) {
      return;
    }
    const split = splitOccupancy(source.occupancies, source.active, occupancy);
    if (!split) {
      return;
    }
    const id = paletteId();
    skipPlace.current = true;
    setFront(id);
    setPalettes((current) => [
      ...current.map((item) => (item.id === sourceId ? { ...item, ...split.host } : item)),
      {
        id,
        occupancies: [split.popped],
        active: split.popped,
        x: source.x + 28,
        y: source.y + 36,
      },
    ]);
  }

  function closePalette(id: string) {
    const remaining = palettesRef.current.filter((item) => item.id !== id);
    if (remaining.length > 0) {
      setPalettes(remaining);
      if (frontRef.current === id) {
        setFront(remaining[remaining.length - 1].id);
      }
      return;
    }
    const fresh = starterPalette();
    setFront(fresh.id);
    setPalettes([fresh]);
  }

  function startDrag(id: string, mode: "group" | "detach", clientX: number, clientY: number) {
    const list = palettesRef.current;
    const members =
      mode === "group"
        ? connectedIds(
            id,
            list.map((item) => ({ id: item.id, ...rectOf(item) })),
          )
        : [id];
    const origins: Record<string, { x: number; y: number }> = {};
    for (const member of members) {
      const item = list.find((palette) => palette.id === member);
      if (item) {
        origins[member] = { x: item.x, y: item.y };
      }
    }
    drag.current = {
      id,
      mode,
      startX: clientX,
      startY: clientY,
      lastX: clientX,
      lastY: clientY,
      origins,
      moved: false,
    };
    const onUp = () => {
      const current = drag.current;
      if (current) {
        endDrag(current.id);
      }
    };
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    stopWindowDrag.current = () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      stopWindowDrag.current = null;
    };
  }

  function moveDrag(id: string, event: ReactPointerEvent) {
    const state = drag.current;
    if (!state || state.id !== id) {
      return;
    }
    if (event.buttons === 0) {
      endDrag(id);
      return;
    }
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    if (Math.hypot(dx, dy) > 4) {
      state.moved = true;
    }
    const target = state.mode === "detach" ? headerAt(event.clientX, event.clientY, state.id) : null;
    setHover(state.id, target);
    setPalettes((current) => {
      const shifted = current.map((item) => {
        const origin = state.origins[item.id];
        return origin ? { ...item, x: origin.x + dx, y: origin.y + dy } : item;
      });
      if (target) {
        return shifted;
      }
      const moving = shifted.filter((item) => state.origins[item.id] !== undefined).map(rectOf);
      const others = shifted.filter((item) => state.origins[item.id] === undefined).map(rectOf);
      const snap = snapDelta(moving, others);
      return shifted.map((item) =>
        state.origins[item.id] !== undefined ? { ...item, x: item.x + snap.dx, y: item.y + snap.dy } : item,
      );
    });
  }

  function endDrag(id: string) {
    const state = drag.current;
    if (!state || state.id !== id) {
      return;
    }
    if (state.moved) {
      skipPlace.current = true;
    }
    const target = state.mode === "detach" && state.moved ? headerAt(state.lastX, state.lastY, state.id) : null;
    stopWindowDrag.current?.();
    drag.current = null;
    setMergeHover(null);
    if (!target) {
      return;
    }
    const source = palettesRef.current.find((item) => item.id === state.id);
    const host = palettesRef.current.find((item) => item.id === target);
    if (!source || !host) {
      return;
    }
    setFront(host.id);
    setPalettes((current) => {
      const from = current.find((item) => item.id === source.id);
      const into = current.find((item) => item.id === host.id);
      if (!from || !into) {
        return current;
      }
      return current
        .filter((item) => item.id !== from.id)
        .map((item) =>
          item.id === into.id
            ? { ...item, occupancies: mergeOccupancies(into.occupancies, from.occupancies), active: from.active }
            : item,
        );
    });
  }

  function thumbDown() {
    if (!drag.current) {
      skipPlace.current = false;
    }
  }

  function moveCard(clientX: number, clientY: number) {
    const state = cardDrag.current;
    if (!state) {
      return;
    }
    if (!state.moved && Math.hypot(clientX - state.startX, clientY - state.startY) < 6) {
      return;
    }
    state.moved = true;
    skipPlace.current = true;
    setGhost({ grid: state.grid, x: clientX, y: clientY });
  }

  function endCard(clientX: number, clientY: number) {
    const state = cardDrag.current;
    cardDrag.current = null;
    setGhost(null);
    if (!state?.moved) {
      return;
    }
    const hit = document.elementFromPoint(clientX, clientY);
    if (!(hit instanceof Element) || hit.closest(".deck-palette") || !hit.closest(".table-surface")) {
      return;
    }
    onPlace(state.grid, { x: clientX, y: clientY });
  }

  function place(grid: Grid) {
    if (skipPlace.current) {
      skipPlace.current = false;
      return;
    }
    onPlace(grid);
  }

  return (
    <>
      {palettes.map((palette) => (
        <DeckPalette
          key={palette.id}
          id={palette.id}
          occupancies={palette.occupancies}
          active={palette.active}
          x={palette.x}
          y={palette.y}
          front={front === palette.id}
          mergeHot={mergeHover?.source === palette.id || mergeHover?.target === palette.id}
          onFront={() => setFront(palette.id)}
          onClose={() => closePalette(palette.id)}
          onSelect={(occupancy) =>
            setPalettes((current) =>
              current.map((item) => (item.id === palette.id ? { ...item, active: occupancy } : item)),
            )
          }
          onPopTab={(occupancy) => popTab(palette.id, occupancy)}
          onStartDrag={startDrag}
          onMoveDrag={moveDrag}
          onEndDrag={endDrag}
          onPlace={place}
          onThumbDown={thumbDown}
          onCardDragStart={(grid, clientX, clientY) => {
            cardDrag.current = { grid, startX: clientX, startY: clientY, moved: false };
          }}
          onCardDragMove={moveCard}
          onCardDragEnd={endCard}
          onNode={(node) => {
            if (node) {
              nodes.current.set(palette.id, node);
              const header = node.querySelector(".deck-palette-bar");
              if (header instanceof HTMLElement) {
                headers.current.set(palette.id, header);
              }
            } else {
              nodes.current.delete(palette.id);
              headers.current.delete(palette.id);
            }
          }}
        />
      ))}
      {ghost && (
        <div className="deck-ghost" style={{ left: ghost.x - CARD / 2, top: ghost.y - CARD / 2 }}>
          <MiniGrid grid={ghost.grid} />
        </div>
      )}
    </>
  );
}

function DeckPalette({
  id,
  occupancies,
  active,
  x,
  y,
  front,
  mergeHot,
  onFront,
  onClose,
  onSelect,
  onPopTab,
  onStartDrag,
  onMoveDrag,
  onEndDrag,
  onPlace,
  onThumbDown,
  onCardDragStart,
  onCardDragMove,
  onCardDragEnd,
  onNode,
}: {
  id: string;
  occupancies: number[];
  active: number;
  x: number;
  y: number;
  front: boolean;
  mergeHot: boolean;
  onFront: () => void;
  onClose: () => void;
  onSelect: (occupancy: number) => void;
  onPopTab: (occupancy: number) => void;
  onStartDrag: (id: string, mode: "group" | "detach", clientX: number, clientY: number) => void;
  onMoveDrag: (id: string, event: ReactPointerEvent) => void;
  onEndDrag: (id: string) => void;
  onPlace: (grid: Grid) => void;
  onThumbDown: () => void;
  onCardDragStart: (grid: Grid, clientX: number, clientY: number) => void;
  onCardDragMove: (clientX: number, clientY: number) => void;
  onCardDragEnd: (clientX: number, clientY: number) => void;
  onNode: (node: HTMLElement | null) => void;
}) {
  const cards = useMemo(() => occupancyDeck(active), [active]);
  const [collapsed, setCollapsed] = useState(false);
  const pending = useRef<{
    startX: number;
    startY: number;
    pointerId: number;
    target: HTMLElement;
    scrollable: boolean;
  } | null>(null);
  const headerPending = useRef<{
    startX: number;
    startY: number;
    pointerId: number;
    target: HTMLElement;
  } | null>(null);
  const hold = useRef<number | null>(null);

  function clearHold() {
    if (hold.current !== null) {
      window.clearTimeout(hold.current);
      hold.current = null;
    }
  }

  function selectTab(occupancy: number) {
    setCollapsed(false);
    onSelect(occupancy);
  }

  function finish(event: ReactPointerEvent) {
    pending.current = null;
    headerPending.current = null;
    clearHold();
    onEndDrag(id);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <section
      ref={onNode}
      className={["deck-palette", front ? "front" : "", collapsed ? "collapsed" : "", mergeHot ? "merge-hot" : ""]
        .filter(Boolean)
        .join(" ")}
      style={{ left: x, top: y }}
      aria-label={`Occupancy ${occupancies.join(", ")} palette`}
      onPointerDown={(event) => {
        event.stopPropagation();
        onFront();
        if ((event.target as HTMLElement).closest(".deck-palette-bar, .deck-thumb")) {
          return;
        }
        const body = (event.target as HTMLElement).closest(".deck-palette-body") as HTMLElement | null;
        pending.current = {
          startX: event.clientX,
          startY: event.clientY,
          pointerId: event.pointerId,
          target: event.currentTarget,
          scrollable: !!body && body.scrollHeight > body.clientHeight + 1,
        };
      }}
      onPointerMove={(event) => {
        if (event.buttons === 0) {
          pending.current = null;
          onEndDrag(id);
          return;
        }
        onMoveDrag(id, event);
        const start = pending.current;
        if (!start) {
          return;
        }
        const dx = event.clientX - start.startX;
        const dy = event.clientY - start.startY;
        if (Math.hypot(dx, dy) < 6) {
          return;
        }
        if (start.scrollable && Math.abs(dy) >= Math.abs(dx)) {
          pending.current = null;
          return;
        }
        pending.current = null;
        onStartDrag(id, "group", start.startX, start.startY);
        start.target.setPointerCapture(start.pointerId);
        onMoveDrag(id, event);
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
    >
      <header
        className="deck-palette-bar"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest(".deck-palette-tools")) {
            return;
          }
          event.stopPropagation();
          onFront();
          const tab = (event.target as HTMLElement).closest(".deck-palette-tab");
          if (tab instanceof HTMLElement && tab.dataset.occupancy !== undefined) {
            const occupancy = Number(tab.dataset.occupancy);
            selectTab(occupancy);
            if (occupancies.length > 1) {
              hold.current = window.setTimeout(() => {
                hold.current = null;
                headerPending.current = null;
                onPopTab(occupancy);
              }, 1500);
            }
          }
          headerPending.current = {
            startX: event.clientX,
            startY: event.clientY,
            pointerId: event.pointerId,
            target: event.currentTarget,
          };
        }}
        onPointerMove={(event) => {
          if (event.buttons === 0) {
            headerPending.current = null;
            onEndDrag(id);
            return;
          }
          onMoveDrag(id, event);
          const start = headerPending.current;
          if (!start) {
            return;
          }
          if (Math.hypot(event.clientX - start.startX, event.clientY - start.startY) < 6) {
            return;
          }
          headerPending.current = null;
          clearHold();
          onStartDrag(id, "detach", start.startX, start.startY);
          start.target.setPointerCapture(start.pointerId);
          onMoveDrag(id, event);
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        <div className="deck-palette-tools">
          <button
            type="button"
            className="deck-palette-cell"
            aria-label="Close palette"
            onClick={onClose}
          >
            ×
          </button>
          <button
            type="button"
            className="deck-palette-cell"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand palette" : "Collapse palette"}
            onClick={() => setCollapsed((current) => !current)}
          >
            {collapsed ? "+" : "−"}
          </button>
        </div>
        <div className="deck-palette-tabs" role="tablist" aria-label="Palette decks">
          {occupancies.map((occupancy) => (
            <button
              key={occupancy}
              type="button"
              role="tab"
              className={[
                "deck-palette-tab",
                occupancy === active ? "active" : "",
                mergeHot ? "merge-hot" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-occupancy={occupancy}
              aria-selected={occupancy === active}
              onClick={() => selectTab(occupancy)}
              onContextMenu={(event) => event.preventDefault()}
            >
              {occupancy}
            </button>
          ))}
        </div>
      </header>
      {!collapsed && (
        <div className="deck-palette-body" role="list">
          {cards.map((grid) => (
            <button
              key={exactId(grid)}
              type="button"
              className="deck-thumb"
              aria-label={`Place occupancy ${active} arrangement`}
              onPointerDown={(event) => {
                onThumbDown();
                onCardDragStart(grid, event.clientX, event.clientY);
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (event.buttons === 0) {
                  return;
                }
                onCardDragMove(event.clientX, event.clientY);
              }}
              onPointerUp={(event) => {
                onCardDragEnd(event.clientX, event.clientY);
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
              }}
              onPointerCancel={(event) => {
                onCardDragEnd(event.clientX, event.clientY);
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
              }}
              onClick={() => onPlace(grid)}
            >
              <MiniGrid grid={grid} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
