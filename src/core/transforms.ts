import { type Grid, exactId, gridsEqual, gridToMask } from "./grid";

function mapCells(grid: Grid, read: (row: number, col: number) => 0 | 1): Grid {
  const n = grid.size;
  const cells: Array<Array<0 | 1>> = [];
  for (let row = 0; row < n; row += 1) {
    const nextRow: Array<0 | 1> = [];
    for (let col = 0; col < n; col += 1) {
      nextRow.push(read(row, col));
    }
    cells.push(nextRow);
  }
  return { size: n, cells };
}

/** 90° clockwise. */
export function rotate90(grid: Grid): Grid {
  const n = grid.size;
  return mapCells(grid, (row, col) => grid.cells[n - 1 - col][row]);
}

export function rotate180(grid: Grid): Grid {
  const n = grid.size;
  return mapCells(grid, (row, col) => grid.cells[n - 1 - row][n - 1 - col]);
}

/** 270° clockwise (90° counter-clockwise). */
export function rotate270(grid: Grid): Grid {
  const n = grid.size;
  return mapCells(grid, (row, col) => grid.cells[col][n - 1 - row]);
}

/** Mirror across the vertical axis (left-right flip). */
export function reflectLeftRight(grid: Grid): Grid {
  const n = grid.size;
  return mapCells(grid, (row, col) => grid.cells[row][n - 1 - col]);
}

/** Mirror across the horizontal axis (top-bottom flip). */
export function reflectTopBottom(grid: Grid): Grid {
  const n = grid.size;
  return mapCells(grid, (row, col) => grid.cells[n - 1 - row][col]);
}

/** Mirror across the main diagonal (transpose). */
export function reflectMainDiagonal(grid: Grid): Grid {
  return mapCells(grid, (row, col) => grid.cells[col][row]);
}

/** Mirror across the anti-diagonal. */
export function reflectAntiDiagonal(grid: Grid): Grid {
  const n = grid.size;
  return mapCells(grid, (row, col) => grid.cells[n - 1 - col][n - 1 - row]);
}

export const ROTATION_TRANSFORMS = [rotate90, rotate180, rotate270] as const;

export const REFLECTION_TRANSFORMS = [
  reflectLeftRight,
  reflectTopBottom,
  reflectMainDiagonal,
  reflectAntiDiagonal,
] as const;

/** The 8 elements of the square symmetry group D4, including identity. */
export const SQUARE_SYMMETRY_TRANSFORMS = [
  (grid: Grid) => grid,
  rotate90,
  rotate180,
  rotate270,
  reflectLeftRight,
  reflectTopBottom,
  reflectMainDiagonal,
  reflectAntiDiagonal,
] as const;

function uniqueSorted(grids: Grid[]): Grid[] {
  const byMask = new Map<number, Grid>();
  for (const grid of grids) {
    const mask = gridToMask(grid);
    if (!byMask.has(mask)) {
      byMask.set(mask, grid);
    }
  }

  return [...byMask.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, grid]) => grid);
}

export function rotationOrbit(grid: Grid): Grid[] {
  return uniqueSorted([grid, rotate90(grid), rotate180(grid), rotate270(grid)]);
}

export function dihedralOrbit(grid: Grid): Grid[] {
  return uniqueSorted(SQUARE_SYMMETRY_TRANSFORMS.map((transform) => transform(grid)));
}

export function canonicalRotationId(grid: Grid): string {
  return exactId(rotationOrbit(grid)[0]);
}

export function canonicalDihedralId(grid: Grid): string {
  return exactId(dihedralOrbit(grid)[0]);
}

export type DirectTransformId =
  | "rotate90"
  | "rotate180"
  | "rotate270"
  | "reflectLeftRight"
  | "reflectTopBottom"
  | "reflectMainDiagonal"
  | "reflectAntiDiagonal";

export const DIRECT_TRANSFORM_IDS: readonly DirectTransformId[] = [
  "rotate90",
  "rotate180",
  "rotate270",
  "reflectLeftRight",
  "reflectTopBottom",
  "reflectMainDiagonal",
  "reflectAntiDiagonal",
];

export const DIRECT_TRANSFORMS: Record<DirectTransformId, (grid: Grid) => Grid> = {
  rotate90,
  rotate180,
  rotate270,
  reflectLeftRight,
  reflectTopBottom,
  reflectMainDiagonal,
  reflectAntiDiagonal,
};

export const DIRECT_TRANSFORM_LABELS: Record<DirectTransformId, string> = {
  rotate90: "Rotate 90°",
  rotate180: "Rotate 180°",
  rotate270: "Rotate 270°",
  reflectLeftRight: "Reflect left/right",
  reflectTopBottom: "Reflect top/bottom",
  reflectMainDiagonal: "Reflect main diagonal",
  reflectAntiDiagonal: "Reflect anti-diagonal",
};

export const DIRECT_TRANSFORM_SHORT_LABELS: Record<DirectTransformId, string> = {
  rotate90: "R90",
  rotate180: "R180",
  rotate270: "R270",
  reflectLeftRight: "M-LR",
  reflectTopBottom: "M-TB",
  reflectMainDiagonal: "M-D",
  reflectAntiDiagonal: "M-AD",
};

export function isDirectTransformId(value: string): value is DirectTransformId {
  return (DIRECT_TRANSFORM_IDS as readonly string[]).includes(value);
}

export interface TransformLink {
  grid: Grid;
  labels: DirectTransformId[];
}

export function transformRelationsBetween(a: Grid, b: Grid): DirectTransformId[] {
  if (a.size !== b.size) {
    return [];
  }
  return DIRECT_TRANSFORM_IDS.filter((id) => gridsEqual(DIRECT_TRANSFORMS[id](a), b));
}

export function transformLinksFrom(grid: Grid): TransformLink[] {
  const links: TransformLink[] = [];
  const indexById = new Map<string, number>();

  for (const id of DIRECT_TRANSFORM_IDS) {
    const result = DIRECT_TRANSFORMS[id](grid);
    const resultId = exactId(result);
    const existing = indexById.get(resultId);
    if (existing !== undefined) {
      links[existing].labels.push(id);
      continue;
    }
    indexById.set(resultId, links.length);
    links.push({ grid: result, labels: [id] });
  }

  return links;
}
