interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  /** If true, lower values are "better" (e.g. CPI) — last point colors green/red accordingly */
  invertTrend?: boolean;
}

export function Sparkline({
  values,
  width = 80,
  height = 28,
  color,
  invertTrend = false,
}: SparklineProps) {
  const valid = values.filter((v) => v > 0 && isFinite(v));
  if (valid.length < 2) return null;

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min || 1;

  const pad = 2;
  const innerH = height - pad * 2;
  const innerW = width - pad * 2;

  const pts = valid.map((v, i) => ({
    x: pad + (i / (valid.length - 1)) * innerW,
    y: pad + innerH - ((v - min) / range) * innerH,
  }));

  const pathD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Determine trend color from last two points
  let trendColor = color ?? "var(--accent)";
  if (!color && valid.length >= 2) {
    const last = valid[valid.length - 1];
    const prev = valid[valid.length - 2];
    const improving = invertTrend ? last < prev : last > prev;
    trendColor = improving ? "var(--green)" : "var(--red)";
  }

  const last = pts[pts.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
    >
      <path
        d={pathD}
        fill="none"
        stroke={trendColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <circle cx={last.x} cy={last.y} r="2.5" fill={trendColor} />
    </svg>
  );
}
