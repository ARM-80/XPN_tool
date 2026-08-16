import type { ClassifiedArrangement } from "../core/filters";
import { displayedId } from "../core/filters";
import type { ClassMode } from "../core/relationships";
import { MiniGrid } from "./MiniGrid";

interface ResultCardProps {
  item: ClassifiedArrangement;
  mode: ClassMode;
  selected: boolean;
  onSelect: () => void;
}

export function ResultCard({ item, mode, selected, onSelect }: ResultCardProps) {
  return (
    <button
      type="button"
      className="result-card"
      aria-current={selected}
      onClick={onSelect}
    >
      <div className="result-thumb">
        <MiniGrid grid={item.grid} />
      </div>
      <span>Occ {item.info.occupancy}</span>
      <span>{displayedId(item, mode)}</span>
    </button>
  );
}
