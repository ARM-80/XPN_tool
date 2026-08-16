import {
  CLASS_RELATION_IDS,
  CLASS_RELATION_LABELS,
  type ClassRelationId,
  type RelationMatchMode,
  type RelationQuery,
  emptyRelationQuery,
  toggleRelation,
} from "../core/relationships";

interface RelationSheetProps {
  query: RelationQuery;
  onChange: (query: RelationQuery) => void;
  onClose: () => void;
}

const MATCH_MODES: Array<{ id: RelationMatchMode; label: string }> = [
  { id: "all", label: "ALL" },
  { id: "any", label: "ANY" },
];

export function RelationSheet({ query, onChange, onClose }: RelationSheetProps) {
  function toggle(id: ClassRelationId) {
    onChange({
      ...query,
      relations: toggleRelation(query.relations, id),
    });
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label="Arrangement relations"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-header">
          <h2>Links / Relations</h2>
          <button type="button" onClick={onClose}>
            Done
          </button>
        </header>

        <section className="filter-group">
          <h3>Shared classifications</h3>
          <div className="filter-chips">
            {CLASS_RELATION_IDS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={query.relations.includes(id)}
                onClick={() => toggle(id)}
              >
                {CLASS_RELATION_LABELS[id]}
              </button>
            ))}
          </div>
        </section>

        <section className="filter-group">
          <h3>Match mode</h3>
          <div className="segmented">
            {MATCH_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                aria-pressed={query.match === mode.id}
                onClick={() => onChange({ ...query, match: mode.id })}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          className="sheet-clear"
          onClick={() => onChange(emptyRelationQuery())}
        >
          Clear relations
        </button>
      </div>
    </div>
  );
}
