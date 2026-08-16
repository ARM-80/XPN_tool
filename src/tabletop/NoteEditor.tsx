interface NoteEditorProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export function NoteEditor({ title, value, onChange, onClose }: NoteEditorProps) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-header">
          <h2>{title}</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <textarea
          className="note-box"
          rows={5}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}
