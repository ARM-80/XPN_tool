import { describe, expect, it } from "vitest";
import { allGrids, gridsEqual, type Grid, type GridSize } from "./grid";
import {
  reflectAntiDiagonal,
  reflectLeftRight,
  reflectMainDiagonal,
  reflectTopBottom,
  rotate180,
  rotate270,
  rotate90,
} from "./transforms";

const SUPPORTED_SIZES: readonly GridSize[] = [1, 2, 3];

function forEverySupportedGrid(assertion: (grid: Grid) => void): void {
  for (const size of SUPPORTED_SIZES) {
    for (const grid of allGrids(size)) {
      assertion(grid);
    }
  }
}

function expectSameGrid(actual: Grid, expected: Grid): void {
  expect(gridsEqual(actual, expected)).toBe(true);
}

describe("formal mirror-transformation algebra", () => {
  it("realizes the axial Klein four-group on every supported arrangement", () => {
    forEverySupportedGrid((grid) => {
      const lrThenTb = reflectTopBottom(reflectLeftRight(grid));
      const tbThenLr = reflectLeftRight(reflectTopBottom(grid));

      expectSameGrid(reflectLeftRight(reflectLeftRight(grid)), grid);
      expectSameGrid(reflectTopBottom(reflectTopBottom(grid)), grid);
      expectSameGrid(lrThenTb, rotate180(grid));
      expectSameGrid(tbThenLr, rotate180(grid));
      expectSameGrid(lrThenTb, tbThenLr);
      expectSameGrid(rotate180(rotate180(grid)), grid);
    });
  });

  it("satisfies the D4 presentation r^4=e, s^2=e, and srs=r^-1", () => {
    forEverySupportedGrid((grid) => {
      const r4 = rotate90(rotate90(rotate90(rotate90(grid))));
      const s2 = reflectLeftRight(reflectLeftRight(grid));
      const srs = reflectLeftRight(rotate90(reflectLeftRight(grid)));

      expectSameGrid(r4, grid);
      expectSameGrid(s2, grid);
      expectSameGrid(srs, rotate270(grid));
    });
  });

  it("derives every named transform from r=R90 and s=left-right reflection", () => {
    forEverySupportedGrid((grid) => {
      const r2 = rotate90(rotate90(grid));
      const r3 = rotate90(rotate90(rotate90(grid)));
      const r2s = rotate180(reflectLeftRight(grid));
      const sr = reflectLeftRight(rotate90(grid));
      const rs = rotate90(reflectLeftRight(grid));

      expectSameGrid(r2, rotate180(grid));
      expectSameGrid(r3, rotate270(grid));
      expectSameGrid(r2s, reflectTopBottom(grid));
      expectSameGrid(sr, reflectMainDiagonal(grid));
      expectSameGrid(rs, reflectAntiDiagonal(grid));
    });
  });
});
