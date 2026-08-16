import { DIRECT_TRANSFORM_IDS, DIRECT_TRANSFORM_LABELS } from "../core/transforms";

interface CardMenuProps {
  x: number;
  y: number;
  multi: boolean;
  onTransform: (id: (typeof DIRECT_TRANSFORM_IDS)[number]) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onClassify: () => void;
  onLink: () => void;
  onNote: () => void;
  onInfo: () => void;
  onClose: () => void;
}

export function CardMenu({
  x,
  y,
  multi,
  onTransform,
  onDuplicate,
  onRemove,
  onClassify,
  onLink,
  onNote,
  onInfo,
  onClose,
}: CardMenuProps) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="card-menu"
        role="menu"
        style={{ left: x, top: y }}
        onClick={(event) => event.stopPropagation()}
      >
        {!multi &&
          DIRECT_TRANSFORM_IDS.map((id) => (
            <button key={id} type="button" role="menuitem" onClick={() => onTransform(id)}>
              {DIRECT_TRANSFORM_LABELS[id]}
            </button>
          ))}
        <button type="button" role="menuitem" onClick={onClassify}>
          {multi ? "Group / Classify" : "Classify"}
        </button>
        {!multi && (
          <button type="button" role="menuitem" onClick={onLink}>
            Link
          </button>
        )}
        {!multi && (
          <button type="button" role="menuitem" onClick={onNote}>
            Note
          </button>
        )}
        {!multi && (
          <button type="button" role="menuitem" onClick={onInfo}>
            Info
          </button>
        )}
        {!multi && (
          <button type="button" role="menuitem" onClick={onDuplicate}>
            Duplicate
          </button>
        )}
        <button type="button" role="menuitem" onClick={onRemove}>
          Remove
        </button>
      </div>
    </div>
  );
}
