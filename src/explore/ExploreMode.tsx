import { useMemo, useState } from "react";
import { ClassMembers } from "../components/ClassMembers";
import { ClassModeControl } from "../components/ClassModeControl";
import { FilterSheet } from "../components/FilterSheet";
import { GridEditor } from "../components/GridEditor";
import { RelationSheet } from "../components/RelationSheet";
import { ResultGrid } from "../components/ResultGrid";
import { SizeSelector } from "../components/SizeSelector";
import { TransformLinks } from "../components/TransformLinks";
import { classify } from "../core/classify";
import {
  type ArrangementFilters,
  activeFilterCount,
  browseUniverse,
  classifyUniverse,
  emptyFilters,
  filterOptions,
} from "../core/filters";
import { type Grid, type GridSize, createEmptyGrid, toggleCell } from "../core/grid";
import {
  CLASS_RELATION_LABELS,
  type ClassMode,
  type RelationQuery,
  classMembers,
  emptyRelationQuery,
  satisfiedActiveRelations,
} from "../core/relationships";
import { transformLinksFrom } from "../core/transforms";
import { AutoMetaStrip } from "../review/AutoMetaStrip";

export function ExploreMode() {
  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid(3));
  const [mode, setMode] = useState<ClassMode>("exact");
  const [filters, setFilters] = useState<ArrangementFilters>(emptyFilters);
  const [relationQuery, setRelationQuery] = useState<RelationQuery>(emptyRelationQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [relationsOpen, setRelationsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [transformsOpen, setTransformsOpen] = useState(false);

  const info = useMemo(() => classify(grid), [grid]);
  const universe = useMemo(() => classifyUniverse(grid.size), [grid.size]);
  const options = useMemo(() => filterOptions(universe), [universe]);
  const browse = useMemo(
    () => browseUniverse(universe, filters, mode, relationQuery, info),
    [universe, filters, mode, relationQuery, info],
  );
  const members = useMemo(() => classMembers(grid, mode), [grid, mode]);
  const transformLinks = useMemo(() => transformLinksFrom(grid), [grid]);
  const filterCount = activeFilterCount(filters);
  const relationCount = relationQuery.relations.length;

  function handleSize(size: GridSize) {
    setGrid(createEmptyGrid(size));
    setFilters(emptyFilters());
    setRelationQuery(emptyRelationQuery());
    setMembersOpen(false);
  }

  return (
    <>
      <header className="topbar">
        <h1>Explore</h1>
      </header>

      <div className="toolbar">
        <SizeSelector value={grid.size} onChange={handleSize} compact />
        <ClassModeControl value={mode} onChange={setMode} compact />
      </div>

      <section className="review-grid">
        <GridEditor
          grid={grid}
          large
          onToggle={(row, col) => setGrid((current) => toggleCell(current, row, col))}
        />
      </section>

      <AutoMetaStrip info={info} />

      <div className="text-actions">
        <button type="button" className="text-action" onClick={() => setFiltersOpen(true)}>
          Filters{filterCount > 0 ? ` · ${filterCount}` : ""}
        </button>
        <button type="button" className="text-action" onClick={() => setRelationsOpen(true)}>
          Relations{relationCount > 0 ? ` · ${relationCount}` : ""}
        </button>
        <button
          type="button"
          className="text-action"
          aria-expanded={transformsOpen}
          onClick={() => setTransformsOpen((open) => !open)}
        >
          Transforms
        </button>
      </div>

      {transformsOpen && (
        <TransformLinks links={transformLinks} current={grid} onSelect={setGrid} />
      )}

      <p className="progress-line">
        <span>{browse.matchingCount} matching</span>
        <span>{browse.displayedCount} shown</span>
      </p>

      <ResultGrid
        items={browse.displayed}
        mode={mode}
        current={grid}
        sharedLabelsFor={
          relationCount === 0
            ? undefined
            : (item) =>
                satisfiedActiveRelations(info, item.info, relationQuery).map(
                  (id) => CLASS_RELATION_LABELS[id],
                )
        }
        onSelect={(item) => {
          setGrid(item.grid);
          setMembersOpen(false);
        }}
      />

      {members.length > 1 && (
        <div>
          <button
            type="button"
            className="text-action"
            aria-expanded={membersOpen}
            onClick={() => setMembersOpen((open) => !open)}
          >
            {membersOpen ? "Hide" : "Show"} class members · {members.length}
          </button>
          {membersOpen && (
            <ClassMembers members={members} current={grid} onSelect={setGrid} />
          )}
        </div>
      )}

      {filtersOpen && (
        <FilterSheet
          options={options}
          filters={filters}
          onChange={setFilters}
          onClose={() => setFiltersOpen(false)}
        />
      )}

      {relationsOpen && (
        <RelationSheet
          query={relationQuery}
          onChange={setRelationQuery}
          onClose={() => setRelationsOpen(false)}
        />
      )}
    </>
  );
}
