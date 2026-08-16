import { describe, expect, it } from "vitest";
import {
  allGrids,
  createEmptyGrid,
  createFullGrid,
  createGrid,
  exactId,
  gridFromMask,
  gridToMask,
  isExactId,
  maxMask,
  occupancy,
  parseExactId,
  toggleCell,
} from "./grid";

describe("grid model", () => {
  it("represents every 1x1, 2x2, and 3x3 raw arrangement", () => {
    expect(allGrids(1)).toHaveLength(2);
    expect(allGrids(2)).toHaveLength(16);
    expect(allGrids(3)).toHaveLength(512);
    expect(maxMask(3)).toBe(511);
  });

  it("uses a deterministic exact ID that round-trips", () => {
    const grid = createGrid(3, [
      [1, 0, 1],
      [0, 1, 0],
      [0, 0, 1],
    ]);

    expect(exactId(grid)).toBe("3x3:277");
    expect(gridToMask(grid)).toBe(277);
    expect(parseExactId("3x3:277")).toEqual(grid);
    expect(gridFromMask(3, 277)).toEqual(grid);
  });

  it("assigns unique exact IDs across all 512 3x3 states", () => {
    const ids = allGrids(3).map(exactId);
    expect(new Set(ids).size).toBe(512);
    expect(ids.every(isExactId)).toBe(true);
  });

  it("counts occupancy and toggles a single cell", () => {
    const empty = createEmptyGrid(2);
    expect(occupancy(empty)).toBe(0);

    const one = toggleCell(empty, 1, 0);
    expect(occupancy(one)).toBe(1);
    expect(one.cells[1][0]).toBe(1);
    expect(occupancy(toggleCell(one, 1, 0))).toBe(0);
    expect(occupancy(createFullGrid(3))).toBe(9);
  });

  it("rejects invalid masks and IDs", () => {
    expect(() => gridFromMask(3, 512)).toThrow();
    expect(() => parseExactId("3x2:1")).toThrow();
    expect(isExactId("3x3:512")).toBe(false);
  });
});
