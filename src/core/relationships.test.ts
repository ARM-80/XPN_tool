import { describe, expect, it } from "vitest";
import { createGrid, exactId } from "./grid";
import { rotate90 } from "./transforms";
import {
  classId,
  classMembers,
  sameClass,
  sameDihedralClass,
  sameExact,
  sameRotationClass,
} from "./relationships";

const A = createGrid(3, [
  [1, 1, 0],
  [0, 0, 0],
  [0, 0, 1],
]);

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
