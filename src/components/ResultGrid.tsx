import type { ClassifiedArrangement } from "../core/filters";
import { exactId } from "../core/grid";
import { type ClassMode, sameClass } from "../core/relationships";
import { ResultCard } from "./ResultCard";

interface ResultGridProps {
  items: ClassifiedArrangement[];
  mode: ClassMode;
  current: ClassifiedArrangement["grid"];
  onSelect: (item: ClassifiedArrangement) => void;
}

export function ResultGrid({ items, mode, current, onSelect }: ResultGridProps) {
  return (
    <div className="results">
      {items.map((item) => (
        <ResultCard
          key={exactId(item.grid)}
          item={item}
          mode={mode}
          selected={sameClass(item.grid, current, mode)}
          onSelect={() => onSelect(item)}
        />
      ))}
    </div>
  );
}
