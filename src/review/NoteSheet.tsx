import {
  type ResearchStore,
  type ResearchTargetType,
  SCOPE_EXPLANATION,
  SCOPE_LABELS,
  getNote,
  setNote,
  targetIdFor,
} from "../core/research";
import type { Grid } from "../core/grid";

interface NoteSheetProps {
  store: ResearchStore;
  grid: Grid;
  scope: ResearchTargetType;
  onScopeChange: (scope: ResearchTargetType) => void;
  onChange: (store: ResearchStore) => void;
  onClose: () => void;
}

export function NoteSheet({
  store,
  grid,
  scope,
  onScopeChange,
  onChange,
  onClose,
}: NoteSheetProps) {
  const targetId = targetIdFor(grid, scope);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label="Research note"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-header">
          <h2>Note</h2>
          <button type="button" onClick={onClose}>
            Done
          </button>
        </header>
        <p className="scope-help">{SCOPE_EXPLANATION}</p>
        <div className="segmented compact">
          {(["exact", "rotation", "dihedral"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={scope === item}
              onClick={() => onScopeChange(item)}
            >
              {SCOPE_LABELS[item]}
            </button>
          ))}
        </div>
        <textarea
          className="note-box"
          rows={6}
          value={getNote(store, scope, targetId)}
          onChange={(event) => onChange(setNote(store, scope, targetId, event.target.value))}
        />
      </div>
    </div>
  );
}
