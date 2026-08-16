import { describe, expect, it } from "vitest";
import { classify } from "./classify";
import {
  browseUniverse,
  classifyUniverse,
  collapseClasses,
  emptyFilters,
  filterUniverse,
  matchesFilters,
} from "./filters";
import { createEmptyGrid, createGrid, exactId } from "./grid";
import { canonicalDihedralId, canonicalRotationId } from "./transforms";

const empty3 = classify(createEmptyGrid(3));
const plus = classify(
  createGrid(3, [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ]),
);
const diagonal = classify(
  createGrid(3, [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]),
);
const topPair = classify(
  createGrid(3, [
    [1, 0, 1],
    [0, 0, 0],
    [0, 0, 0],
  ]),
);

describe("filter predicates", () => {
  it("treats an empty category as unconstrained", () => {
    expect(matchesFilters(plus, emptyFilters())).toBe(true);
    expect(matchesFilters(empty3, emptyFilters())).toBe(true);
  });

  it("ORs values inside one category", () => {
    expect(matchesFilters(plus, { ...emptyFilters(), occupancy: [4, 5] })).toBe(true);
    expect(matchesFilters(plus, { ...emptyFilters(), occupancy: [4] })).toBe(false);
  });

  it("ANDs active categories together", () => {
    const filters = {
      ...emptyFilters(),
      occupancy: [3, 4],
      connectivity: ["connected" as const],
      center: ["empty" as const],
    };

    expect(matchesFilters(plus, filters)).toBe(false);
    expect(matchesFilters(diagonal, filters)).toBe(false);
    expect(
      matchesFilters(
        classify(
          createGrid(3, [
            [1, 1, 1],
            [0, 0, 0],
            [0, 0, 0],
          ]),
        ),
        filters,
      ),
    ).toBe(true);
  });

  it("classifies empty connectivity as none/empty, not connected", () => {
    expect(matchesFilters(empty3, { ...emptyFilters(), connectivity: ["empty"] })).toBe(true);
    expect(matchesFilters(empty3, { ...emptyFilters(), connectivity: ["connected"] })).toBe(false);
    expect(matchesFilters(empty3, { ...emptyFilters(), connectivity: ["disconnected"] })).toBe(
      false,
    );
    expect(matchesFilters(plus, { ...emptyFilters(), connectivity: ["connected"] })).toBe(true);
    expect(matchesFilters(diagonal, { ...emptyFilters(), connectivity: ["disconnected"] })).toBe(
      true,
    );
  });

  it("matches center N/A only when there is no unique center", () => {
    const twoByTwo = classify(
      createGrid(2, [
        [1, 0],
        [0, 1],
      ]),
    );
    expect(matchesFilters(twoByTwo, { ...emptyFilters(), center: ["na"] })).toBe(true);
    expect(matchesFilters(plus, { ...emptyFilters(), center: ["na"] })).toBe(false);
    expect(matchesFilters(plus, { ...emptyFilters(), center: ["occupied"] })).toBe(true);
    expect(matchesFilters(topPair, { ...emptyFilters(), center: ["empty"] })).toBe(true);
  });
});

describe("class collapsing", () => {
  it("keeps raw arrangements in exact mode and collapses by canonical class IDs otherwise", () => {
    const universe = classifyUniverse(3);
    expect(universe).toHaveLength(512);

    const matching = filterUniverse(universe, emptyFilters());
    expect(matching).toHaveLength(512);
    expect(collapseClasses(matching, "exact")).toHaveLength(512);
    expect(collapseClasses(matching, "rotation")).toHaveLength(140);
    expect(collapseClasses(matching, "dihedral")).toHaveLength(102);
  });

  it("uses the canonical representative for a collapsed class", () => {
    const grid = createGrid(3, [
      [1, 1, 0],
      [0, 0, 0],
      [0, 0, 1],
    ]);
    const collapsed = collapseClasses([{ grid, info: classify(grid) }], "rotation");
    expect(collapsed).toHaveLength(1);
    expect(exactId(collapsed[0].grid)).toBe(canonicalRotationId(grid));
    expect(exactId(collapseClasses([{ grid, info: classify(grid) }], "dihedral")[0].grid)).toBe(
      canonicalDihedralId(grid),
    );
  });

  it("reports matching arrangements and displayed classes separately", () => {
    const occupancyOne = browseUniverse(
      classifyUniverse(3),
      { ...emptyFilters(), occupancy: [1] },
      "dihedral",
    );
    expect(occupancyOne.matchingCount).toBe(9);
    expect(occupancyOne.displayedCount).toBe(3);
    expect(browseUniverse(classifyUniverse(3), { ...emptyFilters(), occupancy: [1] }, "rotation").displayedCount).toBe(3);
  });
});

describe("enumeration by size", () => {
  it("reports exact, rotation, and dihedral counts for each supported size", () => {
    const one = browseUniverse(classifyUniverse(1), emptyFilters(), "dihedral");
    expect(one.matchingCount).toBe(2);
    expect(browseUniverse(classifyUniverse(1), emptyFilters(), "rotation").displayedCount).toBe(2);
    expect(one.displayedCount).toBe(2);

    const two = classifyUniverse(2);
    expect(two).toHaveLength(16);
    expect(collapseClasses(two, "rotation")).toHaveLength(6);
    expect(collapseClasses(two, "dihedral")).toHaveLength(6);

    const three = classifyUniverse(3);
    expect(three).toHaveLength(512);
    expect(collapseClasses(three, "rotation")).toHaveLength(140);
    expect(collapseClasses(three, "dihedral")).toHaveLength(102);
  });
});
