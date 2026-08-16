import { useMemo, useRef, useState } from "react";
import { ClassModeControl } from "../components/ClassModeControl";
import { GridEditor } from "../components/GridEditor";
import { InfoTip } from "../components/InfoTip";
import { OverflowMenu } from "../components/OverflowMenu";
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
  setReviewed,
  targetIdFor,
} from "../core/research";
import { AssignSheet } from "./AssignSheet";
import { AutoMetaStrip } from "./AutoMetaStrip";
import { NoteSheet } from "./NoteSheet";
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
  const [noteOpen, setNoteOpen] = useState(false);
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
  const reviewed = grid ? isReviewed(store, basis, targetId) : false;
  const applied = useMemo(
    () => (grid ? applicableClassifications(store, grid) : []),
    [store, grid],
  );
  const hasNote = useMemo(() => {
    if (!grid) {
      return false;
    }
    return (["exact", "rotation", "dihedral"] as const).some(
      (scope) => getNote(store, scope, targetIdFor(grid, scope)).length > 0,
    );
  }, [store, grid]);

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
        <header className="topbar">
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
      <header className="topbar">
        <h1>Review</h1>
        <OverflowMenu>
          <button
            type="button"
            role="menuitem"
            onClick={() => setLibraryOpen(true)}
          >
            Research Classes
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const next = nextUnreviewedIndex(store, sequence, basis, safeIndex);
              if (next !== null) {
                setIndex(next);
              }
            }}
          >
            Jump to unreviewed
          </button>
          <button type="button" role="menuitem" onClick={exportData}>
            Export Research Data
          </button>
          <button type="button" role="menuitem" onClick={() => fileRef.current?.click()}>
            Import Research Data
          </button>
        </OverflowMenu>
      </header>

      <div className="toolbar">
        <SizeSelector value={size} onChange={handleSize} compact />
        <ClassModeControl value={basis} onChange={handleBasis} compact />
        <InfoTip
          label="ⓘ"
          title="Review basis"
          body="Exact reviews one orientation. Rotation reviews one representative per rotation class. R+R reviews one representative per rotation and reflection class."
        />
      </div>

      <section className="review-stage">
        <button
          type="button"
          className="nav-arrow"
          aria-label="Previous"
          title="Previous"
          disabled={safeIndex === 0}
          onClick={() => setIndex((current) => Math.max(0, current - 1))}
        >
          ‹
        </button>
        <div className="review-grid">
          <GridEditor grid={grid} readOnly large />
        </div>
        <button
          type="button"
          className="nav-arrow"
          aria-label="Next"
          title="Next"
          disabled={safeIndex >= sequence.length - 1}
          onClick={() => setIndex((current) => Math.min(sequence.length - 1, current + 1))}
        >
          ›
        </button>
      </section>

      <div className="progress-line">
        <span>
          {safeIndex + 1} / {sequence.length}
        </span>
        <span>{progress.reviewed} reviewed</span>
        <button
          type="button"
          className={reviewed ? "review-mark on" : "review-mark"}
          aria-label="Mark this item reviewed"
          aria-pressed={reviewed}
          title="Mark this item reviewed"
          onClick={() => onChange(setReviewed(store, basis, targetId, !reviewed))}
        >
          {reviewed ? "✓" : "○"}
        </button>
      </div>

      <AutoMetaStrip info={info} />

      <section className="research-block">
        {applied.length === 0 ? (
          <p className="muted slim">No research classifications</p>
        ) : (
          <div className="research-chips">
            {applied.map((item) => (
              <span key={`${item.classification.id}-${item.targetType}`} className="research-chip">
                {item.classification.name}
                <InfoTip
                  label={<em>{SCOPE_LABELS[item.targetType]}</em>}
                  title={SCOPE_LABELS[item.targetType]}
                  body={SCOPE_EXPLANATION}
                />
              </span>
            ))}
          </div>
        )}
        <button type="button" className="text-action" onClick={() => setAssignOpen(true)}>
          + classification
        </button>
      </section>

      <button type="button" className="text-action" onClick={() => setNoteOpen(true)}>
        {hasNote ? "Note •" : "Add note"}
      </button>

      {importError && <p className="error">{importError}</p>}

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

      {assignOpen && (
        <AssignSheet
          store={store}
          grid={grid}
          defaultScope={basis}
          onChange={onChange}
          onClose={() => setAssignOpen(false)}
        />
      )}

      {noteOpen && (
        <NoteSheet
          store={store}
          grid={grid}
          scope={noteScope}
          onScopeChange={setNoteScope}
          onChange={onChange}
          onClose={() => setNoteOpen(false)}
        />
      )}

      {pendingImport && (
        <div className="sheet-backdrop" onClick={() => setPendingImport(null)}>
          <div
            className="sheet"
            role="dialog"
            aria-label="Replace research data"
            onClick={(event) => event.stopPropagation()}
          >
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
