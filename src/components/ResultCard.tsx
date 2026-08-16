import type { ClassifiedArrangement } from "../core/filters";
import { displayedId } from "../core/filters";
import type { ClassMode } from "../core/relationships";
import { MiniGrid } from "./MiniGrid";

interface ResultCardProps {
  item: ClassifiedArrangement;
  mode: ClassMode;
  selected: boolean;
  sharedLabels?: string[];
  onSelect: () => void;
}

export function ResultCard({ item, mode, selected, sharedLabels, onSelect }: ResultCardProps) {
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
      {sharedLabels && sharedLabels.length > 0 && (
        <div className="result-shared">
          <span>Shared with selected</span>
          <ul>
            {sharedLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
      )}
    </button>
  );
}
