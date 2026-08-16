import { useState } from "react";
import { AUTO_MEANINGS } from "../core/autoMeanings";
import type { Classification } from "../core/classify";

interface AutoClassListProps {
  info: Classification;
}

function displayValue(info: Classification, key: string): string {
  switch (key) {
    case "exactId":
      return info.exactId;
    case "occupancy":
      return String(info.occupancy);
    case "connected":
      return info.connected === null ? "—" : info.connected ? "Yes" : "No";
    case "components":
      return String(info.components);
    case "center":
      return info.centerOccupied === null ? "N/A" : info.centerOccupied ? "Occupied" : "Empty";
    case "corners":
      return String(info.cornerOccupiedCount);
    case "edges":
      return String(info.edgeOccupiedCount);
    case "rotationalSymmetry":
      return String(info.rotationalSymmetryOrder);
    case "reflectionSymmetry":
      return info.reflectionSymmetry ? "Yes" : "No";
    case "rotationOrbitSize":
      return String(info.rotationOrbitSize);
    case "dihedralOrbitSize":
      return String(info.dihedralOrbitSize);
    case "rotationClass":
      return info.rotationClassId;
    case "dihedralClass":
      return info.dihedralClassId;
    default:
      return "";
  }
}

export function AutoClassList({ info }: AutoClassListProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="auto-list">
      {AUTO_MEANINGS.map((item) => (
        <button
          key={item.key}
          type="button"
          className="auto-item"
          aria-expanded={openKey === item.key}
          onClick={() => setOpenKey((current) => (current === item.key ? null : item.key))}
        >
          <span>{item.label}</span>
          <strong>{displayValue(info, item.key)}</strong>
          {openKey === item.key && <p>{item.meaning}</p>}
        </button>
      ))}
    </div>
  );
}
