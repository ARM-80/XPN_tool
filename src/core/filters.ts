import { type Classification, classify } from "./classify";
import { type Grid, type GridSize, allGrids, parseExactId } from "./grid";
import { type ClassMode, classId } from "./relationships";

export type ConnectivityFilter = "connected" | "disconnected" | "empty";
export type CenterFilter = "occupied" | "empty" | "na";
export type YesNoFilter = "yes" | "no";

export interface ArrangementFilters {
  occupancy: number[];
  connectivity: ConnectivityFilter[];
  components: number[];
  center: CenterFilter[];
  cornerOccupiedCount: number[];
  edgeOccupiedCount: number[];
  rotationalSymmetryOrder: number[];
  reflectionSymmetry: YesNoFilter[];
  rotationOrbitSize: number[];
  dihedralOrbitSize: number[];
}

export interface ClassifiedArrangement {
  grid: Grid;
  info: Classification;
}

export interface FilterOptions {
  occupancy: number[];
  connectivity: ConnectivityFilter[];
  components: number[];
  center: CenterFilter[];
  cornerOccupiedCount: number[];
  edgeOccupiedCount: number[];
  rotationalSymmetryOrder: number[];
  reflectionSymmetry: YesNoFilter[];
  rotationOrbitSize: number[];
  dihedralOrbitSize: number[];
}

export interface BrowseResult {
  matching: ClassifiedArrangement[];
  displayed: ClassifiedArrangement[];
  matchingCount: number;
  displayedCount: number;
}

export function emptyFilters(): ArrangementFilters {
  return {
    occupancy: [],
    connectivity: [],
    components: [],
    center: [],
    cornerOccupiedCount: [],
    edgeOccupiedCount: [],
    rotationalSymmetryOrder: [],
    reflectionSymmetry: [],
    rotationOrbitSize: [],
    dihedralOrbitSize: [],
  };
}

export function connectivityValue(info: Classification): ConnectivityFilter {
  if (info.connected === null) {
    return "empty";
  }
  return info.connected ? "connected" : "disconnected";
}

export function centerValue(info: Classification): CenterFilter {
  if (info.centerOccupied === null) {
    return "na";
  }
  return info.centerOccupied ? "occupied" : "empty";
}

function allows<T>(selected: readonly T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

export function matchesFilters(info: Classification, filters: ArrangementFilters): boolean {
  return (
    allows(filters.occupancy, info.occupancy) &&
    allows(filters.connectivity, connectivityValue(info)) &&
    allows(filters.components, info.components) &&
    allows(filters.center, centerValue(info)) &&
    allows(filters.cornerOccupiedCount, info.cornerOccupiedCount) &&
    allows(filters.edgeOccupiedCount, info.edgeOccupiedCount) &&
    allows(filters.rotationalSymmetryOrder, info.rotationalSymmetryOrder) &&
    allows(filters.reflectionSymmetry, info.reflectionSymmetry ? "yes" : "no") &&
    allows(filters.rotationOrbitSize, info.rotationOrbitSize) &&
    allows(filters.dihedralOrbitSize, info.dihedralOrbitSize)
  );
}

export function classifyUniverse(size: GridSize): ClassifiedArrangement[] {
  return allGrids(size).map((grid) => ({ grid, info: classify(grid) }));
}

export function filterUniverse(
  universe: ClassifiedArrangement[],
  filters: ArrangementFilters,
): ClassifiedArrangement[] {
  return universe.filter((item) => matchesFilters(item.info, filters));
}

export function collapseClasses(
  arrangements: ClassifiedArrangement[],
  mode: ClassMode,
): ClassifiedArrangement[] {
  if (mode === "exact") {
    return arrangements;
  }

  const seen = new Map<string, ClassifiedArrangement>();
  for (const item of arrangements) {
    const id = classId(item.grid, mode);
    if (seen.has(id)) {
      continue;
    }
    const canonical = parseExactId(id);
    seen.set(id, { grid: canonical, info: classify(canonical) });
  }

  return [...seen.values()];
}

export function browseUniverse(
  universe: ClassifiedArrangement[],
  filters: ArrangementFilters,
  mode: ClassMode,
): BrowseResult {
  const matching = filterUniverse(universe, filters);
  const displayed = collapseClasses(matching, mode);
  return {
    matching,
    displayed,
    matchingCount: matching.length,
    displayedCount: displayed.length,
  };
}

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

export function filterOptions(universe: ClassifiedArrangement[]): FilterOptions {
  return {
    occupancy: uniqueSorted(universe.map((item) => item.info.occupancy)),
    connectivity: (["connected", "disconnected", "empty"] as const).filter((value) =>
      universe.some((item) => connectivityValue(item.info) === value),
    ),
    components: uniqueSorted(universe.map((item) => item.info.components)),
    center: (["occupied", "empty", "na"] as const).filter((value) =>
      universe.some((item) => centerValue(item.info) === value),
    ),
    cornerOccupiedCount: uniqueSorted(universe.map((item) => item.info.cornerOccupiedCount)),
    edgeOccupiedCount: uniqueSorted(universe.map((item) => item.info.edgeOccupiedCount)),
    rotationalSymmetryOrder: uniqueSorted(
      universe.map((item) => item.info.rotationalSymmetryOrder),
    ),
    reflectionSymmetry: (["yes", "no"] as const).filter((value) =>
      universe.some((item) => (item.info.reflectionSymmetry ? "yes" : "no") === value),
    ),
    rotationOrbitSize: uniqueSorted(universe.map((item) => item.info.rotationOrbitSize)),
    dihedralOrbitSize: uniqueSorted(universe.map((item) => item.info.dihedralOrbitSize)),
  };
}

export function activeFilterCount(filters: ArrangementFilters): number {
  return Object.values(filters).reduce((sum, values) => sum + values.length, 0);
}

export function toggleFilterValue<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function displayedId(item: ClassifiedArrangement, mode: ClassMode): string {
  return classId(item.grid, mode);
}
