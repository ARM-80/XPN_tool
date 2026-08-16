import { exactId, gridsEqual, type Grid } from "../core/grid";
import {
  DIRECT_TRANSFORM_LABELS,
  type TransformLink,
} from "../core/transforms";
import { MiniGrid } from "./MiniGrid";

interface TransformLinksProps {
  links: TransformLink[];
  current: Grid;
  onSelect: (grid: Grid) => void;
}

export function TransformLinks({ links, current, onSelect }: TransformLinksProps) {
  return (
    <section>
      <div className="transform-links">
        {links.map((link) => (
          <button
            key={exactId(link.grid)}
            type="button"
            className="transform-link"
            aria-current={gridsEqual(link.grid, current)}
            onClick={() => onSelect(link.grid)}
          >
            <div className="result-thumb">
              <MiniGrid grid={link.grid} />
            </div>
            <ul>
              {link.labels.map((id) => (
                <li key={id}>{DIRECT_TRANSFORM_LABELS[id]}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </section>
  );
}
