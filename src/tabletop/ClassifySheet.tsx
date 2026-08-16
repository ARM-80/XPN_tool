import { useState } from "react";
import {
  type ResearchStore,
  addClassification,
  assignClassification,
  createClassification,
  isAssigned,
} from "../core/research";

interface ClassifySheetProps {
  store: ResearchStore;
  targetIds: string[];
  onChange: (store: ResearchStore) => void;
  onClose: () => void;
}

export function ClassifySheet({ store, targetIds, onChange, onClose }: ClassifySheetProps) {
  const [name, setName] = useState("");

  function assignAll(classificationId: string, current = store): ResearchStore {
    return targetIds.reduce(
      (next, targetId) => assignClassification(next, classificationId, "exact", targetId),
      current,
    );
  }

  function handleCreate() {
    const classification = createClassification(name);
    onChange(assignAll(classification.id, addClassification(store, classification)));
    setName("");
    onClose();
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label="Classify cards"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-header">
          <h2>{targetIds.length > 1 ? "Group / Classify" : "Classify"}</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>
        {store.classifications.length > 0 && (
          <div className="chip-list">
            {store.classifications.map((item) => {
              const assigned = targetIds.every((id) => isAssigned(store, item.id, "exact", id));
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={assigned}
                  onClick={() => {
                    onChange(assignAll(item.id));
                    onClose();
                  }}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        )}
        <label className="field">
          <span>New classification</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button type="button" className="sheet-action" disabled={!name.trim()} onClick={handleCreate}>
          Save
        </button>
      </div>
    </div>
  );
}
