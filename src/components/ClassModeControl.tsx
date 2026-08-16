import { useEffect, useRef, useState } from "react";
import type { ClassMode } from "../core/relationships";

const MODES: Array<{ id: ClassMode; label: string; short: string }> = [
  { id: "exact", label: "Exact", short: "Exact" },
  { id: "rotation", label: "Rotation Class", short: "Rotation" },
  { id: "dihedral", label: "Rotation + Reflection Class", short: "R+R" },
];

interface ClassModeControlProps {
  value: ClassMode;
  onChange: (mode: ClassMode) => void;
  compact?: boolean;
}

export function ClassModeControl({ value, onChange, compact = false }: ClassModeControlProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = MODES.find((mode) => mode.id === value) ?? MODES[0];

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointer(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  if (!compact) {
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

  return (
    <div ref={ref} className="basis-menu">
      <button
        type="button"
        aria-label={`Review basis: ${current.label}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={current.label}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        {current.short} ▾
      </button>
      {open && (
        <div className="overflow-menu" role="listbox" aria-label="Review basis">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              role="option"
              aria-selected={value === mode.id}
              onClick={() => {
                onChange(mode.id);
                setOpen(false);
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
