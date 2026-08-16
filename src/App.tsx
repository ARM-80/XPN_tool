import { useMemo, useState } from "react";
import { ArrangementInfo } from "./components/ArrangementInfo";
import { ClassMembers } from "./components/ClassMembers";
import { ClassModeControl } from "./components/ClassModeControl";
import { FilterSheet } from "./components/FilterSheet";
import { GridEditor } from "./components/GridEditor";
import { ResultGrid } from "./components/ResultGrid";
import { SizeSelector } from "./components/SizeSelector";
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
import { type ClassMode, classMembers } from "./core/relationships";
import "./App.css";

export default function App() {
  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid(3));
  const [mode, setMode] = useState<ClassMode>("exact");
  const [filters, setFilters] = useState<ArrangementFilters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  const info = useMemo(() => classify(grid), [grid]);
  const universe = useMemo(() => classifyUniverse(grid.size), [grid.size]);
  const options = useMemo(() => filterOptions(universe), [universe]);
  const browse = useMemo(() => browseUniverse(universe, filters, mode), [universe, filters, mode]);
  const members = useMemo(() => classMembers(grid, mode), [grid, mode]);
  const filterCount = activeFilterCount(filters);

  function handleSize(size: GridSize) {
    setGrid(createEmptyGrid(size));
    setFilters(emptyFilters());
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

      <button type="button" className="filters-button" onClick={() => setFiltersOpen(true)}>
        Classes / Filters{filterCount > 0 ? ` · ${filterCount}` : ""}
      </button>

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
    </main>
  );
}
