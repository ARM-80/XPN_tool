export type Cell = 0 | 1;
export type GridSize = 1 | 2 | 3;

export interface Grid {
  size: GridSize;
  cells: Cell[][];
}

const SIZES: readonly GridSize[] = [1, 2, 3];

export function isGridSize(value: number): value is GridSize {
  return SIZES.includes(value as GridSize);
}

export function cellCount(size: GridSize): number {
  return size * size;
}

export function maxMask(size: GridSize): number {
  return (1 << cellCount(size)) - 1;
}

export function createEmptyGrid(size: GridSize): Grid {
  return gridFromMask(size, 0);
}

export function createFullGrid(size: GridSize): Grid {
  return gridFromMask(size, maxMask(size));
}

export function createGrid(size: GridSize, cells: ReadonlyArray<ReadonlyArray<number>>): Grid {
  if (cells.length !== size) {
    throw new Error(`Expected ${size} rows, received ${cells.length}`);
  }

  const next: Cell[][] = [];
  for (let row = 0; row < size; row += 1) {
    const source = cells[row];
    if (source.length !== size) {
      throw new Error(`Expected ${size} columns in row ${row}, received ${source.length}`);
    }
    const nextRow: Cell[] = [];
    for (let col = 0; col < size; col += 1) {
      const value = source[col];
      if (value !== 0 && value !== 1) {
        throw new Error(`Cell (${row}, ${col}) must be 0 or 1`);
      }
      nextRow.push(value);
    }
    next.push(nextRow);
  }

  return { size, cells: next };
}

export function cloneGrid(grid: Grid): Grid {
  return {
    size: grid.size,
    cells: grid.cells.map((row) => row.slice()),
  };
}

export function gridsEqual(a: Grid, b: Grid): boolean {
  return a.size === b.size && gridToMask(a) === gridToMask(b);
}

export function gridToMask(grid: Grid): number {
  const n = grid.size;
  let mask = 0;
  for (let row = 0; row < n; row += 1) {
    for (let col = 0; col < n; col += 1) {
      if (grid.cells[row][col] === 1) {
        mask |= 1 << (row * n + col);
      }
    }
  }
  return mask;
}

export function gridFromMask(size: GridSize, mask: number): Grid {
  if (!Number.isInteger(mask) || mask < 0 || mask > maxMask(size)) {
    throw new Error(`Mask ${mask} is outside 0..${maxMask(size)} for ${size}x${size}`);
  }

  const cells: Cell[][] = [];
  for (let row = 0; row < size; row += 1) {
    const nextRow: Cell[] = [];
    for (let col = 0; col < size; col += 1) {
      const bit = (mask >> (row * size + col)) & 1;
      nextRow.push(bit === 1 ? 1 : 0);
    }
    cells.push(nextRow);
  }

  return { size, cells };
}

export function exactId(grid: Grid): string {
  return `${grid.size}x${grid.size}:${gridToMask(grid)}`;
}

export function parseExactId(id: string): Grid {
  const match = /^([123])x\1:(\d+)$/.exec(id);
  if (!match) {
    throw new Error(`Invalid exact ID: ${id}`);
  }

  const size = Number(match[1]) as GridSize;
  return gridFromMask(size, Number(match[2]));
}

export function isExactId(id: string): boolean {
  try {
    parseExactId(id);
    return true;
  } catch {
    return false;
  }
}

export function toggleCell(grid: Grid, row: number, col: number): Grid {
  const n = grid.size;
  if (row < 0 || row >= n || col < 0 || col >= n) {
    throw new Error(`Cell (${row}, ${col}) is outside ${n}x${n}`);
  }

  const next = cloneGrid(grid);
  next.cells[row][col] = next.cells[row][col] === 1 ? 0 : 1;
  return next;
}

export function allMasks(size: GridSize): number[] {
  const count = maxMask(size) + 1;
  return Array.from({ length: count }, (_, mask) => mask);
}

export function allGrids(size: GridSize): Grid[] {
  return allMasks(size).map((mask) => gridFromMask(size, mask));
}

export function occupancy(grid: Grid): number {
  return grid.cells.flat().reduce<number>((sum, cell) => sum + cell, 0);
}
