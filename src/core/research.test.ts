import { describe, expect, it } from "vitest";
import { classifyUniverse, collapseClasses } from "./filters";
import { createGrid, exactId } from "./grid";
import {
  addClassification,
  applicableClassifications,
  assignClassification,
  createClassification,
  deleteClassification,
  deserializeResearchStore,
  emptyResearchStore,
  getNote,
  isReviewed,
  loadResearchStore,
  parseResearchStore,
  reviewProgress,
  reviewSequence,
  saveResearchStore,
  serializeResearchStore,
  setNote,
  setReviewed,
  targetIdFor,
  unassignClassification,
  updateClassification,
} from "./research";
import { rotate90 } from "./transforms";

const L = createGrid(3, [
  [1, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
]);

const rotatedL = rotate90(L);
const other = createGrid(3, [
  [1, 1, 1],
  [0, 0, 0],
  [0, 0, 0],
]);

function storeWith(name = "L-form") {
  return addClassification(emptyResearchStore(), createClassification(name, "manual note", "2026-01-01T00:00:00.000Z", "c1"));
}

describe("researcher classifications", () => {
  it("creates, edits, and deletes classifications", () => {
    let store = storeWith();
    expect(store.classifications).toHaveLength(1);
    expect(store.classifications[0].name).toBe("L-form");

    store = updateClassification(store, "c1", { name: "Bent", description: "updated" });
    expect(store.classifications[0].name).toBe("Bent");
    expect(store.classifications[0].description).toBe("updated");

    store = assignClassification(store, "c1", "exact", exactId(L));
    store = deleteClassification(store, "c1");
    expect(store.classifications).toHaveLength(0);
    expect(store.assignments).toHaveLength(0);
  });

  it("assigns exact, rotation, and dihedral scopes independently", () => {
    let store = storeWith();
    store = assignClassification(store, "c1", "exact", exactId(L));
    store = assignClassification(store, "c1", "rotation", targetIdFor(L, "rotation"));
    store = assignClassification(store, "c1", "dihedral", targetIdFor(L, "dihedral"));
    expect(store.assignments).toHaveLength(3);

    const onExact = applicableClassifications(store, L);
    expect(onExact.map((item) => item.targetType).sort()).toEqual(["dihedral", "exact", "rotation"]);

    const onRotated = applicableClassifications(
      { ...store, assignments: store.assignments.filter((item) => item.targetType !== "exact") },
      rotatedL,
    );
    expect(onRotated.some((item) => item.targetType === "rotation")).toBe(true);
    expect(onRotated.some((item) => item.targetType === "dihedral")).toBe(true);
  });

  it("resolves applicable manual classifications for a raw arrangement", () => {
    let store = storeWith("Exact only");
    store = addClassification(store, createClassification("Rot label", "", "2026-01-02T00:00:00.000Z", "c2"));
    store = addClassification(store, createClassification("D4 label", "", "2026-01-03T00:00:00.000Z", "c3"));
    store = assignClassification(store, "c1", "exact", exactId(L));
    store = assignClassification(store, "c2", "rotation", targetIdFor(L, "rotation"));
    store = assignClassification(store, "c3", "dihedral", targetIdFor(L, "dihedral"));

    const onL = applicableClassifications(store, L).map((item) => item.classification.name);
    expect(onL).toEqual(["Exact only", "Rot label", "D4 label"]);

    const onRotated = applicableClassifications(store, rotatedL).map((item) => item.classification.name);
    expect(onRotated).toEqual(["Rot label", "D4 label"]);

    const onOther = applicableClassifications(store, other);
    expect(onOther).toHaveLength(0);

    store = unassignClassification(store, "c2", "rotation", targetIdFor(L, "rotation"));
    expect(applicableClassifications(store, rotatedL).map((item) => item.classification.name)).toEqual([
      "D4 label",
    ]);
  });
});

describe("notes and review state", () => {
  it("stores notes at exact, rotation, and dihedral scopes", () => {
    let store = emptyResearchStore();
    store = setNote(store, "exact", exactId(L), "exact note");
    store = setNote(store, "rotation", targetIdFor(L, "rotation"), "rotation note");
    store = setNote(store, "dihedral", targetIdFor(L, "dihedral"), "d4 note");

    expect(getNote(store, "exact", exactId(L))).toBe("exact note");
    expect(getNote(store, "rotation", targetIdFor(rotatedL, "rotation"))).toBe("rotation note");
    expect(getNote(store, "dihedral", targetIdFor(rotatedL, "dihedral"))).toBe("d4 note");
    expect(getNote(store, "exact", exactId(rotatedL))).toBe("");
  });

  it("keeps review state independent across scopes", () => {
    let store = emptyResearchStore();
    store = setReviewed(store, "dihedral", targetIdFor(L, "dihedral"), true);

    expect(isReviewed(store, "dihedral", targetIdFor(L, "dihedral"))).toBe(true);
    expect(isReviewed(store, "rotation", targetIdFor(L, "rotation"))).toBe(false);
    expect(isReviewed(store, "exact", exactId(L))).toBe(false);
    expect(isReviewed(store, "exact", exactId(rotatedL))).toBe(false);
  });
});

describe("review sequences", () => {
  it("is deterministic and uses canonical representatives", () => {
    const exact = reviewSequence(3, "exact");
    const rotation = reviewSequence(3, "rotation");
    const dihedral = reviewSequence(3, "dihedral");

    expect(exact).toHaveLength(512);
    expect(rotation).toHaveLength(140);
    expect(dihedral).toHaveLength(102);
    expect(exact.map(exactId)).toEqual([...exact.map(exactId)].sort((a, b) => {
      return Number(a.split(":")[1]) - Number(b.split(":")[1]);
    }));

    for (const grid of rotation) {
      expect(exactId(grid)).toBe(targetIdFor(grid, "rotation"));
    }
    for (const grid of dihedral) {
      expect(exactId(grid)).toBe(targetIdFor(grid, "dihedral"));
    }
  });

  it("reports review counts by size and basis", () => {
    expect(reviewProgress(emptyResearchStore(), 1, "exact")).toEqual({ reviewed: 0, total: 2 });
    expect(reviewProgress(emptyResearchStore(), 1, "rotation")).toEqual({ reviewed: 0, total: 2 });
    expect(reviewProgress(emptyResearchStore(), 1, "dihedral")).toEqual({ reviewed: 0, total: 2 });
    expect(reviewProgress(emptyResearchStore(), 2, "exact")).toEqual({ reviewed: 0, total: 16 });
    expect(reviewProgress(emptyResearchStore(), 2, "rotation")).toEqual({ reviewed: 0, total: 6 });
    expect(reviewProgress(emptyResearchStore(), 2, "dihedral")).toEqual({ reviewed: 0, total: 6 });
    expect(reviewProgress(emptyResearchStore(), 3, "exact")).toEqual({ reviewed: 0, total: 512 });
    expect(reviewProgress(emptyResearchStore(), 3, "rotation")).toEqual({ reviewed: 0, total: 140 });
    expect(reviewProgress(emptyResearchStore(), 3, "dihedral")).toEqual({ reviewed: 0, total: 102 });
  });
});

describe("serialization", () => {
  it("round-trips a store and rejects malformed imports", () => {
    let store = storeWith();
    store = assignClassification(store, "c1", "rotation", targetIdFor(L, "rotation"));
    store = setNote(store, "exact", exactId(L), "keep");
    store = setReviewed(store, "exact", exactId(L), true);

    const json = serializeResearchStore(store);
    const restored = deserializeResearchStore(json);
    expect(restored).toEqual(store);
    expect(parseResearchStore(JSON.parse(json))).toEqual(store);

    expect(() => deserializeResearchStore("{")).toThrow(/JSON/);
    expect(() => parseResearchStore({ version: 2, classifications: [], assignments: [], notes: [], reviews: [] })).toThrow(
      /version/,
    );
    expect(() => parseResearchStore({ version: 1, classifications: [], assignments: [], notes: [] })).toThrow();
    expect(() =>
      parseResearchStore({
        version: 1,
        classifications: [],
        assignments: [{ classificationId: "missing", targetType: "exact", targetId: exactId(L) }],
        notes: [],
        reviews: [],
      }),
    ).toThrow(/unknown classification/);
    expect(() =>
      parseResearchStore({
        version: 1,
        classifications: [{ id: "c1", name: "X", createdAt: "2026-01-01T00:00:00.000Z" }],
        assignments: [{ classificationId: "c1", targetType: "need", targetId: exactId(L) }],
        notes: [],
        reviews: [],
      }),
    ).toThrow(/target type/);
  });

  it("saves and loads through a storage adapter", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };

    let store = storeWith();
    store = setNote(store, "dihedral", targetIdFor(L, "dihedral"), "saved");
    saveResearchStore(store, storage);
    expect(getNote(loadResearchStore(storage), "dihedral", targetIdFor(L, "dihedral"))).toBe("saved");
    expect(loadResearchStore({ getItem: () => "nope", setItem: () => undefined })).toEqual(
      emptyResearchStore(),
    );
  });
});

describe("research data isolation", () => {
  it("does not change the 512 / 140 / 102 invariants", () => {
    let store = storeWith();
    store = assignClassification(store, "c1", "dihedral", targetIdFor(L, "dihedral"));
    void store;

    const universe = classifyUniverse(3);
    expect(universe).toHaveLength(512);
    expect(collapseClasses(universe, "rotation")).toHaveLength(140);
    expect(collapseClasses(universe, "dihedral")).toHaveLength(102);
  });
});
