import { getRingGeometry } from "@/lib/design/progress-ring";

type ProgressRingProps = {
  label: string;
  percentage: number;
  size?: number;
  strokeWidth?: number;
};

const DEFAULT_SIZE = 80;
const DEFAULT_STROKE = 8;

/**
 * Anneau circulaire SVG : indicateur principal unique des objectifs
 * d’épargne (correction mockup n°5 : pas de barre redondante).
 * % au centre, role progressbar, reduced-motion respecté via CSS.
 */
export function ProgressRing({
  label,
  percentage,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const { circumference, dashOffset, progress } = getRingGeometry({
    percentage,
    radius,
  });
  const center = size / 2;

  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(progress)}
      className="premium-ring"
      role="progressbar"
    >
      <svg
        aria-hidden="true"
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        width={size}
      >
        <circle
          className="premium-ring-track"
          cx={center}
          cy={center}
          fill="none"
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="premium-ring-fill"
          cx={center}
          cy={center}
          fill="none"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="premium-ring-center" aria-hidden="true">
        <strong className="font-amount">{Math.round(progress)}&nbsp;%</strong>
      </div>
    </div>
  );
}
