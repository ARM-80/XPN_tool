import type { Grid } from "../core/grid";

interface GridEditorProps {
  grid: Grid;
  onToggle?: (row: number, col: number) => void;
  readOnly?: boolean;
  large?: boolean;
}

export function GridEditor({ grid, onToggle, readOnly = false, large = false }: GridEditorProps) {
  return (
    <div
      className={large ? "grid-editor dominant" : "grid-editor"}
      style={{ gridTemplateColumns: `repeat(${grid.size}, 1fr)` }}
    >
      {grid.cells.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <button
            key={`${rowIndex}-${colIndex}`}
            type="button"
            className={cell === 1 ? "occupied" : undefined}
            disabled={readOnly}
            aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}, ${cell === 1 ? "occupied" : "empty"}`}
            onClick={() => {
              if (!readOnly) {
                onToggle?.(rowIndex, colIndex);
              }
            }}
          />
        )),
      )}
    </div>
  );
}
