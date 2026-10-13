// Thin circuit-trace illustration echoing the hexagon traces in the logo:
// bundles of parallel lines with 45° bends, ending in small nodes. Each trace
// has pathLength=1 so the hero can draw it in by animating stroke-dashoffset.

type Pt = [number, number];

// Each bundle is one route repeated with a perpendicular offset per line.
// Routes stay left of x≈860, clear of the hero's text column (from 2/3 width),
// apart from one short bundle in the top-right corner.
const bundles: { route: Pt[]; offsets: Pt[]; strong?: number }[] = [
  {
    route: [[-20, 140], [180, 140], [250, 70], [480, 70], [550, 140], [640, 140]],
    offsets: [[0, 0], [0, 26], [0, 52]],
    strong: 1,
  },
  {
    route: [[-20, 470], [240, 470], [320, 390], [560, 390], [640, 470], [740, 470]],
    offsets: [[0, 0], [0, 26]],
  },
  {
    route: [[700, -20], [700, 200], [800, 300], [800, 620]],
    offsets: [[0, 0], [26, 0], [52, 0]],
    strong: 2,
  },
  {
    route: [[1460, 110], [1310, 110], [1240, 40], [1240, -20]],
    offsets: [[0, 0], [0, 26]],
  },
  {
    route: [[360, 620], [360, 560], [420, 500], [700, 500], [760, 560], [760, 620]],
    offsets: [[0, 0], [26, 0]],
  },
];

const toPath = (pts: Pt[], [dx, dy]: Pt) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"}${x + dx} ${y + dy}`).join(" ");

export default function CircuitLines({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 600"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      className={className}
    >
      {bundles.map((b, bi) =>
        b.offsets.map((o, oi) => {
          const d = toPath(b.route, o);
          const last = b.route[b.route.length - 1];
          const strong = b.strong === oi;
          return (
            <g key={`${bi}-${oi}`}>
              <path
                data-trace
                d={d}
                pathLength={1}
                stroke="currentColor"
                strokeOpacity={strong ? 0.55 : 0.2}
                strokeWidth={1.25}
                strokeDasharray="1"
                strokeDashoffset="1"
              />
              <circle
                data-node
                cx={last[0] + o[0]}
                cy={last[1] + o[1]}
                r={3.5}
                fill="var(--color-paper)"
                stroke="currentColor"
                strokeOpacity={0.45}
                strokeWidth={1.25}
              />
              {/* A signal pulse runs along the emphasised trace */}
              {strong && (
                <path
                  data-signal
                  d={d}
                  pathLength={1}
                  stroke="var(--color-accent)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray="0.004 0.016"
                  opacity={0}
                />
              )}
            </g>
          );
        }),
      )}
    </svg>
  );
}
