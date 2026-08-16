import { describe, expect, it } from "vitest";
import { classify, componentCount } from "./classify";
import { createEmptyGrid, createFullGrid, createGrid } from "./grid";

describe("occupancy and region counts", () => {
  it("counts occupancy, emptiness, center, corners, and edges", () => {
    const grid = createGrid(3, [
      [1, 1, 0],
      [0, 1, 0],
      [1, 0, 0],
    ]);
    const info = classify(grid);

    expect(info.size).toBe(3);
    expect(info.occupancy).toBe(4);
    expect(info.empty).toBe(5);
    expect(info.centerOccupied).toBe(true);
    expect(info.cornerOccupiedCount).toBe(2);
    expect(info.edgeOccupiedCount).toBe(1);
  });

  it("treats 2x2 as having no unique center", () => {
    const info = classify(
      createGrid(2, [
        [1, 0],
        [0, 1],
      ]),
    );
    expect(info.centerOccupied).toBeNull();
    expect(info.cornerOccupiedCount).toBe(2);
    expect(info.edgeOccupiedCount).toBe(0);
  });

  it("treats the 1x1 cell as both center and corner", () => {
    const occupied = classify(createGrid(1, [[1]]));
    expect(occupied.centerOccupied).toBe(true);
    expect(occupied.cornerOccupiedCount).toBe(1);
    expect(occupied.edgeOccupiedCount).toBe(0);
    expect(classify(createEmptyGrid(1)).centerOccupied).toBe(false);
  });
});

describe("connectivity", () => {
  it("counts orthogonal components and connectedness", () => {
    const empty = classify(createEmptyGrid(3));
    expect(empty.components).toBe(0);
    expect(empty.connected).toBe(true);
    expect(componentCount(createEmptyGrid(3))).toBe(0);

    const full = classify(createFullGrid(3));
    expect(full.components).toBe(1);
    expect(full.connected).toBe(true);

    const diagonal = classify(
      createGrid(3, [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]),
    );
    expect(diagonal.components).toBe(3);
    expect(diagonal.connected).toBe(false);

    const snake = classify(
      createGrid(3, [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ]),
    );
    expect(snake.components).toBe(1);
    expect(snake.connected).toBe(true);
  });
});

describe("symmetry classification", () => {
  it("reports orbit sizes and symmetry for a plus", () => {
    const plus = classify(
      createGrid(3, [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ]),
    );
    expect(plus.rotationOrbitSize).toBe(1);
    expect(plus.dihedralOrbitSize).toBe(1);
    expect(plus.rotationalSymmetryOrder).toBe(4);
    expect(plus.equivalentRotations).toBe(4);
    expect(plus.reflectionSymmetry).toBe(true);
  });

  it("reports orbit sizes and missing reflection for an asymmetric grid", () => {
    const info = classify(
      createGrid(3, [
        [1, 1, 0],
        [0, 0, 0],
        [0, 0, 1],
      ]),
    );
    expect(info.rotationOrbitSize).toBe(4);
    expect(info.dihedralOrbitSize).toBe(8);
    expect(info.rotationalSymmetryOrder).toBe(1);
    expect(info.reflectionSymmetry).toBe(false);
  });
});
