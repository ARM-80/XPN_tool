import type { Grid } from "../core/grid";
import { exactId, gridsEqual } from "../core/grid";
import { MiniGrid } from "./MiniGrid";

interface ClassMembersProps {
  members: Grid[];
  current: Grid;
  onSelect: (grid: Grid) => void;
}

export function ClassMembers({ members, current, onSelect }: ClassMembersProps) {
  return (
    <div className="members">
      {members.map((member) => {
        const id = exactId(member);
        return (
          <button
            key={id}
            type="button"
            aria-label={`Arrangement ${id}`}
            aria-current={gridsEqual(member, current)}
            onClick={() => onSelect(member)}
          >
            <MiniGrid grid={member} />
          </button>
        );
      })}
    </div>
  );
}
