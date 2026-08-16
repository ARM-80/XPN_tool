import { type Classification, classify } from "./classify";
import { type Grid, exactId, gridsEqual } from "./grid";
import {
  canonicalDihedralId,
  canonicalRotationId,
  dihedralOrbit,
  rotationOrbit,
} from "./transforms";

export type ClassMode = "exact" | "rotation" | "dihedral";

function asClassification(value: Grid | Classification): Classification {
  return "cells" in value ? classify(value) : value;
}

export function sameExact(a: Grid, b: Grid): boolean {
  return gridsEqual(a, b);
}

export function sameRotationClass(a: Grid | Classification, b: Grid | Classification): boolean {
  const left = asClassification(a);
  const right = asClassification(b);
  return left.size === right.size && left.rotationClassId === right.rotationClassId;
}

export function sameDihedralClass(a: Grid | Classification, b: Grid | Classification): boolean {
  const left = asClassification(a);
  const right = asClassification(b);
  return left.size === right.size && left.dihedralClassId === right.dihedralClassId;
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

export type ClassRelationId =
  | "sameOccupancy"
  | "sameConnectivity"
  | "sameComponentCount"
  | "sameCenterState"
  | "sameCornerOccupiedCount"
  | "sameEdgeOccupiedCount"
  | "sameRotationalSymmetryOrder"
  | "sameReflectionSymmetry"
  | "sameRotationOrbitSize"
  | "sameDihedralOrbitSize"
  | "sameRotationClass"
  | "sameDihedralClass";

export type RelationMatchMode = "all" | "any";

export interface RelationQuery {
  relations: readonly ClassRelationId[];
  match: RelationMatchMode;
}

export const CLASS_RELATION_IDS: readonly ClassRelationId[] = [
  "sameOccupancy",
  "sameConnectivity",
  "sameComponentCount",
  "sameCenterState",
  "sameCornerOccupiedCount",
  "sameEdgeOccupiedCount",
  "sameRotationalSymmetryOrder",
  "sameReflectionSymmetry",
  "sameRotationOrbitSize",
  "sameDihedralOrbitSize",
  "sameRotationClass",
  "sameDihedralClass",
];

export const CLASS_RELATION_LABELS: Record<ClassRelationId, string> = {
  sameOccupancy: "Occupancy",
  sameConnectivity: "Connectivity",
  sameComponentCount: "Components",
  sameCenterState: "Center",
  sameCornerOccupiedCount: "Corner count",
  sameEdgeOccupiedCount: "Edge count",
  sameRotationalSymmetryOrder: "Rotational symmetry",
  sameReflectionSymmetry: "Reflection symmetry",
  sameRotationOrbitSize: "Rotation orbit size",
  sameDihedralOrbitSize: "Dihedral orbit size",
  sameRotationClass: "Rotation class",
  sameDihedralClass: "Rotation + Reflection class",
};

function sameSize(a: Classification, b: Classification): boolean {
  return a.size === b.size;
}

export function sameOccupancy(a: Grid | Classification, b: Grid | Classification): boolean {
  const left = asClassification(a);
  const right = asClassification(b);
  return sameSize(left, right) && left.occupancy === right.occupancy;
}

export function sameConnectivity(a: Grid | Classification, b: Grid | Classification): boolean {
  const left = asClassification(a);
  const right = asClassification(b);
  return sameSize(left, right) && left.connected === right.connected;
}

export function sameComponentCount(a: Grid | Classification, b: Grid | Classification): boolean {
  const left = asClassification(a);
  const right = asClassification(b);
  return sameSize(left, right) && left.components === right.components;
}

export function sameCenterState(a: Grid | Classification, b: Grid | Classification): boolean {
  const left = asClassification(a);
  const right = asClassification(b);
  return sameSize(left, right) && left.centerOccupied === right.centerOccupied;
}

export function sameCornerOccupiedCount(
  a: Grid | Classification,
  b: Grid | Classification,
): boolean {
  const left = asClassification(a);
  const right = asClassification(b);
  return sameSize(left, right) && left.cornerOccupiedCount === right.cornerOccupiedCount;
}

export function sameEdgeOccupiedCount(a: Grid | Classification, b: Grid | Classification): boolean {
  const left = asClassification(a);
  const right = asClassification(b);
  return sameSize(left, right) && left.edgeOccupiedCount === right.edgeOccupiedCount;
}

export function sameRotationalSymmetryOrder(
  a: Grid | Classification,
  b: Grid | Classification,
): boolean {
  const left = asClassification(a);
  const right = asClassification(b);
  return sameSize(left, right) && left.rotationalSymmetryOrder === right.rotationalSymmetryOrder;
}

export function sameReflectionSymmetry(
  a: Grid | Classification,
  b: Grid | Classification,
): boolean {
  const left = asClassification(a);
  const right = asClassification(b);
  return sameSize(left, right) && left.reflectionSymmetry === right.reflectionSymmetry;
}

export function sameRotationOrbitSize(a: Grid | Classification, b: Grid | Classification): boolean {
  const left = asClassification(a);
  const right = asClassification(b);
  return sameSize(left, right) && left.rotationOrbitSize === right.rotationOrbitSize;
}

export function sameDihedralOrbitSize(a: Grid | Classification, b: Grid | Classification): boolean {
  const left = asClassification(a);
  const right = asClassification(b);
  return sameSize(left, right) && left.dihedralOrbitSize === right.dihedralOrbitSize;
}

const CLASS_RELATION_PREDICATES: Record<
  ClassRelationId,
  (a: Grid | Classification, b: Grid | Classification) => boolean
> = {
  sameOccupancy,
  sameConnectivity,
  sameComponentCount,
  sameCenterState,
  sameCornerOccupiedCount,
  sameEdgeOccupiedCount,
  sameRotationalSymmetryOrder,
  sameReflectionSymmetry,
  sameRotationOrbitSize,
  sameDihedralOrbitSize,
  sameRotationClass,
  sameDihedralClass,
};

export function classificationRelationsBetween(
  a: Grid | Classification,
  b: Grid | Classification,
): ClassRelationId[] {
  return CLASS_RELATION_IDS.filter((id) => CLASS_RELATION_PREDICATES[id](a, b));
}

export function emptyRelationQuery(): RelationQuery {
  return { relations: [], match: "all" };
}

export function matchesAnchorRelations(
  anchor: Grid | Classification,
  candidate: Grid | Classification,
  query: RelationQuery,
): boolean {
  if (query.relations.length === 0) {
    return true;
  }

  const shared = new Set(classificationRelationsBetween(anchor, candidate));
  if (query.match === "any") {
    return query.relations.some((id) => shared.has(id));
  }
  return query.relations.every((id) => shared.has(id));
}

export function satisfiedActiveRelations(
  anchor: Grid | Classification,
  candidate: Grid | Classification,
  query: RelationQuery,
): ClassRelationId[] {
  if (query.relations.length === 0) {
    return [];
  }
  const shared = new Set(classificationRelationsBetween(anchor, candidate));
  return query.relations.filter((id) => shared.has(id));
}

export function toggleRelation(
  relations: readonly ClassRelationId[],
  id: ClassRelationId,
): ClassRelationId[] {
  return relations.includes(id) ? relations.filter((item) => item !== id) : [...relations, id];
}
