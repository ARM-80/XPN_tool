import { describe, expect, it } from "vitest";
import { areSnapped, connectedIds, mergeOccupancies, snapToRects, splitOccupancy } from "./snap";

const box = { x: 100, y: 80, w: 200, h: 160 };

describe("snapToRects", () => {
  it("snaps a palette to the right edge of another", () => {
    expect(snapToRects({ x: 312, y: 90, w: 200, h: 160 }, [box])).toEqual({ x: 300, y: 80 });
  });

  it("snaps a palette under another", () => {
    expect(snapToRects({ x: 110, y: 252, w: 200, h: 160 }, [box])).toEqual({ x: 100, y: 240 });
  });

  it("leaves a far palette unmoved", () => {
    expect(snapToRects({ x: 500, y: 400, w: 200, h: 160 }, [box])).toEqual({ x: 500, y: 400 });
  });
});

describe("areSnapped", () => {
  it("treats flush neighbors as snapped", () => {
    expect(areSnapped(box, { x: 300, y: 80, w: 200, h: 160 })).toBe(true);
    expect(areSnapped(box, { x: 100, y: 240, w: 200, h: 160 })).toBe(true);
  });

  it("ignores palettes that only share an alignment with a gap", () => {
    expect(areSnapped(box, { x: 340, y: 80, w: 200, h: 160 })).toBe(false);
  });
});

describe("connectedIds", () => {
  it("walks a chain of snapped palettes", () => {
    expect(
      connectedIds("1", [
        { id: "1", x: 0, y: 0, w: 100, h: 80 },
        { id: "2", x: 100, y: 0, w: 100, h: 80 },
        { id: "3", x: 100, y: 80, w: 100, h: 80 },
        { id: "9", x: 400, y: 0, w: 100, h: 80 },
      ]).sort(),
    ).toEqual(["1", "2", "3"]);
  });
});

describe("splitOccupancy", () => {
  it("pops a tab and keeps the remaining host", () => {
    expect(splitOccupancy([0, 1, 2], 1, 1)).toEqual({
      host: { occupancies: [0, 2], active: 0 },
      popped: 1,
    });
  });

  it("does not pop the last tab", () => {
    expect(splitOccupancy([4], 4, 4)).toBeNull();
  });
});

describe("mergeOccupancies", () => {
  it("appends new decks and skips duplicates", () => {
    expect(mergeOccupancies([3, 5], [5, 7])).toEqual([3, 5, 7]);
  });
});
