import type { BoardLink, LinkDirection } from "../core/board";
import { DIRECT_TRANSFORM_LABELS } from "../core/transforms";

interface LinkEditorProps {
  link: BoardLink;
  onLabel: (label: string) => void;
  onNote: (note: string) => void;
  onDirection: (direction: LinkDirection) => void;
  onDelete: () => void;
  onClose: () => void;
}

const DIRECTIONS: Array<{ id: LinkDirection; label: string }> = [
  { id: "none", label: "Undirected" },
  { id: "forward", label: "A → B" },
  { id: "backward", label: "B → A" },
];

export function LinkEditor({
  link,
  onLabel,
  onNote,
  onDirection,
  onDelete,
  onClose,
}: LinkEditorProps) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label="Link"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-header">
          <h2>Link</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>
        {link.transformId ? (
          <p className="field">
            <span>Transformation</span>
            <span className="field-value">{DIRECT_TRANSFORM_LABELS[link.transformId]}</span>
          </p>
        ) : (
          <label className="field">
            <span>Label</span>
            <input value={link.label ?? ""} onChange={(event) => onLabel(event.target.value)} />
          </label>
        )}
        <label className="field">
          <span>Note</span>
          <textarea rows={3} value={link.note ?? ""} onChange={(event) => onNote(event.target.value)} />
        </label>
        {!link.transformId && (
          <div className="chip-list">
            {DIRECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={link.direction === item.id}
                onClick={() => onDirection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
        <button type="button" className="sheet-action" onClick={onDelete}>
          Delete link
        </button>
      </div>
    </div>
  );
}
