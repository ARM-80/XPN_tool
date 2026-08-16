import { useEffect, useRef, useState, type ReactNode } from "react";

interface InfoTipProps {
  label: ReactNode;
  title: string;
  body: string;
  className?: string;
}

export function InfoTip({ label, title, body, className }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

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
    <span
      ref={ref}
      className={`info-tip${className ? ` ${className}` : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={`${title}. ${body}`}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      {open && (
        <span className="info-pop" role="tooltip">
          <strong>{title}</strong>
          {body}
        </span>
      )}
    </span>
  );
}
