import { useMemo } from "react";
import { MiniGrid } from "../components/MiniGrid";
import { occupancyDeck } from "../core/board";
import { exactId, type Grid } from "../core/grid";

interface DeckBarProps {
  openDeck: number | null;
  onToggleDeck: (occupancy: number) => void;
  onPlace: (grid: Grid) => void;
}

const DECKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function DeckBar({ openDeck, onToggleDeck, onPlace }: DeckBarProps) {
  const cards = useMemo(() => (openDeck === null ? [] : occupancyDeck(openDeck)), [openDeck]);

  return (
    <div className="deck-bar">
      <div className="deck-numbers" role="tablist" aria-label="Occupancy decks">
        {DECKS.map((occupancy) => (
          <button
            key={occupancy}
            type="button"
            role="tab"
            aria-selected={openDeck === occupancy}
            onClick={() => onToggleDeck(occupancy)}
          >
            {occupancy}
          </button>
        ))}
      </div>
      {openDeck !== null && (
        <div className="deck-tray" role="list" aria-label={`Occupancy ${openDeck} arrangements`}>
          {cards.map((grid) => (
            <button
              key={exactId(grid)}
              type="button"
              className="deck-thumb"
              aria-label={`Place occupancy ${openDeck} arrangement`}
              onClick={() => onPlace(grid)}
            >
              <MiniGrid grid={grid} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
