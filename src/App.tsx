import { useMemo, useState } from "react";
import { ArrangementInfo } from "./components/ArrangementInfo";
import { ClassMembers } from "./components/ClassMembers";
import { ClassModeControl } from "./components/ClassModeControl";
import { FilterSheet } from "./components/FilterSheet";
import { GridEditor } from "./components/GridEditor";
import { RelationSheet } from "./components/RelationSheet";
import { ResultGrid } from "./components/ResultGrid";
import { SizeSelector } from "./components/SizeSelector";
import { TransformLinks } from "./components/TransformLinks";
import { classify } from "./core/classify";
import {
  type ArrangementFilters,
  activeFilterCount,
  browseUniverse,
  classifyUniverse,
  emptyFilters,
  filterOptions,
} from "./core/filters";
import { type Grid, type GridSize, createEmptyGrid, toggleCell } from "./core/grid";
import {
  CLASS_RELATION_LABELS,
  type ClassMode,
  type RelationQuery,
  classMembers,
  emptyRelationQuery,
  satisfiedActiveRelations,
} from "./core/relationships";
import { transformLinksFrom } from "./core/transforms";
import "./App.css";

export default function App() {
  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid(3));
  const [mode, setMode] = useState<ClassMode>("exact");
  const [filters, setFilters] = useState<ArrangementFilters>(emptyFilters);
  const [relationQuery, setRelationQuery] = useState<RelationQuery>(emptyRelationQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [relationsOpen, setRelationsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

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
    <main className="app">
      <header className="header">
        <h1>XPN_tool</h1>
        <p>Arrangement-space explorer</p>
        <SizeSelector value={grid.size} onChange={handleSize} />
      </header>

      <section className="panel">
        <GridEditor
          grid={grid}
          onToggle={(row, col) => setGrid((current) => toggleCell(current, row, col))}
        />
      </section>

      <section className="panel">
        <ClassModeControl value={mode} onChange={setMode} />
      </section>

      <section className="panel">
        <ArrangementInfo info={info} />
      </section>

      <TransformLinks links={transformLinks} current={grid} onSelect={setGrid} />

      <div className="action-row">
        <button type="button" className="filters-button" onClick={() => setFiltersOpen(true)}>
          Classes / Filters{filterCount > 0 ? ` · ${filterCount}` : ""}
        </button>
        <button type="button" className="filters-button" onClick={() => setRelationsOpen(true)}>
          Links / Relations{relationCount > 0 ? ` · ${relationCount}` : ""}
        </button>
      </div>

      <section className="panel summary">
        <div>
          <span>Matching arrangements</span>
          <strong>{browse.matchingCount}</strong>
        </div>
        <div>
          <span>Displayed classes</span>
          <strong>{browse.displayedCount}</strong>
        </div>
      </section>

      <section className="panel">
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
      </section>

      {members.length > 1 && (
        <section className="panel">
          <button
            type="button"
            className="expand-button"
            aria-expanded={membersOpen}
            onClick={() => setMembersOpen((open) => !open)}
          >
            {membersOpen ? "Hide" : "Show"} class members · {members.length}
          </button>
          {membersOpen && (
            <ClassMembers members={members} current={grid} onSelect={setGrid} />
          )}
        </section>
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
    </main>
  );
}
