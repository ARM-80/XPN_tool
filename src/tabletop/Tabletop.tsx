import { useMemo, useRef, useState } from "react";
import { MiniGrid } from "../components/MiniGrid";
import { OverflowMenu } from "../components/OverflowMenu";
import {
  type BoardStore,
  addCard,
  addLink,
  deserializeBoardStore,
  duplicateCard,
  moveCard,
  removeCard,
  removeLink,
  setCardNote,
  setLinkDirection,
  setLinkLabel,
  setLinkNote,
} from "../core/board";
import { classify } from "../core/classify";
import { exactId, parseExactId, type Grid } from "../core/grid";
import {
  type ResearchStore,
  applicableClassifications,
  deserializeResearchStore,
  emptyResearchStore,
} from "../core/research";
import {
  DIRECT_TRANSFORMS,
  type DirectTransformId,
} from "../core/transforms";
import { CardInfo } from "./CardInfo";
import { CardMenu } from "./CardMenu";
import { ClassifySheet } from "./ClassifySheet";
import { CreateSheet } from "./CreateSheet";
import { DeckBar } from "./DeckBar";
import { LinkEditor } from "./LinkEditor";
import { NoteEditor } from "./NoteEditor";

const CARD = 104;
const WORK = 2400;

interface TabletopProps {
  board: BoardStore;
  research: ResearchStore;
  onBoard: (board: BoardStore) => void;
  onResearch: (research: ResearchStore) => void;
}

