import { useMemo, useState } from "react";
import { ArrangementInfo } from "./components/ArrangementInfo";
import { ClassMembers } from "./components/ClassMembers";
import { ClassModeControl } from "./components/ClassModeControl";
import { GridEditor } from "./components/GridEditor";
import { SizeSelector } from "./components/SizeSelector";
import { classify } from "./core/classify";
import { type Grid, type GridSize, createEmptyGrid, toggleCell } from "./core/grid";
import { type ClassMode, classMembers } from "./core/relationships";
import "./App.css";

export default function App() {
  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid(3));
  const [mode, setMode] = useState<ClassMode>("exact");

  const info = useMemo(() => classify(grid), [grid]);
  const members = useMemo(() => classMembers(grid, mode), [grid, mode]);

  function handleSize(size: GridSize) {
    setGrid(createEmptyGrid(size));
  }

  return (
    <main className="app">
      <header className="header">
        <h1>XPN_tool</h1>
        <p>Arrangement-space explorer</p>
      </header>

      <section className="panel">
        <SizeSelector value={grid.size} onChange={handleSize} />
      </section>

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
        <ClassMembers members={members} current={grid} onSelect={setGrid} />
      </section>

      <section className="panel">
        <ArrangementInfo info={info} />
      </section>
    </main>
  );
}
