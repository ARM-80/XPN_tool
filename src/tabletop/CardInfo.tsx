import type { Classification } from "../core/classify";

interface CardInfoProps {
  info: Classification;
  onClose: () => void;
}

export function CardInfo({ info, onClose }: CardInfoProps) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="info-pop sheet-pop"
        role="dialog"
        aria-label="Arrangement information"
        onClick={(event) => event.stopPropagation()}
      >
        <p>
          <strong>Exact ID</strong> {info.exactId}
        </p>
        <p>
          <strong>Occupancy</strong> {info.occupancy}
        </p>
        <p>
          <strong>Connected</strong> {info.connected === null ? "—" : info.connected ? "Yes" : "No"}
        </p>
        <p>
          <strong>Components</strong> {info.components}
        </p>
        <p>
          <strong>Rotation class</strong> {info.rotationClassId}
        </p>
        <p>
          <strong>R+R class</strong> {info.dihedralClassId}
        </p>
        <p>
          <strong>Rotational symmetry</strong> {info.rotationalSymmetryOrder}
        </p>
        <p>
          <strong>Reflection symmetry</strong> {info.reflectionSymmetry ? "Yes" : "No"}
        </p>
        <button type="button" className="text-action" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
