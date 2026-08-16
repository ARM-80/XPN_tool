import { type Grid, exactId, gridsEqual } from "./grid";
import {
  canonicalDihedralId,
  canonicalRotationId,
  dihedralOrbit,
  rotationOrbit,
} from "./transforms";

export type ClassMode = "exact" | "rotation" | "dihedral";

export function sameExact(a: Grid, b: Grid): boolean {
  return gridsEqual(a, b);
}

export function sameRotationClass(a: Grid, b: Grid): boolean {
  return a.size === b.size && canonicalRotationId(a) === canonicalRotationId(b);
}

export function sameDihedralClass(a: Grid, b: Grid): boolean {
  return a.size === b.size && canonicalDihedralId(a) === canonicalDihedralId(b);
}

export function classId(grid: Grid, mode: ClassMode): string {
  if (mode === "exact") {
    return exactId(grid);
  }
  if (mode === "rotation") {
    return canonicalRotationId(grid);
  }
  return canonicalDihedralId(grid);
}

export function classMembers(grid: Grid, mode: ClassMode): Grid[] {
  if (mode === "exact") {
    return [grid];
  }
  if (mode === "rotation") {
    return rotationOrbit(grid);
  }
  return dihedralOrbit(grid);
}

export function sameClass(a: Grid, b: Grid, mode: ClassMode): boolean {
  if (mode === "exact") {
    return sameExact(a, b);
  }
  if (mode === "rotation") {
    return sameRotationClass(a, b);
  }
  return sameDihedralClass(a, b);
}
