import { describe, expect, it } from "vitest";
import { classifyUniverse, collapseClasses } from "./filters";
import { createGrid, exactId, occupancy } from "./grid";
import {
  addCard,
  addLink,
  deserializeBoardStore,
  duplicateCard,
  emptyBoard,
  loadBoardStore,
  moveCard,
  occupancyDeck,
  parseBoardStore,
  removeCard,
  removeLink,
  saveBoardStore,
  serializeBoardStore,
  setCardLabel,
  setLinkDirection,
  setLinkLabel,
} from "./board";

const A = exactId(
  createGrid(3, [
    [1, 1, 0],
    [1, 0, 0],
    [0, 0, 0],
  ]),
);
const B = exactId(
  createGrid(3, [
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
  ]),
);

describe("occupancy decks", () => {
  it("contains every 3x3 arrangement for each occupancy 0..9", () => {
    const sizes = [1, 9, 36, 84, 126, 126, 84, 36, 9, 1];
    let total = 0;
    for (let count = 0; count <= 9; count += 1) {
      const deck = occupancyDeck(count);
      expect(deck).toHaveLength(sizes[count]);
      expect(deck.every((grid) => occupancy(grid) === count)).toBe(true);
      total += deck.length;
    }
    expect(total).toBe(512);
  });
});

describe("card instances", () => {
  it("places and moves cards freely without changing arrangement identity", () => {
    let board = addCard(emptyBoard(), A, 40, 80, { id: "c1" });
    board = moveCard(board, "c1", 120, 160);
    expect(board.cards[0]).toMatchObject({ id: "c1", exactId: A, x: 120, y: 160 });
  });

  it("allows duplicate instances of the same arrangement", () => {
    let board = addCard(emptyBoard(), A, 0, 0, { id: "c1" });
    board = addCard(board, A, 20, 20, { id: "c2" });
    expect(board.cards).toHaveLength(2);
    expect(board.cards.map((card) => card.exactId)).toEqual([A, A]);
    expect(board.cards[0].id).not.toBe(board.cards[1].id);
  });

  it("duplicates an instance to a new position", () => {
    let board = addCard(emptyBoard(), A, 10, 10, { id: "c1", label: "seen" });
    board = duplicateCard(board, "c1", { x: 30, y: 40 });
    expect(board.cards).toHaveLength(2);
    expect(board.cards[1].exactId).toBe(A);
    expect(board.cards[1].x).toBe(40);
    expect(board.cards[1].y).toBe(50);
    expect(board.cards[1].label).toBe("seen");
    expect(board.cards[1].id).not.toBe("c1");
  });
});

describe("links", () => {
  it("creates, labels, orients, and deletes links", () => {
    let board = addCard(emptyBoard(), A, 0, 0, { id: "c1" });
    board = addCard(board, B, 80, 0, { id: "c2" });
    board = addLink(board, "c1", "c2", { id: "l1", label: "same form" });
    expect(board.links[0]).toMatchObject({
      id: "l1",
      fromCardInstanceId: "c1",
      toCardInstanceId: "c2",
      direction: "none",
      label: "same form",
    });

    board = setLinkDirection(board, "l1", "forward");
    board = setLinkLabel(board, "l1", "rotation");
    expect(board.links[0].direction).toBe("forward");
    expect(board.links[0].label).toBe("rotation");

    board = removeLink(board, "l1");
    expect(board.links).toHaveLength(0);
  });

  it("removes links when a card is removed", () => {
    let board = addCard(emptyBoard(), A, 0, 0, { id: "c1" });
    board = addCard(board, B, 80, 0, { id: "c2" });
    board = addLink(board, "c1", "c2", { id: "l1" });
    board = removeCard(board, "c1");
    expect(board.cards).toHaveLength(1);
    expect(board.links).toHaveLength(0);
  });
});

describe("board serialization", () => {
  it("round-trips cards, positions, and links", () => {
    let board = addCard(emptyBoard(), A, 12, 24, { id: "c1", label: "alpha", note: "keep" });
    board = addCard(board, A, 40, 60, { id: "c2" });
    board = addLink(board, "c1", "c2", { id: "l1", direction: "backward", label: "?" });
    const json = serializeBoardStore(board);
    expect(deserializeBoardStore(json)).toEqual(board);
    expect(parseBoardStore(JSON.parse(json))).toEqual(board);
  });

  it("rejects malformed board data", () => {
    expect(() => deserializeBoardStore("{")).toThrow(/JSON/);
    expect(() => parseBoardStore({ version: 2, cards: [], links: [] })).toThrow(/version/);
    expect(() =>
      parseBoardStore({
        version: 1,
        cards: [{ id: "c1", exactId: A, x: 0, y: 0 }],
        links: [{ id: "l1", fromCardInstanceId: "c1", toCardInstanceId: "missing", direction: "none" }],
      }),
    ).toThrow(/missing card/);
  });

  it("saves and loads through a storage adapter", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };
    let board = addCard(emptyBoard(), A, 8, 16, { id: "c1" });
    board = setCardLabel(board, "c1", "desk");
    saveBoardStore(board, storage);
    expect(loadBoardStore(storage).cards[0]).toMatchObject({ exactId: A, x: 8, y: 16, label: "desk" });
  });
});

describe("board isolation", () => {
  it("does not change the 512 / 140 / 102 invariants", () => {
    let board = addCard(emptyBoard(), A, 0, 0);
    board = addCard(board, A, 10, 10);
    void board;
    const universe = classifyUniverse(3);
    expect(universe).toHaveLength(512);
    expect(collapseClasses(universe, "rotation")).toHaveLength(140);
    expect(collapseClasses(universe, "dihedral")).toHaveLength(102);
  });
});
