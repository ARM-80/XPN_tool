import type {
  ArrangementFilters,
  CenterFilter,
  ConnectivityFilter,
  FilterOptions,
  YesNoFilter,
} from "../core/filters";
import { emptyFilters, toggleFilterValue } from "../core/filters";

interface FilterSheetProps {
  options: FilterOptions;
  filters: ArrangementFilters;
  onChange: (filters: ArrangementFilters) => void;
  onClose: () => void;
}

function ChipGroup<T extends string | number>({
  label,
  values,
  selected,
  format = String,
  onToggle,
}: {
  label: string;
  values: readonly T[];
  selected: readonly T[];
  format?: (value: T) => string;
  onToggle: (value: T) => void;
}) {
  return (
    <section className="filter-group">
      <h3>{label}</h3>
      <div className="filter-chips">
        {values.map((value) => (
          <button
            key={String(value)}
            type="button"
            aria-pressed={selected.includes(value)}
            onClick={() => onToggle(value)}
          >
            {format(value)}
          </button>
        ))}
      </div>
    </section>
  );
}

const CONNECTIVITY_LABELS: Record<ConnectivityFilter, string> = {
  connected: "Connected",
  disconnected: "Disconnected",
  empty: "None / empty",
};

const CENTER_LABELS: Record<CenterFilter, string> = {
  occupied: "Occupied",
  empty: "Empty",
  na: "N/A",
};

const YES_NO_LABELS: Record<YesNoFilter, string> = {
  yes: "Yes",
  no: "No",
};

export function FilterSheet({ options, filters, onChange, onClose }: FilterSheetProps) {
  function toggle<K extends keyof ArrangementFilters>(key: K, value: ArrangementFilters[K][number]) {
    onChange({
      ...filters,
      [key]: toggleFilterValue(filters[key] as never[], value) as ArrangementFilters[K],
    });
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label="Arrangement filters"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-header">
          <h2>Filters</h2>
          <button type="button" onClick={onClose}>
            Done
          </button>
        </header>

        <ChipGroup
          label="Occupancy"
          values={options.occupancy}
          selected={filters.occupancy}
          onToggle={(value) => toggle("occupancy", value)}
        />
        <ChipGroup
          label="Connectivity"
          values={options.connectivity}
          selected={filters.connectivity}
          format={(value) => CONNECTIVITY_LABELS[value]}
          onToggle={(value) => toggle("connectivity", value)}
        />
        <ChipGroup
          label="Component count"
          values={options.components}
          selected={filters.components}
          onToggle={(value) => toggle("components", value)}
        />
        <ChipGroup
          label="Center"
          values={options.center}
          selected={filters.center}
          format={(value) => CENTER_LABELS[value]}
          onToggle={(value) => toggle("center", value)}
        />
        <ChipGroup
          label="Corner occupied count"
          values={options.cornerOccupiedCount}
          selected={filters.cornerOccupiedCount}
          onToggle={(value) => toggle("cornerOccupiedCount", value)}
        />
        <ChipGroup
          label="Edge occupied count"
          values={options.edgeOccupiedCount}
          selected={filters.edgeOccupiedCount}
          onToggle={(value) => toggle("edgeOccupiedCount", value)}
        />
        <ChipGroup
          label="Rotational symmetry"
          values={options.rotationalSymmetryOrder}
          selected={filters.rotationalSymmetryOrder}
          format={(value) => `Order ${value}`}
          onToggle={(value) => toggle("rotationalSymmetryOrder", value)}
        />
        <ChipGroup
          label="Reflection symmetry"
          values={options.reflectionSymmetry}
          selected={filters.reflectionSymmetry}
          format={(value) => YES_NO_LABELS[value]}
          onToggle={(value) => toggle("reflectionSymmetry", value)}
        />
        <ChipGroup
          label="Rotation orbit size"
          values={options.rotationOrbitSize}
          selected={filters.rotationOrbitSize}
          onToggle={(value) => toggle("rotationOrbitSize", value)}
        />
        <ChipGroup
          label="Dihedral orbit size"
          values={options.dihedralOrbitSize}
          selected={filters.dihedralOrbitSize}
          onToggle={(value) => toggle("dihedralOrbitSize", value)}
        />

        <button type="button" className="sheet-clear" onClick={() => onChange(emptyFilters())}>
          Clear filters
        </button>
      </div>
    </div>
  );
}
