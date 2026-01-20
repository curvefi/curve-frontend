/**
 * Replicates recharts legend component line to illustrate price line pattern and color
 */
export const LegendLine = ({ color, dash }: { color: string; dash?: string }) => (
  <svg width="20" height="2">
    <line x1="0" y1="1" x2="20" y2="1" stroke={color} strokeWidth={2} strokeDasharray={dash} />
  </svg>
)
