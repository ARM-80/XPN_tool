import { describe, expect, it } from "vitest";
import { allGrids, createGrid, exactId, gridsEqual } from "./grid";
import {
  DIRECT_TRANSFORM_IDS,
  SQUARE_SYMMETRY_TRANSFORMS,
  canonicalDihedralId,
  canonicalRotationId,
  dihedralOrbit,
  reflectAntiDiagonal,
  reflectLeftRight,
  reflectMainDiagonal,
  reflectTopBottom,
  rotate180,
  rotate270,
  rotate90,
  rotationOrbit,
  transformLinksFrom,
  transformRelationsBetween,
} from "./transforms";

const SAMPLE = createGrid(3, [
  [1, 1, 0],
  [0, 0, 0],
  [0, 0, 1],
]);

describe("rotations", () => {
  it("rotates 90, 180, and 270 clockwise", () => {
    expect(rotate90(SAMPLE).cells).toEqual([
      [0, 0, 1],
      [0, 0, 1],
      [1, 0, 0],
    ]);
    expect(rotate180(SAMPLE).cells).toEqual([
      [1, 0, 0],
      [0, 0, 0],
      [0, 1, 1],
    ]);
    expect(rotate270(SAMPLE).cells).toEqual([
      [0, 0, 1],
      [1, 0, 0],
      [1, 0, 0],
    ]);
  });

  it("closes the rotation group", () => {
    expect(rotate90(rotate90(SAMPLE))).toEqual(rotate180(SAMPLE));
    expect(rotate90(rotate90(rotate90(SAMPLE)))).toEqual(rotate270(SAMPLE));
    expect(rotate90(rotate90(rotate90(rotate90(SAMPLE))))).toEqual(SAMPLE);
    expect(rotate180(rotate180(SAMPLE))).toEqual(SAMPLE);
    expect(rotate270(rotate90(SAMPLE))).toEqual(SAMPLE);
  });
});

describe("reflections", () => {
  it("applies the four square reflections", () => {
    expect(reflectLeftRight(SAMPLE).cells).toEqual([
      [0, 1, 1],
      [0, 0, 0],
      [1, 0, 0],
    ]);
    expect(reflectTopBottom(SAMPLE).cells).toEqual([
      [0, 0, 1],
      [0, 0, 0],
      [1, 1, 0],
    ]);
    expect(reflectMainDiagonal(SAMPLE).cells).toEqual([
      [1, 0, 0],
      [1, 0, 0],
      [0, 0, 1],
    ]);
    expect(reflectAntiDiagonal(SAMPLE).cells).toEqual([
      [1, 0, 0],
      [0, 0, 1],
      [0, 0, 1],
    ]);
  });

  it("is an involution for every reflection", () => {
    expect(reflectLeftRight(reflectLeftRight(SAMPLE))).toEqual(SAMPLE);
    expect(reflectTopBottom(reflectTopBottom(SAMPLE))).toEqual(SAMPLE);
    expect(reflectMainDiagonal(reflectMainDiagonal(SAMPLE))).toEqual(SAMPLE);
    expect(reflectAntiDiagonal(reflectAntiDiagonal(SAMPLE))).toEqual(SAMPLE);
  });
});

describe("transform closure", () => {
  it("keeps every D4 composition inside the eight square symmetries", () => {
    const ids = new Set(SQUARE_SYMMETRY_TRANSFORMS.map((transform) => exactId(transform(SAMPLE))));
    expect(ids.size).toBe(8);

    for (const first of SQUARE_SYMMETRY_TRANSFORMS) {
      for (const second of SQUARE_SYMMETRY_TRANSFORMS) {
        const composed = exactId(second(first(SAMPLE)));
        expect(ids.has(composed)).toBe(true);
      }
    }
  });
});

