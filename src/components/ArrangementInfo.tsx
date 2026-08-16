import type { Classification } from "../core/classify";

interface ArrangementInfoProps {
  info: Classification;
}

export function ArrangementInfo({ info }: ArrangementInfoProps) {
  return (
    <dl className="info">
      <dt>Exact ID</dt>
      <dd>{info.exactId}</dd>
      <dt>Occupancy</dt>
      <dd>
        {info.occupancy} / {info.occupancy + info.empty}
      </dd>
      <dt>Connected</dt>
      <dd>{info.connected === null ? "—" : info.connected ? "Yes" : "No"}</dd>
      <dt>Components</dt>
      <dd>{info.components}</dd>
      <dt>Rotation class ID</dt>
      <dd>{info.rotationClassId}</dd>
      <dt>Rotation orbit size</dt>
      <dd>{info.rotationOrbitSize}</dd>
      <dt>Rotation + reflection class ID</dt>
      <dd>{info.dihedralClassId}</dd>
      <dt>Dihedral orbit size</dt>
      <dd>{info.dihedralOrbitSize}</dd>
    </dl>
  );
}
