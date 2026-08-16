import { useMemo, useRef, useState } from "react";
import { ClassModeControl } from "../components/ClassModeControl";
import { GridEditor } from "../components/GridEditor";
import { SizeSelector } from "../components/SizeSelector";
import { classify } from "../core/classify";
import { type GridSize } from "../core/grid";
import {
  type ResearchStore,
  type ResearchTargetType,
  SCOPE_EXPLANATION,
  SCOPE_LABELS,
  applicableClassifications,
  deserializeResearchStore,
  getNote,
  isReviewed,
  nextUnreviewedIndex,
  reviewProgress,
  reviewSequence,
  serializeResearchStore,
  setNote,
  setReviewed,
  targetIdFor,
} from "../core/research";
import { AssignSheet } from "./AssignSheet";
import { AutoClassList } from "./AutoClassList";
import { ResearchLibrary } from "./ResearchLibrary";

interface ReviewModeProps {
  store: ResearchStore;
  onChange: (store: ResearchStore) => void;
}

export function ReviewMode({ store, onChange }: ReviewModeProps) {
  const [size, setSize] = useState<GridSize>(3);
  const [basis, setBasis] = useState<ResearchTargetType>("exact");
  const [index, setIndex] = useState(0);
  const [noteScope, setNoteScope] = useState<ResearchTargetType>("exact");
  const [assignOpen, setAssignOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryId, setLibraryId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<ResearchStore | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sequence = useMemo(() => reviewSequence(size, basis), [size, basis]);
  const safeIndex = Math.min(index, Math.max(sequence.length - 1, 0));
  const grid = sequence[safeIndex];
  const info = useMemo(() => (grid ? classify(grid) : null), [grid]);
  const progress = useMemo(() => reviewProgress(store, size, basis), [store, size, basis]);
  const targetId = grid ? targetIdFor(grid, basis) : "";
  const noteTargetId = grid ? targetIdFor(grid, noteScope) : "";
  const reviewed = grid ? isReviewed(store, basis, targetId) : false;
  const applied = useMemo(
    () => (grid ? applicableClassifications(store, grid) : []),
    [store, grid],
  );

  function handleSize(next: GridSize) {
    setSize(next);
    setIndex(0);
  }

  function handleBasis(next: ResearchTargetType) {
    setBasis(next);
    setNoteScope(next);
    setIndex(0);
  }

  function exportData() {
    const blob = new Blob([serializeResearchStore(store)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "xpn-research.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(file: File) {
    setImportError(null);
    file.text().then((text) => {
      try {
        setPendingImport(deserializeResearchStore(text));
      } catch (error) {
        setPendingImport(null);
        setImportError(error instanceof Error ? error.message : "Import failed");
      }
    });
  }

  if (!grid || !info) {
    return null;
  }

  if (libraryOpen) {
    return (
      <>
        <header className="header">
          <h1>Review</h1>
        </header>
        <ResearchLibrary
          store={store}
          selectedId={libraryId}
          onSelect={setLibraryId}
          onChange={onChange}
          onClose={() => {
            setLibraryOpen(false);
            setLibraryId(null);
          }}
        />
      </>
    );
  }

  return (
    <>
      <header className="header">
        <h1>Review</h1>
        <p>Inspect one arrangement at a time.</p>
        <SizeSelector value={size} onChange={handleSize} />
      </header>

      <section className="panel">
        <h2 className="panel-title">Review basis</h2>
        <ClassModeControl value={basis} onChange={handleBasis} />
      </section>

      <section className="panel summary">
        <div>
          <span>Reviewed</span>
          <strong>
            {progress.reviewed} / {progress.total}
          </strong>
        </div>
        <div>
          <span>Position</span>
          <strong>
            {safeIndex + 1} / {sequence.length}
          </strong>
        </div>
      </section>

      <section className="review-stage">
        <button
          type="button"
          className="nav-button"
          disabled={safeIndex === 0}
          onClick={() => setIndex((current) => Math.max(0, current - 1))}
        >
          Previous
        </button>
        <div className="review-grid">
          <GridEditor grid={grid} readOnly />
        </div>
        <button
          type="button"
          className="nav-button"
          disabled={safeIndex >= sequence.length - 1}
          onClick={() => setIndex((current) => Math.min(sequence.length - 1, current + 1))}
        >
          Next
        </button>
      </section>

      <button
        type="button"
        className="quiet-button"
        onClick={() => {
          const next = nextUnreviewedIndex(store, sequence, basis, safeIndex);
          if (next !== null) {
            setIndex(next);
          }
        }}
      >
        Jump to unreviewed
      </button>

      <section className="panel">
        <h2 className="panel-title">Automatic classifications</h2>
        <AutoClassList info={info} />
      </section>

      <section className="panel">
        <h2 className="panel-title">Research classifications</h2>
        <p className="scope-help">{SCOPE_EXPLANATION}</p>
        <div className="research-chips">
          {applied.length === 0 ? (
            <p className="muted">None assigned.</p>
          ) : (
            applied.map((item) => (
              <span key={`${item.classification.id}-${item.targetType}`} className="research-chip">
                {item.classification.name}
                <em>{SCOPE_LABELS[item.targetType]}</em>
              </span>
            ))
          )}
        </div>
        <button type="button" className="quiet-button" onClick={() => setAssignOpen(true)}>
          + Add / Assign
        </button>
      </section>

      <section className="panel">
        <h2 className="panel-title">Research notes</h2>
        <div className="segmented">
          {(["exact", "rotation", "dihedral"] as const).map((scope) => (
            <button
              key={scope}
              type="button"
              aria-pressed={noteScope === scope}
              onClick={() => setNoteScope(scope)}
            >
              {SCOPE_LABELS[scope]}
            </button>
          ))}
        </div>
        <textarea
          className="note-box"
          rows={5}
          value={getNote(store, noteScope, noteTargetId)}
          onChange={(event) => onChange(setNote(store, noteScope, noteTargetId, event.target.value))}
        />
      </section>

      <button
        type="button"
        className="filters-button"
        aria-pressed={reviewed}
        onClick={() => onChange(setReviewed(store, basis, targetId, !reviewed))}
      >
        {reviewed ? "Reviewed" : "Mark Reviewed"}
      </button>

      <div className="action-row">
        <button type="button" className="quiet-button" onClick={() => setLibraryOpen(true)}>
          Research Classes
        </button>
        <button type="button" className="quiet-button" onClick={exportData}>
          Export Research Data
        </button>
      </div>
      <button type="button" className="quiet-button" onClick={() => fileRef.current?.click()}>
        Import Research Data
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleImportFile(file);
          }
          event.target.value = "";
        }}
      />
      {importError && <p className="error">{importError}</p>}

      {assignOpen && (
        <AssignSheet
          store={store}
          grid={grid}
          defaultScope={basis}
          onChange={onChange}
          onClose={() => setAssignOpen(false)}
        />
      )}

      {pendingImport && (
        <div className="sheet-backdrop" onClick={() => setPendingImport(null)}>
          <div className="sheet" role="dialog" aria-label="Replace research data" onClick={(event) => event.stopPropagation()}>
            <h2>Replace research data?</h2>
            <p>This replaces all local research classifications, notes, and review status.</p>
            <div className="action-row">
              <button type="button" className="quiet-button" onClick={() => setPendingImport(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="filters-button"
                onClick={() => {
                  onChange(pendingImport);
                  setPendingImport(null);
                }}
              >
                Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
