export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const SNAP = 20;
const FLUSH = 3;

function overlap(a1: number, a2: number, b1: number, b2: number, pad: number) {
  return a1 < b2 + pad && a2 > b1 - pad;
}

function near(a: number, b: number, epsilon: number) {
  return Math.abs(a - b) <= epsilon;
}

export function areSnapped(a: Rect, b: Rect, epsilon = FLUSH): boolean {
  const sideBySide =
    (near(a.x + a.w, b.x, epsilon) || near(b.x + b.w, a.x, epsilon)) &&
    overlap(a.y, a.y + a.h, b.y, b.y + b.h, epsilon);
  const stacked =
    (near(a.y + a.h, b.y, epsilon) || near(b.y + b.h, a.y, epsilon)) &&
    overlap(a.x, a.x + a.w, b.x, b.x + b.w, epsilon);
  return sideBySide || stacked;
}

export function connectedIds(start: string, items: Array<{ id: string } & Rect>): string[] {
  const rects = new Map(items.map((item) => [item.id, item]));
  if (!rects.has(start)) {
    return [start];
  }
  const seen = new Set<string>([start]);
  const queue = [start];
  while (queue.length > 0) {
    const id = queue.pop()!;
    const a = rects.get(id)!;
    for (const [other, b] of rects) {
      if (!seen.has(other) && areSnapped(a, b)) {
        seen.add(other);
        queue.push(other);
      }
    }
  }
  return [...seen];
}

export function splitOccupancy(
  occupancies: number[],
  active: number,
  occupancy: number,
): { host: { occupancies: number[]; active: number }; popped: number } | null {
  if (occupancies.length < 2 || !occupancies.includes(occupancy)) {
    return null;
  }
  const next = occupancies.filter((item) => item !== occupancy);
  return {
    host: { occupancies: next, active: active === occupancy ? next[0] : active },
    popped: occupancy,
  };
}

export function mergeOccupancies(target: number[], source: number[]): number[] {
  const next = [...target];
  for (const occupancy of source) {
    if (!next.includes(occupancy)) {
      next.push(occupancy);
    }
  }
  return next;
}

export function snapDelta(moving: Rect[], others: Rect[], threshold = SNAP): { dx: number; dy: number } {
  let bestX = threshold;
  let bestY = threshold;
  let dx = 0;
  let dy = 0;

  for (const item of moving) {
    for (const other of others) {
      if (overlap(item.y, item.y + item.h, other.y, other.y + other.h, threshold)) {
        for (const candidate of [other.x - item.w, other.x + other.w, other.x, other.x + other.w - item.w]) {
          const distance = Math.abs(item.x - candidate);
          if (distance <= bestX) {
            bestX = distance;
            dx = candidate - item.x;
          }
        }
      }
      if (overlap(item.x, item.x + item.w, other.x, other.x + other.w, threshold)) {
        for (const candidate of [other.y - item.h, other.y + other.h, other.y, other.y + other.h - item.h]) {
          const distance = Math.abs(item.y - candidate);
          if (distance <= bestY) {
            bestY = distance;
            dy = candidate - item.y;
          }
        }
      }
    }
  }

  return { dx, dy };
}

export function snapToRects(moving: Rect, others: Rect[], threshold = SNAP): { x: number; y: number } {
  const { dx, dy } = snapDelta([moving], others, threshold);
  return { x: moving.x + dx, y: moving.y + dy };
}
