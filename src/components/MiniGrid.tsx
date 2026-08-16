import type { Grid } from "../core/grid";

interface MiniGridProps {
  grid: Grid;
}

export function MiniGrid({ grid }: MiniGridProps) {
  return (
    <div
      className="mini-grid"
      style={{ gridTemplateColumns: `repeat(${grid.size}, 1fr)` }}
    >
      {grid.cells.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <span
            key={`${rowIndex}-${colIndex}`}
            className={cell === 1 ? "occupied" : undefined}
          />
        )),
      )}
    </div>
  );
}
