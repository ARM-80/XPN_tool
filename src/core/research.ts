import { classify } from "./classify";
import {
  type Grid,
  type GridSize,
  allGrids,
  exactId,
  gridToMask,
  isExactId,
  parseExactId,
} from "./grid";
import { type ClassMode, classId } from "./relationships";
import { canonicalDihedralId, canonicalRotationId } from "./transforms";

export type ResearchTargetType = ClassMode;

export const RESEARCH_TARGET_TYPES: readonly ResearchTargetType[] = [
  "exact",
  "rotation",
  "dihedral",
];

export const RESEARCH_STORE_VERSION = 1;
export const RESEARCH_STORAGE_KEY = "xpn-tool.research.v1";

export interface ResearchClassification {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface ClassificationAssignment {
  classificationId: string;
  targetType: ResearchTargetType;
  targetId: string;
}

export interface ResearchNote {
  targetType: ResearchTargetType;
  targetId: string;
  text: string;
}

export interface ReviewState {
  targetType: ResearchTargetType;
  targetId: string;
  reviewed: boolean;
}

export interface ResearchStore {
  version: typeof RESEARCH_STORE_VERSION;
  classifications: ResearchClassification[];
  assignments: ClassificationAssignment[];
  notes: ResearchNote[];
  reviews: ReviewState[];
}

export interface AppliedResearchClassification {
  classification: ResearchClassification;
  targetType: ResearchTargetType;
  targetId: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const SCOPE_LABELS: Record<ResearchTargetType, string> = {
  exact: "EXACT",
  rotation: "ROT",
  dihedral: "R+R",
};

export const SCOPE_EXPLANATION =
  "EXACT = this orientation only. ROT = all rotations. R+R = rotations and reflections.";

export function emptyResearchStore(): ResearchStore {
  return {
    version: RESEARCH_STORE_VERSION,
    classifications: [],
    assignments: [],
    notes: [],
    reviews: [],
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneStore(store: ResearchStore): ResearchStore {
  return {
    version: RESEARCH_STORE_VERSION,
    classifications: store.classifications.map((item) => ({ ...item })),
    assignments: store.assignments.map((item) => ({ ...item })),
    notes: store.notes.map((item) => ({ ...item })),
    reviews: store.reviews.map((item) => ({ ...item })),
  };
}

export function isResearchTargetType(value: unknown): value is ResearchTargetType {
  return value === "exact" || value === "rotation" || value === "dihedral";
}

export function targetIdFor(grid: Grid, targetType: ResearchTargetType): string {
  return classId(grid, targetType);
}

export function createClassification(
  name: string,
  description = "",
  createdAt = nowIso(),
  id = newId(),
): ResearchClassification {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Classification name is required");
  }
  const next: ResearchClassification = { id, name: trimmed, createdAt };
  const trimmedDescription = description.trim();
  if (trimmedDescription) {
    next.description = trimmedDescription;
  }
  return next;
}

export function addClassification(
  store: ResearchStore,
  classification: ResearchClassification,
): ResearchStore {
  const next = cloneStore(store);
  next.classifications.push(classification);
  return next;
}

export function updateClassification(
  store: ResearchStore,
  id: string,
  patch: { name?: string; description?: string },
): ResearchStore {
  const next = cloneStore(store);
  const item = next.classifications.find((classification) => classification.id === id);
  if (!item) {
    throw new Error(`Unknown classification: ${id}`);
  }
  if (patch.name !== undefined) {
    const trimmed = patch.name.trim();
    if (!trimmed) {
      throw new Error("Classification name is required");
    }
    item.name = trimmed;
  }
  if (patch.description !== undefined) {
    const trimmed = patch.description.trim();
    if (trimmed) {
      item.description = trimmed;
    } else {
      delete item.description;
    }
  }
  return next;
}

export function deleteClassification(store: ResearchStore, id: string): ResearchStore {
  const next = cloneStore(store);
  next.classifications = next.classifications.filter((item) => item.id !== id);
  next.assignments = next.assignments.filter((item) => item.classificationId !== id);
  return next;
}

function sameAssignment(a: ClassificationAssignment, b: ClassificationAssignment): boolean {
  return (
    a.classificationId === b.classificationId &&
    a.targetType === b.targetType &&
    a.targetId === b.targetId
  );
}

export function isAssigned(
  store: ResearchStore,
  classificationId: string,
  targetType: ResearchTargetType,
  targetId: string,
): boolean {
  return store.assignments.some((item) =>
    sameAssignment(item, { classificationId, targetType, targetId }),
  );
}

export function assignClassification(
  store: ResearchStore,
  classificationId: string,
  targetType: ResearchTargetType,
  targetId: string,
): ResearchStore {
  if (!store.classifications.some((item) => item.id === classificationId)) {
    throw new Error(`Unknown classification: ${classificationId}`);
  }
  if (!isExactId(targetId)) {
    throw new Error(`Invalid target ID: ${targetId}`);
  }
  if (isAssigned(store, classificationId, targetType, targetId)) {
    return store;
  }
  const next = cloneStore(store);
  next.assignments.push({ classificationId, targetType, targetId });
  return next;
}

export function unassignClassification(
  store: ResearchStore,
  classificationId: string,
  targetType: ResearchTargetType,
  targetId: string,
): ResearchStore {
  const next = cloneStore(store);
  next.assignments = next.assignments.filter(
    (item) => !sameAssignment(item, { classificationId, targetType, targetId }),
  );
  return next;
}

export function toggleAssignment(
  store: ResearchStore,
  classificationId: string,
  targetType: ResearchTargetType,
  targetId: string,
): ResearchStore {
  return isAssigned(store, classificationId, targetType, targetId)
    ? unassignClassification(store, classificationId, targetType, targetId)
    : assignClassification(store, classificationId, targetType, targetId);
}

export function applicableClassifications(
  store: ResearchStore,
  grid: Grid,
): AppliedResearchClassification[] {
  const ids: Record<ResearchTargetType, string> = {
    exact: exactId(grid),
    rotation: canonicalRotationId(grid),
    dihedral: canonicalDihedralId(grid),
  };

  const applied: AppliedResearchClassification[] = [];
  for (const assignment of store.assignments) {
    if (assignment.targetId !== ids[assignment.targetType]) {
      continue;
    }
    const classification = store.classifications.find(
      (item) => item.id === assignment.classificationId,
    );
    if (!classification) {
      continue;
    }
    applied.push({
      classification,
      targetType: assignment.targetType,
      targetId: assignment.targetId,
    });
  }
  return applied;
}

export function setNote(
  store: ResearchStore,
  targetType: ResearchTargetType,
  targetId: string,
  text: string,
): ResearchStore {
  const next = cloneStore(store);
  next.notes = next.notes.filter(
    (item) => !(item.targetType === targetType && item.targetId === targetId),
  );
  if (text.length > 0) {
    next.notes.push({ targetType, targetId, text });
  }
  return next;
}

export function getNote(
  store: ResearchStore,
  targetType: ResearchTargetType,
  targetId: string,
): string {
  return (
    store.notes.find((item) => item.targetType === targetType && item.targetId === targetId)
      ?.text ?? ""
  );
}

export function setReviewed(
  store: ResearchStore,
  targetType: ResearchTargetType,
  targetId: string,
  reviewed: boolean,
): ResearchStore {
  const next = cloneStore(store);
  next.reviews = next.reviews.filter(
    (item) => !(item.targetType === targetType && item.targetId === targetId),
  );
  if (reviewed) {
    next.reviews.push({ targetType, targetId, reviewed: true });
  }
  return next;
}

export function isReviewed(
  store: ResearchStore,
  targetType: ResearchTargetType,
  targetId: string,
): boolean {
  return store.reviews.some(
    (item) => item.targetType === targetType && item.targetId === targetId && item.reviewed,
  );
}

export function reviewSequence(size: GridSize, basis: ResearchTargetType): Grid[] {
  if (basis === "exact") {
    return allGrids(size);
  }

  const seen = new Set<string>();
  const representatives: Grid[] = [];
  for (const grid of allGrids(size)) {
    const id = classId(grid, basis);
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    representatives.push(parseExactId(id));
  }

  return representatives.sort((a, b) => gridToMask(a) - gridToMask(b));
}

export function reviewProgress(
  store: ResearchStore,
  size: GridSize,
  basis: ResearchTargetType,
): { reviewed: number; total: number } {
  const sequence = reviewSequence(size, basis);
  const reviewed = sequence.filter((grid) => isReviewed(store, basis, targetIdFor(grid, basis))).length;
  return { reviewed, total: sequence.length };
}

export function nextUnreviewedIndex(
  store: ResearchStore,
  sequence: Grid[],
  basis: ResearchTargetType,
  fromIndex: number,
): number | null {
  if (sequence.length === 0) {
    return null;
  }
  for (let step = 1; step <= sequence.length; step += 1) {
    const index = (fromIndex + step) % sequence.length;
    if (!isReviewed(store, basis, targetIdFor(sequence[index], basis))) {
      return index;
    }
  }
  return null;
}

export function assignmentCount(store: ResearchStore, classificationId: string): number {
  return store.assignments.filter((item) => item.classificationId === classificationId).length;
}

export function assignmentsFor(
  store: ResearchStore,
  classificationId: string,
): ClassificationAssignment[] {
  return store.assignments.filter((item) => item.classificationId === classificationId);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseClassification(value: unknown): ResearchClassification {
  if (!isRecord(value) || typeof value.id !== "string" || value.id.length === 0) {
    throw new Error("Invalid classification");
  }
  if (typeof value.name !== "string" || value.name.trim().length === 0) {
    throw new Error("Invalid classification name");
  }
  if (typeof value.createdAt !== "string" || Number.isNaN(Date.parse(value.createdAt))) {
    throw new Error("Invalid classification timestamp");
  }
  const item: ResearchClassification = {
    id: value.id,
    name: value.name.trim(),
    createdAt: value.createdAt,
  };
  if (value.description !== undefined) {
    if (typeof value.description !== "string") {
      throw new Error("Invalid classification description");
    }
    if (value.description.trim()) {
      item.description = value.description.trim();
    }
  }
  return item;
}

function parseAssignment(
  value: unknown,
  classificationIds: Set<string>,
): ClassificationAssignment {
  if (!isRecord(value)) {
    throw new Error("Invalid assignment");
  }
  if (typeof value.classificationId !== "string" || !classificationIds.has(value.classificationId)) {
    throw new Error("Assignment references an unknown classification");
  }
  if (!isResearchTargetType(value.targetType)) {
    throw new Error("Invalid assignment target type");
  }
  if (typeof value.targetId !== "string" || !isExactId(value.targetId)) {
    throw new Error("Invalid assignment target ID");
  }
  return {
    classificationId: value.classificationId,
    targetType: value.targetType,
    targetId: value.targetId,
  };
}

function parseNote(value: unknown): ResearchNote {
  if (!isRecord(value) || !isResearchTargetType(value.targetType)) {
    throw new Error("Invalid note");
  }
  if (typeof value.targetId !== "string" || !isExactId(value.targetId)) {
    throw new Error("Invalid note target ID");
  }
  if (typeof value.text !== "string") {
    throw new Error("Invalid note text");
  }
  return {
    targetType: value.targetType,
    targetId: value.targetId,
    text: value.text,
  };
}

function parseReview(value: unknown): ReviewState {
  if (!isRecord(value) || !isResearchTargetType(value.targetType)) {
    throw new Error("Invalid review state");
  }
  if (typeof value.targetId !== "string" || !isExactId(value.targetId)) {
    throw new Error("Invalid review target ID");
  }
  if (typeof value.reviewed !== "boolean") {
    throw new Error("Invalid review flag");
  }
  return {
    targetType: value.targetType,
    targetId: value.targetId,
    reviewed: value.reviewed,
  };
}

export function parseResearchStore(data: unknown): ResearchStore {
  if (!isRecord(data)) {
    throw new Error("Research data must be an object");
  }
  if (data.version !== RESEARCH_STORE_VERSION) {
    throw new Error("Unsupported research data version");
  }
  if (
    !Array.isArray(data.classifications) ||
    !Array.isArray(data.assignments) ||
    !Array.isArray(data.notes) ||
    !Array.isArray(data.reviews)
  ) {
    throw new Error("Research data is missing required collections");
  }

  const classifications = data.classifications.map(parseClassification);
  const ids = new Set(classifications.map((item) => item.id));
  if (ids.size !== classifications.length) {
    throw new Error("Duplicate classification IDs");
  }

  return {
    version: RESEARCH_STORE_VERSION,
    classifications,
    assignments: data.assignments.map((item) => parseAssignment(item, ids)),
    notes: data.notes.map(parseNote),
    reviews: data.reviews.map(parseReview),
  };
}

export function serializeResearchStore(store: ResearchStore): string {
  return `${JSON.stringify(parseResearchStore(store), null, 2)}\n`;
}

export function deserializeResearchStore(json: string): ResearchStore {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("Research data is not valid JSON");
  }
  return parseResearchStore(data);
}

export function loadResearchStore(storage?: StorageLike | null): ResearchStore {
  const source = storage ?? (typeof localStorage === "undefined" ? null : localStorage);
  if (!source) {
    return emptyResearchStore();
  }
  const raw = source.getItem(RESEARCH_STORAGE_KEY);
  if (!raw) {
    return emptyResearchStore();
  }
  try {
    return deserializeResearchStore(raw);
  } catch {
    return emptyResearchStore();
  }
}

export function saveResearchStore(store: ResearchStore, storage?: StorageLike | null): void {
  const target = storage ?? (typeof localStorage === "undefined" ? null : localStorage);
  if (!target) {
    return;
  }
  target.setItem(RESEARCH_STORAGE_KEY, serializeResearchStore(store));
}

export function arrangementIds(grid: Grid): Record<ResearchTargetType, string> {
  const info = classify(grid);
  return {
    exact: info.exactId,
    rotation: info.rotationClassId,
    dihedral: info.dihedralClassId,
  };
}
