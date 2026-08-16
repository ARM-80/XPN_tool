import { useState } from "react";
import { parseExactId } from "../core/grid";
import {
  type ResearchClassification,
  type ResearchStore,
  SCOPE_LABELS,
  assignmentCount,
  assignmentsFor,
  deleteClassification,
  unassignClassification,
  updateClassification,
} from "../core/research";
import { MiniGrid } from "../components/MiniGrid";

interface ResearchLibraryProps {
  store: ResearchStore;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (store: ResearchStore) => void;
  onClose: () => void;
}

export function ResearchLibrary({
  store,
  selectedId,
  onSelect,
  onChange,
  onClose,
}: ResearchLibraryProps) {
  const selected = store.classifications.find((item) => item.id === selectedId) ?? null;

  if (selected) {
    return (
      <ClassDetail
        key={selected.id}
        store={store}
        classification={selected}
        onBack={() => onSelect(null)}
        onChange={onChange}
      />
    );
  }

  return (
    <section className="panel">
      <header className="sheet-header">
        <h2>Research Classes</h2>
        <button type="button" onClick={onClose}>
          Back
        </button>
      </header>
      {store.classifications.length === 0 ? (
        <p className="muted">No researcher classifications yet.</p>
      ) : (
        <div className="library-list">
          {store.classifications.map((item) => (
            <button key={item.id} type="button" className="library-item" onClick={() => onSelect(item.id)}>
              <span>{item.name}</span>
              <strong>{assignmentCount(store, item.id)} assignments</strong>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function ClassDetail({
  store,
  classification,
  onBack,
  onChange,
}: {
  store: ResearchStore;
  classification: ResearchClassification;
  onBack: () => void;
  onChange: (store: ResearchStore) => void;
}) {
  const assignments = assignmentsFor(store, classification.id);
  const [name, setName] = useState(classification.name);

  return (
    <section className="panel">
      <header className="sheet-header">
        <h2>{classification.name}</h2>
        <button type="button" onClick={onBack}>
          Back
        </button>
      </header>

      <label className="field">
        <span>Name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => {
            if (name.trim()) {
              onChange(updateClassification(store, classification.id, { name }));
            } else {
              setName(classification.name);
            }
          }}
        />
      </label>
      <label className="field">
        <span>Description</span>
        <textarea
          rows={3}
          value={classification.description ?? ""}
          onChange={(event) =>
            onChange(
              updateClassification(store, classification.id, { description: event.target.value }),
            )
          }
        />
      </label>

      {(["exact", "rotation", "dihedral"] as const).map((scope) => {
        const scoped = assignments.filter((item) => item.targetType === scope);
        if (scoped.length === 0) {
          return null;
        }
        return (
          <section key={scope} className="assignment-group">
            <h3>{SCOPE_LABELS[scope]}</h3>
            <div className="assignment-cards">
              {scoped.map((item) => (
                <div key={`${item.targetType}-${item.targetId}`} className="assignment-card">
                  <div className="result-thumb">
                    <MiniGrid grid={parseExactId(item.targetId)} />
                  </div>
                  <span>{item.targetId}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        unassignClassification(
                          store,
                          classification.id,
                          item.targetType,
                          item.targetId,
                        ),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <button
        type="button"
        className="sheet-clear"
        onClick={() => {
          onChange(deleteClassification(store, classification.id));
          onBack();
        }}
      >
        Delete classification
      </button>
    </section>
  );
}
