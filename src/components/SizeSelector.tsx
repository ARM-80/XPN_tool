import type { GridSize } from "../core/grid";

const SIZES: GridSize[] = [1, 2, 3];

interface SizeSelectorProps {
  value: GridSize;
  onChange: (size: GridSize) => void;
}

export function SizeSelector({ value, onChange }: SizeSelectorProps) {
  return (
    <div className="segmented" role="group" aria-label="Grid size">
      {SIZES.map((size) => (
        <button
          key={size}
          type="button"
          aria-pressed={value === size}
          onClick={() => onChange(size)}
        >
          {size}×{size}
        </button>
      ))}
    </div>
  );
}
