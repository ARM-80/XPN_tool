import { type Grid, exactId, gridsEqual, occupancy } from "./grid";
import {
  REFLECTION_TRANSFORMS,
  canonicalDihedralId,
  canonicalRotationId,
  dihedralOrbit,
  rotate180,
  rotate270,
  rotate90,
  rotationOrbit,
} from "./transforms";

export interface Classification {
  size: Grid["size"];
  occupancy: number;
  empty: number;
  centerOccupied: boolean | null;
  cornerOccupiedCount: number;
  edgeOccupiedCount: number;
  connected: boolean | null;
  components: number;
  rotationOrbitSize: number;
  dihedralOrbitSize: number;
  rotationalSymmetryOrder: number;
  equivalentRotations: number;
  reflectionSymmetry: boolean;
  exactId: string;
  rotationClassId: string;
  dihedralClassId: string;
}

const ORTHOGONAL: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function isCorner(size: Grid["size"], row: number, col: number): boolean {
  const last = size - 1;
  return (row === 0 || row === last) && (col === 0 || col === last);
}

function isEdge(size: Grid["size"], row: number, col: number): boolean {
  const last = size - 1;
  const onBorder = row === 0 || row === last || col === 0 || col === last;
  return onBorder && !isCorner(size, row, col);
}

export function componentCount(grid: Grid): number {
  const n = grid.size;
  const seen: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  let count = 0;

  for (let row = 0; row < n; row += 1) {
    for (let col = 0; col < n; col += 1) {
      if (grid.cells[row][col] === 0 || seen[row][col]) {
        continue;
      }

      count += 1;
      const queue: Array<[number, number]> = [[row, col]];
      seen[row][col] = true;

      while (queue.length > 0) {
        const [r, c] = queue.pop()!;
        for (const [dr, dc] of ORTHOGONAL) {
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr < 0 ||
            nr >= n ||
            nc < 0 ||
            nc >= n ||
            seen[nr][nc] ||
            grid.cells[nr][nc] === 0
          ) {
            continue;
          }
          seen[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
  }

  return count;
}

export function classify(grid: Grid): Classification {
  const n = grid.size;
  const occupied = occupancy(grid);
  const components = componentCount(grid);
  const rotations = [grid, rotate90(grid), rotate180(grid), rotate270(grid)];
  const equivalentRotations = rotations.filter((candidate) => gridsEqual(grid, candidate)).length;

  let centerOccupied: boolean | null = null;
  if (n % 2 === 1) {
    const mid = (n - 1) / 2;
    centerOccupied = grid.cells[mid][mid] === 1;
  }

  let cornerOccupiedCount = 0;
  let edgeOccupiedCount = 0;
  for (let row = 0; row < n; row += 1) {
    for (let col = 0; col < n; col += 1) {
      if (grid.cells[row][col] === 0) {
        continue;
      }
      if (isCorner(n, row, col)) {
        cornerOccupiedCount += 1;
      }
      if (isEdge(n, row, col)) {
        edgeOccupiedCount += 1;
      }
    }
  }

  return {
    size: n,
    occupancy: occupied,
    empty: n * n - occupied,
    centerOccupied,
    cornerOccupiedCount,
    edgeOccupiedCount,
    connected: occupied === 0 ? null : components === 1,
    components,
    rotationOrbitSize: rotationOrbit(grid).length,
    dihedralOrbitSize: dihedralOrbit(grid).length,
    rotationalSymmetryOrder: equivalentRotations,
    equivalentRotations,
    reflectionSymmetry: REFLECTION_TRANSFORMS.some((transform) =>
      gridsEqual(grid, transform(grid)),
    ),
    exactId: exactId(grid),
    rotationClassId: canonicalRotationId(grid),
    dihedralClassId: canonicalDihedralId(grid),
  };
}
