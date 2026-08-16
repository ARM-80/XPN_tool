import type { Grid } from "../core/grid";

interface GridEditorProps {
  grid: Grid;
  onToggle: (row: number, col: number) => void;
}

export function GridEditor({ grid, onToggle }: GridEditorProps) {
  return (
    <div
      className="grid-editor"
      style={{ gridTemplateColumns: `repeat(${grid.size}, 1fr)` }}
    >
      {grid.cells.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <button
            key={`${rowIndex}-${colIndex}`}
            type="button"
            className={cell === 1 ? "occupied" : undefined}
            aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}, ${cell === 1 ? "occupied" : "empty"}`}
            onClick={() => onToggle(rowIndex, colIndex)}
          />
        )),
      )}
    </div>
  );
}
