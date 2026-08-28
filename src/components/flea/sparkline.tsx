import type { PricePoint } from "@/lib/tarkov/types";

export function Sparkline({ points }: { points: PricePoint[] }) {
  if (points.length < 2) {
    return <div className="h-16 rounded-md bg-raised" />;
  }

  const values = points.map((p) => p.price || p.priceMin);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const w = 320;
  const h = 64;
  const pad = 4;
  const coords = values.map((value, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (value - min) / span) * (h - pad * 2);
    return `${x},${y}`;
  });
  const last = coords[coords.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full text-primary" aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={coords.join(" ")}
      />
      {last ? (
        <circle cx={last.split(",")[0]} cy={last.split(",")[1]} r="3" fill="currentColor" />
      ) : null}
    </svg>
  );
}
