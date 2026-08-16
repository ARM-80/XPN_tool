import { describe, expect, it } from "vitest";
import { classify } from "./classify";
import {
  browseUniverse,
  classifyUniverse,
  collapseClasses,
  emptyFilters,
} from "./filters";
import { createEmptyGrid, createGrid, exactId } from "./grid";
import {
  classificationRelationsBetween,
  classId,
  classMembers,
  emptyRelationQuery,
  matchesAnchorRelations,
  sameCenterState,
  sameClass,
  sameComponentCount,
  sameConnectivity,
  sameCornerOccupiedCount,
  sameDihedralClass,
  sameDihedralOrbitSize,
  sameEdgeOccupiedCount,
  sameExact,
  sameOccupancy,
  sameReflectionSymmetry,
  sameRotationClass,
  sameRotationalSymmetryOrder,
  sameRotationOrbitSize,
  satisfiedActiveRelations,
} from "./relationships";
import { rotate90 } from "./transforms";

const A = createGrid(3, [
  [1, 1, 0],
  [0, 0, 0],
  [0, 0, 1],
]);

const plus = createGrid(3, [
  [0, 1, 0],
  [1, 1, 1],
  [0, 1, 0],
]);

const diagonal = createGrid(3, [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]);

const topPair = createGrid(3, [
  [1, 0, 1],
  [0, 0, 0],
  [0, 0, 0],
]);

const empty3 = createEmptyGrid(3);
const empty2 = createEmptyGrid(2);

describe("class relationships", () => {
  it("distinguishes exact, rotation, and dihedral sameness", () => {
    const rotated = rotate90(A);

    expect(sameExact(A, rotated)).toBe(false);
    expect(sameRotationClass(A, rotated)).toBe(true);
    expect(sameDihedralClass(A, rotated)).toBe(true);
    expect(sameClass(A, rotated, "exact")).toBe(false);
    expect(sameClass(A, rotated, "rotation")).toBe(true);
    expect(sameClass(A, rotated, "dihedral")).toBe(true);
  });

  it("lists the members of the selected class", () => {
    expect(classMembers(A, "exact")).toHaveLength(1);
    expect(exactId(classMembers(A, "exact")[0])).toBe(exactId(A));
    expect(classMembers(A, "rotation")).toHaveLength(4);
    expect(classMembers(A, "dihedral")).toHaveLength(8);
    expect(classId(A, "exact")).toBe(exactId(A));
    expect(classId(A, "rotation")).toBe(classId(rotate90(A), "rotation"));
  });
});

describe("shared classification predicates", () => {
  it("matches occupancy only for same-sized grids", () => {
    expect(sameOccupancy(plus, plus)).toBe(true);
    expect(sameOccupancy(plus, A)).toBe(false);
    expect(sameOccupancy(empty3, empty2)).toBe(false);
  });

  it("matches empty connectivity only to empty connectivity", () => {
    expect(sameConnectivity(empty3, createEmptyGrid(3))).toBe(true);
    expect(sameConnectivity(empty3, plus)).toBe(false);
    expect(sameConnectivity(plus, plus)).toBe(true);
    expect(sameConnectivity(plus, diagonal)).toBe(false);
    expect(sameConnectivity(empty3, empty2)).toBe(false);
  });

  it("matches component count", () => {
    expect(sameComponentCount(plus, plus)).toBe(true);
    expect(sameComponentCount(plus, diagonal)).toBe(false);
    expect(sameComponentCount(empty3, empty3)).toBe(true);
  });

  it("matches center N/A only to N/A", () => {
    const two = createGrid(2, [
      [1, 0],
      [0, 1],
    ]);
    expect(sameCenterState(two, createEmptyGrid(2))).toBe(true);
    expect(sameCenterState(plus, topPair)).toBe(false);
    expect(sameCenterState(plus, diagonal)).toBe(true);
    expect(sameCenterState(plus, two)).toBe(false);
  });

  it("matches corner and edge occupied counts", () => {
    expect(sameCornerOccupiedCount(topPair, topPair)).toBe(true);
    expect(sameCornerOccupiedCount(topPair, plus)).toBe(false);
    expect(sameEdgeOccupiedCount(plus, plus)).toBe(true);
    expect(sameEdgeOccupiedCount(plus, topPair)).toBe(false);
  });

  it("matches symmetry and orbit-size properties", () => {
    expect(sameRotationalSymmetryOrder(plus, createEmptyGrid(3))).toBe(true);
    expect(sameRotationalSymmetryOrder(plus, A)).toBe(false);
    expect(sameReflectionSymmetry(plus, topPair)).toBe(true);
    expect(sameReflectionSymmetry(plus, A)).toBe(false);
    expect(sameRotationOrbitSize(A, topPair)).toBe(true);
    expect(sameRotationOrbitSize(A, plus)).toBe(false);
    expect(sameDihedralOrbitSize(A, A)).toBe(true);
    expect(sameDihedralOrbitSize(A, plus)).toBe(false);
  });

  it("matches rotation and dihedral classes without treating exact identity as a class relation", () => {
    const rotated = rotate90(A);
    expect(sameRotationClass(A, rotated)).toBe(true);
    expect(sameDihedralClass(A, rotated)).toBe(true);
    expect(sameRotationClass(A, plus)).toBe(false);
    expect(sameDihedralClass(A, plus)).toBe(false);

    const shared = classificationRelationsBetween(A, rotated);
    expect(shared).toContain("sameRotationClass");
    expect(shared).toContain("sameDihedralClass");
    expect(shared).not.toContain("sameExact");
    expect(classificationRelationsBetween(A, A)).not.toContain("sameExact");
  });
});

