import { useState } from "react";
import { InfoTip } from "../components/InfoTip";
import { AUTO_MEANINGS } from "../core/autoMeanings";
import type { Classification } from "../core/classify";
import { AutoClassList } from "./AutoClassList";

interface AutoMetaStripProps {
  info: Classification;
}

function meaning(key: string) {
  return AUTO_MEANINGS.find((item) => item.key === key);
}

function connectedLabel(info: Classification): string {
  if (info.connected === null) {
    return "Empty";
  }
  return info.connected ? "Connected" : "Disconnected";
}

export function AutoMetaStrip({ info }: AutoMetaStripProps) {
  const [open, setOpen] = useState(false);
  const items = [
    { key: "occupancy", label: `Occ ${info.occupancy}` },
    { key: "components", label: `Comp ${info.components}` },
    { key: "connected", label: connectedLabel(info) },
    { key: "rotationOrbitSize", label: `ROT ${info.rotationOrbitSize}` },
    { key: "dihedralOrbitSize", label: `D4 ${info.dihedralOrbitSize}` },
    { key: "rotationClass", label: "ROT class" },
    { key: "dihedralClass", label: "R+R class" },
  ];

  return (
    <div className="meta-strip">
      <button
        type="button"
        className="icon-button"
        aria-label="All automatic classifications"
        title="All automatic classifications"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        ⓘ
      </button>
      <div className="meta-scroll">
        {items.map((item, index) => {
          const detail = meaning(item.key);
          return (
            <span key={item.key} className="meta-item">
              {index > 0 && <span className="meta-dot">·</span>}
              <InfoTip
                label={item.label}
                title={detail?.label ?? item.label}
                body={detail?.meaning ?? ""}
              />
            </span>
          );
        })}
      </div>
      {open && (
        <div className="meta-full">
          <AutoClassList info={info} />
        </div>
      )}
    </div>
  );
}
