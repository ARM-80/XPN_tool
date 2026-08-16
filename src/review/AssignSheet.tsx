import { useState } from "react";
import {
  type ResearchStore,
  type ResearchTargetType,
  SCOPE_EXPLANATION,
  SCOPE_LABELS,
  addClassification,
  createClassification,
  isAssigned,
  targetIdFor,
  toggleAssignment,
} from "../core/research";
import type { Grid } from "../core/grid";

interface AssignSheetProps {
  store: ResearchStore;
  grid: Grid;
  defaultScope: ResearchTargetType;
  onChange: (store: ResearchStore) => void;
  onClose: () => void;
}

const SCOPES: Array<{ id: ResearchTargetType; label: string }> = [
  { id: "exact", label: "This exact arrangement" },
  { id: "rotation", label: "This rotation class" },
  { id: "dihedral", label: "This rotation + reflection class" },
];

export function AssignSheet({ store, grid, defaultScope, onChange, onClose }: AssignSheetProps) {
  const [scope, setScope] = useState<ResearchTargetType>(defaultScope);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const targetId = targetIdFor(grid, scope);

  function handleCreate() {
    const classification = createClassification(name, description);
    let next = addClassification(store, classification);
    next = toggleAssignment(next, classification.id, scope, targetId);
    onChange(next);
    setName("");
    setDescription("");
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label="Assign research classification"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-header">
          <h2>Add / Assign</h2>
          <button type="button" onClick={onClose}>
            Done
          </button>
        </header>

        <p className="scope-help">{SCOPE_EXPLANATION}</p>

        <section className="filter-group">
          <h3>Apply to</h3>
          <div className="segmented stack">
            {SCOPES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={scope === item.id}
                onClick={() => setScope(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-group">
          <h3>Existing</h3>
          {store.classifications.length === 0 ? (
            <p className="muted">None yet.</p>
          ) : (
            <div className="filter-chips">
              {store.classifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isAssigned(store, item.id, scope, targetId)}
                  onClick={() => onChange(toggleAssignment(store, item.id, scope, targetId))}
                >
                  {item.name} · {SCOPE_LABELS[scope]}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="filter-group">
          <h3>Create new</h3>
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="field">
            <span>Optional description</span>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <p className="muted">
            Will apply to {SCOPES.find((item) => item.id === scope)?.label.toLowerCase()}.
          </p>
          <button
            type="button"
            className="sheet-clear"
            disabled={name.trim().length === 0}
            onClick={handleCreate}
          >
            Save
          </button>
        </section>
      </div>
    </div>
  );
}