describe("anchored relation query", () => {
  const plusInfo = classify(plus);
  const diagonalInfo = classify(diagonal);
  const topPairInfo = classify(topPair);

  it("imposes no restriction when no relations are active", () => {
    expect(matchesAnchorRelations(plusInfo, diagonalInfo, emptyRelationQuery())).toBe(true);
  });

  it("requires every active relation in ALL mode", () => {
    const query = {
      relations: ["sameOccupancy", "sameComponentCount"],
      match: "all",
    } as const;

    expect(matchesAnchorRelations(plusInfo, plusInfo, query)).toBe(true);
    expect(matchesAnchorRelations(plusInfo, classify(A), query)).toBe(false);
    expect(
      matchesAnchorRelations(
        plusInfo,
        classify(
          createGrid(3, [
            [1, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
          ]),
        ),
        query,
      ),
    ).toBe(true);
  });

  it("accepts any active relation in ANY mode", () => {
    const query = {
      relations: ["sameOccupancy", "sameComponentCount"],
      match: "any",
    } as const;
    const fiveDisconnected = classify(
      createGrid(3, [
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
      ]),
    );
    const threeRow = classify(
      createGrid(3, [
        [1, 1, 1],
        [0, 0, 0],
        [0, 0, 0],
      ]),
    );

    expect(matchesAnchorRelations(plusInfo, fiveDisconnected, query)).toBe(true);
    expect(matchesAnchorRelations(plusInfo, threeRow, query)).toBe(true);
    expect(matchesAnchorRelations(plusInfo, diagonalInfo, query)).toBe(false);
    expect(matchesAnchorRelations(plusInfo, topPairInfo, query)).toBe(false);
  });

  it("lists only the active relations a candidate satisfies", () => {
    const query = {
      relations: ["sameOccupancy", "sameRotationClass"],
      match: "any",
    } as const;
    const fiveDisconnected = classify(
      createGrid(3, [
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
      ]),
    );
    expect(satisfiedActiveRelations(plusInfo, fiveDisconnected, query)).toEqual(["sameOccupancy"]);
    expect(satisfiedActiveRelations(plusInfo, plusInfo, query)).toEqual([
      "sameOccupancy",
      "sameRotationClass",
    ]);
  });

  it("combines global filters with anchored relations", () => {
    const universe = classifyUniverse(3);
    const occupancyOne = { ...emptyFilters(), occupancy: [1] };
    const sameCenter = {
      relations: ["sameCenterState"] as const,
      match: "all" as const,
    };

    const centerEmpty = browseUniverse(
      universe,
      occupancyOne,
      "exact",
      sameCenter,
      classify(topPair),
    );
    expect(centerEmpty.matchingCount).toBe(8);
    expect(centerEmpty.matching.every((item) => item.info.centerOccupied === false)).toBe(true);

    const centerOccupied = browseUniverse(
      universe,
      occupancyOne,
      "exact",
      sameCenter,
      classify(plus),
    );
    expect(centerOccupied.matchingCount).toBe(1);
    expect(centerOccupied.matching[0].info.centerOccupied).toBe(true);
  });

  it("does not change the 512 / 140 / 102 invariants when relations are inactive", () => {
    const universe = classifyUniverse(3);
    const all = browseUniverse(universe, emptyFilters(), "exact", emptyRelationQuery(), plusInfo);
    expect(all.matchingCount).toBe(512);
    expect(collapseClasses(all.matching, "rotation")).toHaveLength(140);
    expect(collapseClasses(all.matching, "dihedral")).toHaveLength(102);
  });
});
