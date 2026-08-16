import { useEffect, useRef, useState, type ReactNode } from "react";

interface OverflowMenuProps {
  label?: string;
  children: ReactNode;
}

export function OverflowMenu({ label = "More actions", children }: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="overflow">
      <button
        type="button"
        className="icon-button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        title={label}
        onClick={() => setOpen((current) => !current)}
      >
        ⋯
      </button>
      {open && (
        <div className="overflow-menu" role="menu" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}