describe("orbits and canonical IDs", () => {
  it("removes duplicate transforms from each orbit", () => {
    const empty = createGrid(3, [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    expect(rotationOrbit(empty)).toHaveLength(1);
    expect(dihedralOrbit(empty)).toHaveLength(1);

    const plus = createGrid(3, [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ]);
    expect(rotationOrbit(plus)).toHaveLength(1);
    expect(dihedralOrbit(plus)).toHaveLength(1);
  });

  it("sorts orbit members by mask and uses the minimum as the canonical ID", () => {
    const orbit = rotationOrbit(SAMPLE);
    const masks = orbit.map((grid) => Number(exactId(grid).split(":")[1]));
    expect(masks).toEqual([...masks].sort((a, b) => a - b));
    expect(canonicalRotationId(SAMPLE)).toBe(exactId(orbit[0]));
    expect(canonicalDihedralId(SAMPLE)).toBe(exactId(dihedralOrbit(SAMPLE)[0]));
  });

  it("keeps canonical IDs stable under the matching symmetry group", () => {
    const rotationId = canonicalRotationId(SAMPLE);
    expect(canonicalRotationId(rotate90(SAMPLE))).toBe(rotationId);
    expect(canonicalRotationId(rotate180(SAMPLE))).toBe(rotationId);
    expect(canonicalRotationId(rotate270(SAMPLE))).toBe(rotationId);

    const dihedralId = canonicalDihedralId(SAMPLE);
    for (const transform of SQUARE_SYMMETRY_TRANSFORMS) {
      expect(canonicalDihedralId(transform(SAMPLE))).toBe(dihedralId);
    }
  });

  it("classifies a known asymmetric arrangement", () => {
    expect(rotationOrbit(SAMPLE)).toHaveLength(4);
    expect(dihedralOrbit(SAMPLE)).toHaveLength(8);
    expect(canonicalRotationId(SAMPLE)).not.toBe(canonicalDihedralId(SAMPLE));
  });

  it("classifies known symmetric arrangements", () => {
    const diagonal = createGrid(3, [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
    expect(rotationOrbit(diagonal)).toHaveLength(2);
    expect(dihedralOrbit(diagonal)).toHaveLength(2);
    expect(gridsEqual(diagonal, rotate180(diagonal))).toBe(true);
    expect(gridsEqual(diagonal, reflectMainDiagonal(diagonal))).toBe(true);

    const topPair = createGrid(3, [
      [1, 0, 1],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    expect(rotationOrbit(topPair)).toHaveLength(4);
    expect(dihedralOrbit(topPair)).toHaveLength(4);
    expect(gridsEqual(topPair, reflectLeftRight(topPair))).toBe(true);
  });
});

describe("exhaustive 3x3 classification", () => {
  it("validates exact IDs, orbit membership, and canonical stability for all 512 states", () => {
    const rotationIds = new Set<string>();
    const dihedralIds = new Set<string>();

    for (const grid of allGrids(3)) {
      const id = exactId(grid);
      expect(id).toMatch(/^3x3:\d+$/);
      expect(Number(id.split(":")[1])).toBeGreaterThanOrEqual(0);
      expect(Number(id.split(":")[1])).toBeLessThanOrEqual(511);

      const rotationId = canonicalRotationId(grid);
      const dihedralId = canonicalDihedralId(grid);
      rotationIds.add(rotationId);
      dihedralIds.add(dihedralId);

      expect(canonicalRotationId(rotate90(grid))).toBe(rotationId);
      expect(canonicalRotationId(rotate180(grid))).toBe(rotationId);
      expect(canonicalRotationId(rotate270(grid))).toBe(rotationId);

      const rotations = rotationOrbit(grid);
      const dihedrals = dihedralOrbit(grid);
      expect(new Set(rotations.map(exactId)).size).toBe(rotations.length);
      expect(new Set(dihedrals.map(exactId)).size).toBe(dihedrals.length);

      for (const member of [...rotations, ...dihedrals]) {
        expect(member.size).toBe(3);
        expect(exactId(member)).toMatch(/^3x3:\d+$/);
      }

      for (const transform of SQUARE_SYMMETRY_TRANSFORMS) {
        const image = transform(grid);
        expect(image.size).toBe(3);
        expect(canonicalDihedralId(image)).toBe(dihedralId);
      }
    }

    expect(allGrids(3)).toHaveLength(512);
    expect(new Set(allGrids(3).map(exactId)).size).toBe(512);
    expect(rotationIds.size).toBe(140);
    expect(dihedralIds.size).toBe(102);
  });
});

describe("direct transform relations", () => {
  it("names all seven non-identity transforms that map A to B", () => {
    expect(transformRelationsBetween(SAMPLE, rotate90(SAMPLE))).toEqual(["rotate90"]);
    expect(transformRelationsBetween(SAMPLE, rotate180(SAMPLE))).toEqual(["rotate180"]);
    expect(transformRelationsBetween(SAMPLE, rotate270(SAMPLE))).toEqual(["rotate270"]);
    expect(transformRelationsBetween(SAMPLE, reflectLeftRight(SAMPLE))).toEqual(["reflectLeftRight"]);
    expect(transformRelationsBetween(SAMPLE, reflectTopBottom(SAMPLE))).toEqual(["reflectTopBottom"]);
    expect(transformRelationsBetween(SAMPLE, reflectMainDiagonal(SAMPLE))).toEqual([
      "reflectMainDiagonal",
    ]);
    expect(transformRelationsBetween(SAMPLE, reflectAntiDiagonal(SAMPLE))).toEqual([
      "reflectAntiDiagonal",
    ]);
  });

  it("keeps one card per exact result and retains every applicable label", () => {
    const plus = createGrid(3, [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ]);
    const plusLinks = transformLinksFrom(plus);
    expect(plusLinks).toHaveLength(1);
    expect(plusLinks[0].labels).toEqual([...DIRECT_TRANSFORM_IDS]);
    expect(gridsEqual(plusLinks[0].grid, plus)).toBe(true);

    const sampleLinks = transformLinksFrom(SAMPLE);
    expect(sampleLinks).toHaveLength(7);
    expect(new Set(sampleLinks.map((link) => exactId(link.grid))).size).toBe(7);
    expect(sampleLinks.every((link) => link.labels.length === 1)).toBe(true);
    expect(sampleLinks.flatMap((link) => link.labels).sort()).toEqual([...DIRECT_TRANSFORM_IDS].sort());

    const topPair = createGrid(3, [
      [1, 0, 1],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    const topLinks = transformLinksFrom(topPair);
    expect(new Set(topLinks.map((link) => exactId(link.grid))).size).toBe(topLinks.length);
    const self = topLinks.find((link) => gridsEqual(link.grid, topPair));
    expect(self?.labels).toContain("reflectLeftRight");
    expect(transformRelationsBetween(topPair, topPair)).toEqual(self?.labels);
  });
});
