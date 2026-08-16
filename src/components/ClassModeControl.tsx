import type { ClassMode } from "../core/relationships";

const MODES: Array<{ id: ClassMode; label: string }> = [
  { id: "exact", label: "Exact" },
  { id: "rotation", label: "Rotation Class" },
  { id: "dihedral", label: "Rotation + Reflection Class" },
];

interface ClassModeControlProps {
  value: ClassMode;
  onChange: (mode: ClassMode) => void;
}

export function ClassModeControl({ value, onChange }: ClassModeControlProps) {
  return (
    <div className="segmented stack" role="group" aria-label="Class mode">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          aria-pressed={value === mode.id}
          onClick={() => onChange(mode.id)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
