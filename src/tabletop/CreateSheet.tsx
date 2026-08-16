import { useState } from "react";
import { GridEditor } from "../components/GridEditor";
import { createEmptyGrid, occupancy, toggleCell, type Grid } from "../core/grid";

interface CreateSheetProps {
  onSave: (grid: Grid) => void;
  onClose: () => void;
}

export function CreateSheet({ onSave, onClose }: CreateSheetProps) {
  const [grid, setGrid] = useState(() => createEmptyGrid(3));

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label="Create arrangement"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-header">
          <h2>New card</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <GridEditor
          grid={grid}
          onToggle={(row, col) => setGrid((current) => toggleCell(current, row, col))}
        />
        <p className="quiet-line">Occupied {occupancy(grid)}</p>
        <button type="button" className="sheet-action" onClick={() => onSave(grid)}>
          Place on table
        </button>
      </div>
    </div>
  );
}