export function Tabletop({ board, research, onBoard, onResearch }: TabletopProps) {
  const surface = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [openDeck, setOpenDeck] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [classifyOpen, setClassifyOpen] = useState(false);
  const [noteCardId, setNoteCardId] = useState<string | null>(null);
  const [infoCardId, setInfoCardId] = useState<string | null>(null);
  const [linkId, setLinkId] = useState<string | null>(null);
  const [linkFrom, setLinkFrom] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; cardId: string } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<{ board: BoardStore; research: ResearchStore } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{
    ids: string[];
    origin: Map<string, { x: number; y: number }>;
    startX: number;
    startY: number;
    moved: boolean;
    long?: number;
  } | null>(null);
  const placeIndex = useRef(0);

  const cards = board.cards;
  const selectedCards = cards.filter((card) => selected.includes(card.id));
  const noteCard = cards.find((card) => card.id === noteCardId) ?? null;
  const infoCard = cards.find((card) => card.id === infoCardId) ?? null;
  const activeLink = board.links.find((item) => item.id === linkId) ?? null;
  const info = useMemo(
    () => (infoCard ? classify(parseExactId(infoCard.exactId)) : null),
    [infoCard],
  );

  function viewportPlace() {
    const node = surface.current;
    const left = node?.scrollLeft ?? 0;
    const top = node?.scrollTop ?? 0;
    const n = placeIndex.current;
    placeIndex.current += 1;
    return {
      x: left + 72 + (n % 6) * 28,
      y: top + 72 + (n % 6) * 28,
    };
  }

  function placeGrid(grid: Grid) {
    const point = viewportPlace();
    onBoard(addCard(board, exactId(grid), point.x, point.y));
    setOpenDeck(null);
  }

  function toggleSelect(cardId: string) {
    setSelected((current) =>
      current.includes(cardId) ? current.filter((id) => id !== cardId) : [...current, cardId],
    );
  }

  function onCardPointerDown(event: React.PointerEvent, cardId: string) {
    if (linkFrom) {
      if (linkFrom !== cardId) {
        onBoard(addLink(board, linkFrom, cardId));
      }
      setLinkFrom(null);
      return;
    }

    const wasSelected = selected.includes(cardId);
    const ids = wasSelected ? selected : [cardId];
    const origin = new Map(cards.filter((card) => ids.includes(card.id)).map((card) => [card.id, { x: card.x, y: card.y }]));
    drag.current = {
      ids,
      origin,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      long: window.setTimeout(() => {
        if (drag.current && !drag.current.moved) {
          setMenu({ x: event.clientX, y: event.clientY, cardId });
          drag.current = null;
        }
      }, 480),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onCardPointerMove(event: React.PointerEvent) {
    const state = drag.current;
    if (!state) {
      return;
    }
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (!state.moved && Math.hypot(dx, dy) < 8) {
      return;
    }
    state.moved = true;
    if (state.long) {
      window.clearTimeout(state.long);
      state.long = undefined;
    }
    let next = board;
    for (const id of state.ids) {
      const start = state.origin.get(id);
      if (!start) {
        continue;
      }
      next = moveCard(next, id, start.x + dx, start.y + dy);
    }
    onBoard(next);
  }

  function onCardPointerUp(event: React.PointerEvent, cardId: string) {
    const state = drag.current;
    if (state?.long) {
      window.clearTimeout(state.long);
    }
    if (state && !state.moved) {
      toggleSelect(cardId);
    } else if (state?.moved && !selected.includes(cardId)) {
      setSelected([cardId]);
    }
    drag.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function applyTransform(cardId: string, transformId: DirectTransformId) {
    const card = cards.find((item) => item.id === cardId);
    if (!card) {
      return;
    }
    const nextGrid = DIRECT_TRANSFORMS[transformId](parseExactId(card.exactId));
    onBoard(addCard(board, exactId(nextGrid), card.x + 36, card.y + 24));
  }

  function exportData() {
    const payload = {
      version: 1,
      board,
      research,
    };
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "xpn-tabletop.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(file: File) {
    setImportError(null);
    file.text().then((text) => {
      try {
        const data = JSON.parse(text) as { board?: unknown; research?: unknown };
        const nextBoard = deserializeBoardStore(JSON.stringify(data.board ?? data));
        const nextResearch = data.research
          ? deserializeResearchStore(JSON.stringify(data.research))
          : emptyResearchStore();
        setPendingImport({ board: nextBoard, research: nextResearch });
      } catch (error) {
        setPendingImport(null);
        setImportError(error instanceof Error ? error.message : "Import failed");
      }
    });
  }

  return (
    <div className="tabletop-app">
      <header className="table-topbar">
        <button type="button" className="icon-button" aria-label="Create card" onClick={() => setCreateOpen(true)}>
          +
        </button>
        {selected.length > 1 && (
          <button type="button" className="text-action" onClick={() => setClassifyOpen(true)}>
            Group / Classify
          </button>
        )}
        {linkFrom && <span className="quiet-line">Tap another card to link</span>}
        <OverflowMenu>
          <button type="button" role="menuitem" onClick={() => setClassifyOpen(true)}>
            Classifications
          </button>
          <button type="button" role="menuitem" onClick={exportData}>
            Export
          </button>
          <button type="button" role="menuitem" onClick={() => fileRef.current?.click()}>
            Import
          </button>
        </OverflowMenu>
      </header>

      <div
        ref={surface}
        className="table-surface"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget || (event.target as HTMLElement).classList.contains("table-field")) {
            setSelected([]);
            setLinkFrom(null);
            setMenu(null);
          }
        }}
      >
        <div className="table-field" style={{ width: WORK, height: WORK }}>
          <svg className="table-links" width={WORK} height={WORK}>
            {board.links.map((item) => {
              const from = cards.find((card) => card.id === item.fromCardInstanceId);
              const to = cards.find((card) => card.id === item.toCardInstanceId);
              if (!from || !to) {
                return null;
              }
              const x1 = from.x + CARD / 2;
              const y1 = from.y + CARD / 2;
              const x2 = to.x + CARD / 2;
              const y2 = to.y + CARD / 2;
              return (
                <g key={item.id} onClick={() => setLinkId(item.id)}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} className="link-hit" />
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className="link-line"
                    markerEnd={item.direction === "forward" ? "url(#arrow)" : undefined}
                    markerStart={item.direction === "backward" ? "url(#arrow)" : undefined}
                  />
                  {item.label && (
                    <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} className="link-label">
                      {item.label}
                    </text>
                  )}
                </g>
              );
            })}
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
              </marker>
            </defs>
          </svg>

          {cards.map((card) => {
            const grid = parseExactId(card.exactId);
            const labels = applicableClassifications(research, grid);
            const active = selected.includes(card.id);
            return (
              <article
                key={card.id}
                className={active ? "table-card selected" : "table-card"}
                style={{ left: card.x, top: card.y }}
                onPointerDown={(event) => onCardPointerDown(event, card.id)}
                onPointerMove={onCardPointerMove}
                onPointerUp={(event) => onCardPointerUp(event, card.id)}
              >
                <MiniGrid grid={grid} />
                {card.label && <p className="card-label">{card.label}</p>}
                {labels.length > 0 && (
                  <p className="card-chips">
                    {labels.map((item) => item.classification.name).join(" · ")}
                  </p>
                )}
                {card.note && (
                  <button
                    type="button"
                    className="note-dot"
                    aria-label="Open note"
                    onClick={(event) => {
                      event.stopPropagation();
                      setNoteCardId(card.id);
                    }}
                  />
                )}
              </article>
            );
          })}
        </div>
      </div>

      <DeckBar
        openDeck={openDeck}
        onToggleDeck={(occupancy) => setOpenDeck((current) => (current === occupancy ? null : occupancy))}
        onPlace={placeGrid}
      />

      {importError && <p className="error">{importError}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleImport(file);
          }
          event.target.value = "";
        }}
      />

      {createOpen && (
        <CreateSheet
          onSave={(grid) => {
            placeGrid(grid);
            setCreateOpen(false);
          }}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {classifyOpen && (
        <ClassifySheet
          store={research}
          targetIds={
            selectedCards.length > 0
              ? selectedCards.map((card) => card.exactId)
              : []
          }
          onChange={onResearch}
          onClose={() => setClassifyOpen(false)}
        />
      )}

      {noteCard && (
        <NoteEditor
          title="Card note"
          value={noteCard.note ?? ""}
          onChange={(value) => onBoard(setCardNote(board, noteCard.id, value))}
          onClose={() => setNoteCardId(null)}
        />
      )}

      {info && <CardInfo info={info} onClose={() => setInfoCardId(null)} />}

      {activeLink && (
        <LinkEditor
          link={activeLink}
          onLabel={(label) => onBoard(setLinkLabel(board, activeLink.id, label))}
          onNote={(note) => onBoard(setLinkNote(board, activeLink.id, note))}
          onDirection={(direction) => onBoard(setLinkDirection(board, activeLink.id, direction))}
          onDelete={() => {
            onBoard(removeLink(board, activeLink.id));
            setLinkId(null);
          }}
          onClose={() => setLinkId(null)}
        />
      )}

      {menu && (
        <CardMenu
          x={menu.x}
          y={menu.y}
          multi={selected.length > 1 && selected.includes(menu.cardId)}
          onTransform={(id) => {
            applyTransform(menu.cardId, id);
            setMenu(null);
          }}
          onDuplicate={() => {
            onBoard(duplicateCard(board, menu.cardId));
            setMenu(null);
          }}
          onRemove={() => {
            const ids = selected.includes(menu.cardId) && selected.length > 1 ? selected : [menu.cardId];
            onBoard(ids.reduce((next, id) => removeCard(next, id), board));
            setSelected([]);
            setMenu(null);
          }}
          onClassify={() => {
            setClassifyOpen(true);
            setMenu(null);
          }}
          onLink={() => {
            setLinkFrom(menu.cardId);
            setMenu(null);
          }}
          onNote={() => {
            setNoteCardId(menu.cardId);
            setMenu(null);
          }}
          onInfo={() => {
            setInfoCardId(menu.cardId);
            setMenu(null);
          }}
          onClose={() => setMenu(null)}
        />
      )}

      {pendingImport && (
        <div className="sheet-backdrop" onClick={() => setPendingImport(null)}>
          <div className="sheet" role="dialog" aria-label="Replace tabletop" onClick={(event) => event.stopPropagation()}>
            <h2>Replace tabletop data?</h2>
            <p>This replaces cards, links, and local research classifications.</p>
            <div className="action-row">
              <button type="button" className="text-action" onClick={() => setPendingImport(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="sheet-action"
                onClick={() => {
                  onBoard(pendingImport.board);
                  onResearch(pendingImport.research);
                  setPendingImport(null);
                }}
              >
                Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
