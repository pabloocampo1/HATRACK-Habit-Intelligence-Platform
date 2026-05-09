/** Leyenda Menos → Más debajo del heatmap (cuadros compactos). */
const CELL = 4;
const GAP = 2;

const STEPS = [
  "color-empty",
  "color-scale-1",
  "color-scale-2",
  "color-scale-3",
  "color-scale-4",
] as const;

export default function HeatmapLegendScale() {
  const width = STEPS.length * CELL + (STEPS.length - 1) * GAP;

  return (
    <span className="react-calendar-heatmap inline-flex items-center gap-0.5">
      <svg
        width={width}
        height={CELL + 2}
        className="shrink-0 overflow-visible"
        aria-hidden
      >
        {STEPS.map((cls, i) => (
          <rect
            key={cls}
            className={cls}
            x={i * (CELL + GAP)}
            y={1}
            width={CELL}
            height={CELL}
          />
        ))}
      </svg>
    </span>
  );
}
