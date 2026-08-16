import type { ClassifiedArrangement } from "../core/filters";
import { exactId } from "../core/grid";
import { type ClassMode, sameClass } from "../core/relationships";
import { ResultCard } from "./ResultCard";

interface ResultGridProps {
  items: ClassifiedArrangement[];
  mode: ClassMode;
  current: ClassifiedArrangement["grid"];
  sharedLabelsFor?: (item: ClassifiedArrangement) => string[];
  onSelect: (item: ClassifiedArrangement) => void;
}

export function ResultGrid({ items, mode, current, sharedLabelsFor, onSelect }: ResultGridProps) {
  return (
    <div className={sharedLabelsFor ? "results with-relations" : "results"}>
      {items.map((item) => (
        <ResultCard
          key={exactId(item.grid)}
          item={item}
          mode={mode}
          selected={sameClass(item.grid, current, mode)}
          sharedLabels={sharedLabelsFor?.(item)}
          onSelect={() => onSelect(item)}
        />
      ))}
    </div>
  );
}
