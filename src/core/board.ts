import { allGrids, exactId, isExactId, occupancy, parseExactId, type Grid } from "./grid";
import {
  DIRECT_TRANSFORMS,
  isDirectTransformId,
  type DirectTransformId,
} from "./transforms";

export const BOARD_STORE_VERSION = 1;
export const BOARD_STORAGE_KEY = "xpn-tool.board.v1";

export type LinkDirection = "none" | "forward" | "backward";

export interface CardInstance {
  id: string;
  exactId: string;
  x: number;
  y: number;
  label?: string;
  note?: string;
}

export interface BoardLink {
  id: string;
  fromCardInstanceId: string;
  toCardInstanceId: string;
  direction: LinkDirection;
  label?: string;
  note?: string;
  transformId?: DirectTransformId;
}

export interface BoardStore {
  version: typeof BOARD_STORE_VERSION;
  cards: CardInstance[];
  links: BoardLink[];
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const DIRECTIONS: readonly LinkDirection[] = ["none", "forward", "backward"];

export function emptyBoard(): BoardStore {
  return {
    version: BOARD_STORE_VERSION,
    cards: [],
    links: [],
  };
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneBoard(board: BoardStore): BoardStore {
  return {
    version: BOARD_STORE_VERSION,
    cards: board.cards.map((card) => ({ ...card })),
    links: board.links.map((link) => ({ ...link })),
  };
}

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function occupancyDeck(count: number): Grid[] {
  if (!Number.isInteger(count) || count < 0 || count > 9) {
    throw new Error(`Occupancy deck must be 0..9, received ${count}`);
  }
  return allGrids(3).filter((grid) => occupancy(grid) === count);
}

export function addCard(
  board: BoardStore,
  arrangementId: string,
  x: number,
  y: number,
  extras: { id?: string; label?: string; note?: string } = {},
): BoardStore {
  if (!isExactId(arrangementId)) {
    throw new Error(`Invalid arrangement ID: ${arrangementId}`);
  }
  parseExactId(arrangementId);
  const next = cloneBoard(board);
  const card: CardInstance = {
    id: extras.id ?? newId("card"),
    exactId: arrangementId,
    x,
    y,
  };
  const label = optionalText(extras.label);
  const note = optionalText(extras.note);
  if (label) {
    card.label = label;
  }
  if (note) {
    card.note = note;
  }
  next.cards.push(card);
  return next;
}

export function moveCard(board: BoardStore, cardId: string, x: number, y: number): BoardStore {
  const next = cloneBoard(board);
  const card = next.cards.find((item) => item.id === cardId);
  if (!card) {
    throw new Error(`Unknown card: ${cardId}`);
  }
  card.x = x;
  card.y = y;
  return next;
}

export function removeCard(board: BoardStore, cardId: string): BoardStore {
  const next = cloneBoard(board);
  next.cards = next.cards.filter((item) => item.id !== cardId);
  next.links = next.links.filter(
    (item) => item.fromCardInstanceId !== cardId && item.toCardInstanceId !== cardId,
  );
  return next;
}

export function duplicateCard(
  board: BoardStore,
  cardId: string,
  offset = { x: 28, y: 28 },
): BoardStore {
  const card = board.cards.find((item) => item.id === cardId);
  if (!card) {
    throw new Error(`Unknown card: ${cardId}`);
  }
  return addCard(board, card.exactId, card.x + offset.x, card.y + offset.y, {
    label: card.label,
    note: card.note,
  });
}

export function setCardLabel(board: BoardStore, cardId: string, label: string): BoardStore {
  const next = cloneBoard(board);
  const card = next.cards.find((item) => item.id === cardId);
  if (!card) {
    throw new Error(`Unknown card: ${cardId}`);
  }
  const trimmed = optionalText(label);
  if (trimmed) {
    card.label = trimmed;
  } else {
    delete card.label;
  }
  return next;
}

export function setCardNote(board: BoardStore, cardId: string, note: string): BoardStore {
  const next = cloneBoard(board);
  const card = next.cards.find((item) => item.id === cardId);
  if (!card) {
    throw new Error(`Unknown card: ${cardId}`);
  }
  const trimmed = optionalText(note);
  if (trimmed) {
    card.note = trimmed;
  } else {
    delete card.note;
  }
  return next;
}

export function addLink(
  board: BoardStore,
  fromCardInstanceId: string,
  toCardInstanceId: string,
  extras: {
    id?: string;
    direction?: LinkDirection;
    label?: string;
    note?: string;
    transformId?: DirectTransformId;
  } = {},
): BoardStore {
  if (fromCardInstanceId === toCardInstanceId) {
    throw new Error("A link needs two different cards");
  }
  const ids = new Set(board.cards.map((card) => card.id));
  if (!ids.has(fromCardInstanceId) || !ids.has(toCardInstanceId)) {
    throw new Error("Link refers to a missing card");
  }
  if (extras.transformId !== undefined && !isDirectTransformId(extras.transformId)) {
    throw new Error(`Invalid transform ID: ${extras.transformId}`);
  }
  const next = cloneBoard(board);
  const link: BoardLink = {
    id: extras.id ?? newId("link"),
    fromCardInstanceId,
    toCardInstanceId,
    direction: extras.direction ?? "none",
  };
  const label = optionalText(extras.label);
  const note = optionalText(extras.note);
  if (label) {
    link.label = label;
  }
  if (note) {
    link.note = note;
  }
  if (extras.transformId) {
    link.transformId = extras.transformId;
  }
  next.links.push(link);
  return next;
}

export function applyDirectTransform(
  board: BoardStore,
  cardId: string,
  transformId: DirectTransformId,
  offset = { x: 136, y: 0 },
  ids: { cardId?: string; linkId?: string } = {},
): BoardStore {
  if (!isDirectTransformId(transformId)) {
    throw new Error(`Invalid transform ID: ${transformId}`);
  }
  const card = board.cards.find((item) => item.id === cardId);
  if (!card) {
    throw new Error(`Unknown card: ${cardId}`);
  }
  const nextId = ids.cardId ?? newId("card");
  const nextExactId = exactId(DIRECT_TRANSFORMS[transformId](parseExactId(card.exactId)));
  const withCard = addCard(board, nextExactId, card.x + offset.x, card.y + offset.y, { id: nextId });
  return addLink(withCard, card.id, nextId, {
    id: ids.linkId,
    direction: "none",
    transformId,
  });
}

export function removeLink(board: BoardStore, linkId: string): BoardStore {
  const next = cloneBoard(board);
  next.links = next.links.filter((item) => item.id !== linkId);
  return next;
}

export function setLinkLabel(board: BoardStore, linkId: string, label: string): BoardStore {
  const next = cloneBoard(board);
  const link = next.links.find((item) => item.id === linkId);
  if (!link) {
    throw new Error(`Unknown link: ${linkId}`);
  }
  const trimmed = optionalText(label);
  if (trimmed) {
    link.label = trimmed;
  } else {
    delete link.label;
  }
  return next;
}

export function setLinkNote(board: BoardStore, linkId: string, note: string): BoardStore {
  const next = cloneBoard(board);
  const link = next.links.find((item) => item.id === linkId);
  if (!link) {
    throw new Error(`Unknown link: ${linkId}`);
  }
  const trimmed = optionalText(note);
  if (trimmed) {
    link.note = trimmed;
  } else {
    delete link.note;
  }
  return next;
}

export function setLinkDirection(
  board: BoardStore,
  linkId: string,
  direction: LinkDirection,
): BoardStore {
  if (!DIRECTIONS.includes(direction)) {
    throw new Error(`Invalid link direction: ${direction}`);
  }
  const next = cloneBoard(board);
  const link = next.links.find((item) => item.id === linkId);
  if (!link) {
    throw new Error(`Unknown link: ${linkId}`);
  }
  link.direction = direction;
  return next;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCard(value: unknown): CardInstance {
  if (!isRecord(value) || typeof value.id !== "string" || value.id.length === 0) {
    throw new Error("Invalid card");
  }
  if (typeof value.exactId !== "string" || !isExactId(value.exactId)) {
    throw new Error("Invalid card arrangement ID");
  }
  if (typeof value.x !== "number" || typeof value.y !== "number" || !Number.isFinite(value.x) || !Number.isFinite(value.y)) {
    throw new Error("Invalid card position");
  }
  const card: CardInstance = {
    id: value.id,
    exactId: value.exactId,
    x: value.x,
    y: value.y,
  };
  if (value.label !== undefined) {
    if (typeof value.label !== "string") {
      throw new Error("Invalid card label");
    }
    const label = optionalText(value.label);
    if (label) {
      card.label = label;
    }
  }
  if (value.note !== undefined) {
    if (typeof value.note !== "string") {
      throw new Error("Invalid card note");
    }
    const note = optionalText(value.note);
    if (note) {
      card.note = note;
    }
  }
  return card;
}

function parseLink(value: unknown, cardIds: Set<string>): BoardLink {
  if (!isRecord(value) || typeof value.id !== "string" || value.id.length === 0) {
    throw new Error("Invalid link");
  }
  if (typeof value.fromCardInstanceId !== "string" || typeof value.toCardInstanceId !== "string") {
    throw new Error("Invalid link endpoints");
  }
  if (!cardIds.has(value.fromCardInstanceId) || !cardIds.has(value.toCardInstanceId)) {
    throw new Error("Link refers to a missing card");
  }
  if (value.fromCardInstanceId === value.toCardInstanceId) {
    throw new Error("A link needs two different cards");
  }
  if (!DIRECTIONS.includes(value.direction as LinkDirection)) {
    throw new Error("Invalid link direction");
  }
  const link: BoardLink = {
    id: value.id,
    fromCardInstanceId: value.fromCardInstanceId,
    toCardInstanceId: value.toCardInstanceId,
    direction: value.direction as LinkDirection,
  };
  if (value.label !== undefined) {
    if (typeof value.label !== "string") {
      throw new Error("Invalid link label");
    }
    const label = optionalText(value.label);
    if (label) {
      link.label = label;
    }
  }
  if (value.note !== undefined) {
    if (typeof value.note !== "string") {
      throw new Error("Invalid link note");
    }
    const note = optionalText(value.note);
    if (note) {
      link.note = note;
    }
  }
  if (value.transformId !== undefined) {
    if (typeof value.transformId !== "string" || !isDirectTransformId(value.transformId)) {
      throw new Error("Invalid transform ID");
    }
    link.transformId = value.transformId;
  }
  return link;
}

export function parseBoardStore(data: unknown): BoardStore {
  if (!isRecord(data)) {
    throw new Error("Board data must be an object");
  }
  if (data.version !== BOARD_STORE_VERSION) {
    throw new Error("Unsupported board data version");
  }
  if (!Array.isArray(data.cards) || !Array.isArray(data.links)) {
    throw new Error("Board data is missing cards or links");
  }
  const cards = data.cards.map(parseCard);
  const ids = new Set(cards.map((card) => card.id));
  if (ids.size !== cards.length) {
    throw new Error("Duplicate card IDs");
  }
  return {
    version: BOARD_STORE_VERSION,
    cards,
    links: data.links.map((item) => parseLink(item, ids)),
  };
}

export function serializeBoardStore(board: BoardStore): string {
  return `${JSON.stringify(parseBoardStore(board), null, 2)}\n`;
}

export function deserializeBoardStore(json: string): BoardStore {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("Board data is not valid JSON");
  }
  return parseBoardStore(data);
}

export function loadBoardStore(storage?: StorageLike | null): BoardStore {
  const source = storage ?? (typeof localStorage === "undefined" ? null : localStorage);
  if (!source) {
    return emptyBoard();
  }
  const raw = source.getItem(BOARD_STORAGE_KEY);
  if (!raw) {
    return emptyBoard();
  }
  try {
    return deserializeBoardStore(raw);
  } catch {
    return emptyBoard();
  }
}

export function saveBoardStore(board: BoardStore, storage?: StorageLike | null): void {
  const target = storage ?? (typeof localStorage === "undefined" ? null : localStorage);
  if (!target) {
    return;
  }
  target.setItem(BOARD_STORAGE_KEY, serializeBoardStore(board));
}

export function arrangementIdFromGrid(grid: Grid): string {
  return exactId(grid);
}
